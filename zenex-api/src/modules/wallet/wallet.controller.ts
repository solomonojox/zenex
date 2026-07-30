import { Controller, Get, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthUser,
} from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get()
  myWallet(@CurrentUser() user: AuthUser) {
    return this.wallet.myWallet(user);
  }

  @Get('transactions')
  myTransactions(@CurrentUser() user: AuthUser) {
    return this.wallet.myTransactions(user);
  }

  @Get('payouts')
  myPayouts(@CurrentUser() user: AuthUser) {
    return this.wallet.myPayouts(user);
  }
}
