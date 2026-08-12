import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { QuotesService } from './quotes.service';
import { BookingsService } from '../bookings/bookings.service';
import {
  InstantQuoteDto,
  InstantSlotsDto,
  InstantBookDto,
} from './dto/quote.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import {
  CurrentUser,
  AuthUser,
} from '../../common/decorators/current-user.decorator';

@Controller('quotes')
export class QuotesController {
  constructor(
    private readonly quotes: QuotesService,
    private readonly bookings: BookingsService,
  ) {}

  /** Public: exact prices for a property size, before choosing anyone. */
  @Public()
  @Get('instant')
  instant(@Query() query: InstantQuoteDto, @Req() req: Request) {
    return this.quotes.priceOptions(req.tenantSlug ?? '', query);
  }

  /** Public: merged openings across all providers for a given day. */
  @Public()
  @Get('instant/slots')
  slots(@Query() query: InstantSlotsDto, @Req() req: Request) {
    return this.quotes.instantSlots(req.tenantSlug ?? '', {
      ...query,
      key: query.key ?? 'standard',
    });
  }

  /** Book without browsing — the platform assigns the best available pro. */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Post('instant/book')
  async book(
    @CurrentUser() user: AuthUser,
    @Body() dto: InstantBookDto,
    @Req() req: Request,
  ) {
    const tenantSlug = req.tenantSlug ?? '';
    const { priced, provider, startsAt } =
      await this.quotes.resolveInstantBooking(tenantSlug, dto);

    const booking = await this.bookings.create(
      user,
      {
        providerId: provider.id,
        scheduledFor: startsAt.toISOString(),
        durationMins: priced.durationMins,
        address: dto.address,
        notes: dto.notes,
        extras: dto.extras,
      },
      {
        // Price comes from the instant-quote rules, not the provider's list.
        basePrice: priced.subtotal,
        serviceLabel: `${priced.label} · ${dto.bedrooms} bed, ${dto.bathrooms} bath`,
      },
    );

    return { booking, matchedProvider: provider, quote: priced };
  }
}
