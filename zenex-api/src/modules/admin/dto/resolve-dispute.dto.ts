import { IsEnum } from 'class-validator';
import { DisputeStatus } from '@prisma/client';

export class ResolveDisputeDto {
  // RESOLVED or ESCALATED
  @IsEnum(DisputeStatus)
  status: DisputeStatus;
}
