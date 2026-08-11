import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import {
  CurrentUser,
  AuthUser,
} from '../../common/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Post('bookings/:bookingId/checkout')
  checkout(
    @CurrentUser() user: AuthUser,
    @Param('bookingId') bookingId: string,
  ) {
    return this.payments.checkout(user, bookingId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROVIDER)
  @Post('payouts')
  payout(@CurrentUser() user: AuthUser) {
    return this.payments.payout(user);
  }

  /** Begin/resume Stripe Connect Express onboarding. */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROVIDER)
  @Post('connect/onboarding')
  connectOnboarding(
    @CurrentUser() user: AuthUser,
    @Body('returnUrl') returnUrl?: string,
  ) {
    return this.payments.connectOnboarding(
      user,
      returnUrl || 'http://localhost:3000/provider',
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROVIDER)
  @Get('connect/status')
  connectStatus(@CurrentUser() user: AuthUser) {
    return this.payments.connectStatus(user);
  }

  // Stripe webhook — public, needs the raw request body for signature checks.
  @Post('webhook')
  @HttpCode(200)
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.payments.handleWebhook(signature, req.rawBody as Buffer);
  }
}
