import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionPlansController } from './subscription-plans.controller';
import { StripeService } from '../payments/stripe.service';

@Module({
  controllers: [SubscriptionsController, SubscriptionPlansController],
  // StripeService is a thin stateless wrapper, so providing it here avoids a
  // circular import between PaymentsModule and SubscriptionsModule.
  providers: [SubscriptionsService, StripeService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
