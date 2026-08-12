import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { AvailabilityModule } from '../availability/availability.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [AvailabilityModule, BookingsModule],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
