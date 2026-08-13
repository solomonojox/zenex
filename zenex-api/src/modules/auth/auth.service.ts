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
                create: {
                  tenantId,
                  title: 'New Provider',
                  location: '',
                  // Seed a sensible Mon–Fri 9–5 week so a new provider is
                  // bookable as soon as they list a service. Without this
                  // every date shows "no openings" with no explanation.
                  availability: {
                    create: [1, 2, 3, 4, 5].map((dayOfWeek) => ({
                      dayOfWeek,
                      startMinute: 9 * 60,
                      endMinute: 17 * 60,
                    })),
                  },
                },
              },
            }
          : {}),
        wallet: { create: {} },
      },
    });

    // Welcome email. MailService swallows its own failures, so a mail outage
    // can never cost someone their registration — but providers in particular
    // need this one: it is where they learn that verification and working
    // hours are what stand between them and their first booking.
    if (user.role === Role.PROVIDER) {
      await this.mail.welcomeProvider({
        to: user.email,
        name: user.firstName,
      });
    } else if (user.role === Role.CLIENT) {
      await this.mail.welcomeClient({ to: user.email, name: user.firstName });
    }

    // Confirmation link. Nothing is gated on being verified yet — blocking
    // signup on an email round-trip would cost more registrations than the
    // bad addresses are worth — but it gives us a way to spot typos, and a
    // verified flag to gate on later once volume justifies it.
    await this.issueEmailVerification(user);

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
   * Issue a fresh confirmation link.
   *
   * Same token shape as password reset — "<rowId>.<secret>", raw secret emailed,
   * only the argon2 hash stored — so there is one scheme to audit rather than
   * two. Any earlier unused tokens are consumed first, so an old link in an old
   * inbox stops working once a new one is requested.
   */
  private async issueEmailVerification(user: {
    id: string;
    email: string;
    firstName: string;
  }) {
    await this.prisma.emailVerificationToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const secret = crypto.randomBytes(32).toString('hex');
    const row = await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: await argon2.hash(secret),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    await this.mail.verifyEmail({
      to: user.email,
      name: user.firstName,
      token: `${row.id}.${secret}`,
    });
  }

  /** Consume a confirmation token and mark the address verified. */
  async verifyEmail(token: string) {
    const sep = token.indexOf('.');
    const rowId = sep > 0 ? token.slice(0, sep) : '';
    const secret = sep > 0 ? token.slice(sep + 1) : '';
    const invalid = new BadRequestException(
      'This confirmation link is invalid or has expired.',
    );
    if (!rowId || !secret) throw invalid;

    const matched = await this.prisma.emailVerificationToken.findUnique({
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

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: matched.userId },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: matched.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { ok: true, message: 'Email confirmed. Thanks!' };
  }

  /**
   * Re-send the confirmation link. Deliberately returns the same response
   * whether or not the address exists or is already verified — otherwise this
   * becomes an endpoint for testing which emails have Zenex accounts.
   */
  async resendVerification(email: string, tenantSlug: string) {
    const tenantId = await this.resolveTenantId(tenantSlug);
    const user = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
    });

    if (user && !user.emailVerified) {
      await this.issueEmailVerification(user);
    }

    return {
      ok: true,
      message: 'If that address needs confirming, a link is on its way.',
    };
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
