import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StripeService } from './stripe.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  // One-way dependency: payments needs subscriptions to activate a plan when
  // Stripe confirms checkout. SubscriptionsModule provides StripeService
  // itself rather than importing this one, which keeps that direction clear.
  imports: [SubscriptionsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService],
  exports: [PaymentsService, StripeService],
})
export class PaymentsModule {}
