import * as Sentry from '@sentry/node';
import { Logger } from '@nestjs/common';

const logger = new Logger('Sentry');

/**
 * Initialise error tracking. No-ops when SENTRY_DSN is unset, so local and
 * demo environments stay quiet — same pattern as Stripe/email.
 */
export function initSentry(): boolean {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    logger.log('SENTRY_DSN not set — error tracking disabled');
    return false;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    // Sample a slice of traffic for performance data; errors are always sent.
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    beforeSend(event) {
      // Never ship credentials or tokens to a third party.
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      if (event.request?.data) {
        const data = event.request.data as Record<string, unknown>;
        for (const key of ['password', 'token', 'refreshToken']) {
          if (key in data) data[key] = '[redacted]';
        }
      }
      return event;
    },
  });

  logger.log('Sentry error tracking enabled');
  return true;
}

export { Sentry };
