import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DisputePriority } from '@prisma/client';

export class CreateDisputeDto {
  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsString()
  clientName: string;

  @IsString()
  providerName: string;

  @IsString()
  issue: string;

  @IsOptional()
  @IsEnum(DisputePriority)
  priority?: DisputePriority;
}
