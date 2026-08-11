import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class BookingExtraDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateBookingDto {
  @IsString()
  providerId: string;

  // Optional: pick one of the provider's services. If omitted, price is
  // computed from the provider's hourly rate * hours.
  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsDateString()
  scheduledFor: string;

  @IsOptional()
  @IsString()
  timeSlot?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  hours?: number;

  /** Job length in minutes; used for availability conflict checks. */
  @IsOptional()
  @IsInt()
  @Min(15)
  durationMins?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingExtraDto)
  extras?: BookingExtraDto[];
}
