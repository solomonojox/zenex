import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  /** Current user's wallet (created on first access). */
  myWallet(user: AuthUser) {
    return this.prisma.wallet.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
  }

  async myTransactions(user: AuthUser) {
    const wallet = await this.myWallet(user);
    return this.prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async myPayouts(user: AuthUser) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!provider) return [];
    return this.prisma.payout.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
