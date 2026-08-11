import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../../common/enums/role.enum';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  /** Resolve a tenant by its slug (subdomain), falling back to the default. */
  private async resolveTenantId(tenantSlug: string): Promise<string> {
    const slug =
      tenantSlug || this.config.get<string>('tenancy.defaultTenant', 'demo');
    let tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    // Auto-provision the default tenant in dev so signup works out of the box.
    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: { slug, name: slug },
      });
    }
    return tenant.id;
  }

  async register(dto: RegisterDto, tenantSlug: string) {
    const tenantId = await this.resolveTenantId(tenantSlug);

    const existing = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email } },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: dto.role,
        // Create the matching profile + wallet in one transaction-friendly nest.
        ...(dto.role === Role.CLIENT
          ? { clientProfile: { create: {} } }
          : {}),
        ...(dto.role === Role.PROVIDER
          ? {
              providerProfile: {
                create: { tenantId, title: 'New Provider', location: '' },
              },
            }
          : {}),
        wallet: { create: {} },
      },
    });

    return this.issueTokens(user.id, user.email, user.role, user.tenantId);
  }

  async login(dto: LoginDto, tenantSlug: string) {
    const tenantId = await this.resolveTenantId(tenantSlug);

    const user = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email } },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user.id, user.email, user.role, user.tenantId);
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; email: string; role: string; tenantId: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check every live token for this user, not just the newest — otherwise
    // signing in on a second device would break refresh on the first.
    const candidates = await this.prisma.refreshToken.findMany({
      where: {
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    let stored: (typeof candidates)[number] | null = null;
    for (const c of candidates) {
      if (await argon2.verify(c.tokenHash, refreshToken)) {
        stored = c;
        break;
      }
    }
    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Rotate: this token is spent once used.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(
      payload.sub,
      payload.email,
      payload.role,
      payload.tenantId,
    );
  }

  /**
   * Emails a reset link. Always returns the same response whether or not the
   * address exists, so the endpoint can't be used to enumerate accounts.
   */
  async forgotPassword(email: string, tenantSlug: string) {
    const tenantId = await this.resolveTenantId(tenantSlug);
    const user = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
    });

    if (user) {
      // Raw secret goes in the email; only its hash is stored. The row id is
      // prefixed onto the emailed token so verification is a direct lookup
      // rather than a scan over every pending reset.
      const secret = crypto.randomBytes(32).toString('hex');
      const row = await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: await argon2.hash(secret),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });
      await this.mail.passwordReset({
        to: user.email,
        name: user.firstName,
        token: `${row.id}.${secret}`,
      });
    }

    return {
      ok: true,
      message: 'If that email is registered, a reset link is on its way.',
    };
  }

  /** Consume a reset token, set the new password, and revoke all sessions. */
  async resetPassword(token: string, password: string) {
    // Token format is "<rowId>.<secret>" — look the row up directly.
    const sep = token.indexOf('.');
    const rowId = sep > 0 ? token.slice(0, sep) : '';
    const secret = sep > 0 ? token.slice(sep + 1) : '';
    const invalid = new BadRequestException(
      'This reset link is invalid or has expired.',
    );
    if (!rowId || !secret) throw invalid;

    const matched = await this.prisma.passwordResetToken.findUnique({
      where: { id: rowId },
    });
    if (
      !matched ||
      matched.usedAt ||
      matched.expiresAt <= new Date() ||
      !(await argon2.verify(matched.tokenHash, secret))
    ) {
      throw invalid;
    }

    const passwordHash = await argon2.hash(password);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: matched.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: matched.id },
        data: { usedAt: new Date() },
      }),
      // Force re-login everywhere after a password change.
      this.prisma.refreshToken.updateMany({
        where: { userId: matched.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { ok: true, message: 'Password updated — you can sign in now.' };
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { loggedOut: true };
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: string,
    tenantId: string,
  ) {
    const payload = { sub: userId, email, role, tenantId };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: this.config.get<string>('jwt.accessExpiresIn'),
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
    });

    // Persist a hash of the refresh token so it can be revoked server-side.
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: await argon2.hash(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }
}
