import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VerificationStatus } from '@prisma/client';

export class ReviewVerificationDto {
  // APPROVED, REJECTED, or IN_REVIEW
  @IsEnum(VerificationStatus)
  status: VerificationStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
