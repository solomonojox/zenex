import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  private async clientFor(userId: string) {
    const client = await this.prisma.clientProfile.findUnique({
      where: { userId },
    });
    if (!client) throw new ForbiddenException('Only clients have favorites');
    return client;
  }

  /** Save a provider as a favorite (idempotent). */
  async add(user: AuthUser, providerId: string) {
    const client = await this.clientFor(user.id);
    const provider = await this.prisma.providerProfile.findUnique({
      where: { id: providerId },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    return this.prisma.favorite.upsert({
      where: { clientId_providerId: { clientId: client.id, providerId } },
      update: {},
      create: { userId: user.id, clientId: client.id, providerId },
    });
  }

  /** Remove a favorite (no error if it wasn't saved). */
  async remove(user: AuthUser, providerId: string) {
    const client = await this.clientFor(user.id);
    await this.prisma.favorite.deleteMany({
      where: { clientId: client.id, providerId },
    });
    return { removed: true };
  }

  /** List the client's favorite providers. */
  async list(user: AuthUser) {
    const client = await this.clientFor(user.id);
    return this.prisma.favorite.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: 'desc' },
      include: {
        provider: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            services: true,
          },
        },
      },
    });
  }
}
