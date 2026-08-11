import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateTimeOffDto {
  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
