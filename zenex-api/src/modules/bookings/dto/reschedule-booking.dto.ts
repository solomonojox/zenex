import { IsDateString } from 'class-validator';

export class RescheduleBookingDto {
  /** New start time, ISO 8601. Treated as UTC wall-clock like every other slot. */
  @IsDateString()
  scheduledFor!: string;
}
