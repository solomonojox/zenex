import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QuerySlotsDto {
  /** Day to inspect, as YYYY-MM-DD. */
  @IsString()
  date: string;

  /** How long the job will take; defaults to 120 minutes. */
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(15)
  durationMins?: number;
}
