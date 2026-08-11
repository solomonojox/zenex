import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BookingExtraDto } from './create-booking.dto';

export class QuoteDto {
  @IsString()
  providerId: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingExtraDto)
  extras?: BookingExtraDto[];
}
