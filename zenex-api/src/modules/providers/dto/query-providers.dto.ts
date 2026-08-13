import { Transform } from 'class-transformer';
import {
  IsBooleanString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class QueryProvidersDto {
  @IsOptional()
  @IsString()
  q?: string; // free-text search (name / title / tags)

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBooleanString()
  verified?: string;

  @IsOptional()
  @IsBooleanString()
  instant?: string;

  /** `distance` requires `location`; without one it falls back to rating. */
  @IsOptional()
  @IsString()
  sort?: 'rating' | 'price' | 'ai_match' | 'distance';

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
