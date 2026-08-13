import { IsBoolean, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  planId!: string;

  /**
   * The customer ticked the recurring-billing consent box.
   *
   * Required rather than optional: a recurring charge should be impossible to
   * start by accident, and the service refuses without it. Stored with a
   * timestamp and the exact amount agreed, so a disputed charge has evidence.
   */
  @IsBoolean()
  consent!: boolean;
}
