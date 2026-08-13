import { Controller, Get, Logger } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';

/**
 * Warm-up endpoint for a spun-down instance.
 *
 * Render's free tier stops the container after ~15 minutes of no traffic. The
 * next request then pays for a cold start — container boot, Node start, Nest
 * bootstrap, and a fresh Prisma connection to Supabase — which is why the first
 * page load after a quiet spell can take the better part of a minute.
 *
 * This differs from `/health` in intent, and the difference matters:
 *
 *   /health      — is the service correct right now? Render's own health check
 *                  points here and will restart the service if it fails.
 *   /wake-server — get the service ready. Never reports failure in a way that
 *                  could trigger a restart, and deliberately opens a database
 *                  connection so the pool is warm before a real user arrives.
 *
 * Call it from the frontend when someone lands on the site, or from an uptime
 * pinger a minute before a period you expect traffic.
 */
@Controller('wake-server')
export class WakeController {
  private readonly logger = new Logger(WakeController.name);
  private readonly startedAt = Date.now();
  /** Set on the first call after boot, to identify a genuine cold start. */
  private firstCallAt: number | null = null;

  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @SkipThrottle()
  @Get()
  async wake() {
    const begunAt = Date.now();
    const uptimeSeconds = Math.floor((begunAt - this.startedAt) / 1000);

    // A cold start is the first request after the process began. Prisma
    // connects lazily, so this query is the thing that actually does the
    // warming — without it the *next* caller would still pay for the
    // handshake to Supabase.
    const wasCold = this.firstCallAt === null;
    if (wasCold) this.firstCallAt = begunAt;

    let database = 'up';
    let dbLatencyMs: number | null = null;
    const dbStart = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStart;
    } catch (e) {
      // Deliberately not thrown. This endpoint returning 5xx would tell an
      // uptime monitor the service is broken when it is merely waking, and if
      // it were ever wired to Render's health check it would cause a restart
      // loop. Report the state in the body instead.
      database = 'down';
      dbLatencyMs = Date.now() - dbStart;
      this.logger.warn(`Wake probe: database unreachable — ${(e as Error).message}`);
    }

    const totalMs = Date.now() - begunAt;
    if (wasCold) {
      this.logger.log(`Cold start warmed in ${totalMs}ms (db ${dbLatencyMs}ms)`);
    }

    return {
      awake: true,
      // True only for the first call after the container booted, so you can
      // tell "the instance was asleep" from "it was already running".
      coldStart: wasCold,
      database,
      dbLatencyMs,
      warmUpMs: totalMs,
      uptimeSeconds,
      timestamp: new Date().toISOString(),
    };
  }
}
