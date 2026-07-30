import {
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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
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

    // Confirm the token exists and is not revoked.
    const stored = await this.prisma.refreshToken.findFirst({
      where: { userId: payload.sub, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!stored || !(await argon2.verify(stored.tokenHash, refreshToken))) {
      throw new UnauthorizedException('Invalid refresh token');
    }

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
