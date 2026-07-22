import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

/**
 * Wraps the Stripe SDK. If no real secret key is configured (or it's still the
 * placeholder), `enabled` is false and the app runs in DEMO payment mode —
 * payments/payouts are simulated so the full flow works without Stripe.
 * Drop real test keys into .env and everything switches to live automatically.
 */
@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe | null = null;
  readonly platformFeePercent: number;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('stripe.secretKey') || '';
    this.platformFeePercent = this.config.get<number>(
      'stripe.platformFeePercent',
      15,
    );

    if (key.startsWith('sk_') && !key.includes('xxx')) {
      this.stripe = new Stripe(key);
      this.logger.log('Stripe LIVE mode enabled');
    } else {
      this.logger.warn('Stripe not configured — running in DEMO payment mode');
    }
  }

  get enabled(): boolean {
    return this.stripe !== null;
  }

  get client(): Stripe {
    if (!this.stripe) throw new Error('Stripe is not configured');
    return this.stripe;
  }

  get webhookSecret(): string {
    return this.config.get<string>('stripe.webhookSecret') || '';
  }
}
