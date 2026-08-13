import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { Public } from '../../common/decorators/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';

/**
 * Liveness/readiness probe for the hosting platform (Render, Railway, etc.).
 * Public and un-throttled so health checks are never rate-limited.
 */
@Controller('health')
export class HealthController {
  private readonly startedAt = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  @Public()
  @SkipThrottle()
  @Get()
  async check() {
    let database = 'up';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'down';
    }

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      database,
      // Whether email is actually being sent. "log-mode" means every template
      // is written to the server log and nothing leaves the box — the usual
      // reason a user reports never receiving a welcome email. Only the mode
      // and the sender are exposed; the token is never returned.
      mail: this.mail.status,
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      env: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
    };
  }
}
