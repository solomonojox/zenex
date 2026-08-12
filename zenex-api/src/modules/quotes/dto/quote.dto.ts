import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { BookingExtraDto } from '../../bookings/dto/create-booking.dto';

/** Property size — the only thing a customer must supply to see a price. */
export class InstantQuoteDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  @Max(10)
  bedrooms: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(10)
  bathrooms: number;

  /** Optional: restrict to one service type, e.g. "deep". */
  @IsOptional()
  @IsString()
  key?: string;

  /** Used for tax and provider matching, e.g. "Toronto, ON". */
  @IsOptional()
  @IsString()
  location?: string;
}

export class InstantSlotsDto extends InstantQuoteDto {
  @IsString()
  date: string; // YYYY-MM-DD
}

export class InstantBookDto {
  @IsString()
  key: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  @Max(10)
  bedrooms: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(10)
  bathrooms: number;

  @IsDateString()
  scheduledFor: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  location?: string;

  /** Pin a specific provider; otherwise the best match is chosen. */
  @IsOptional()
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingExtraDto)
  extras?: BookingExtraDto[];
}
