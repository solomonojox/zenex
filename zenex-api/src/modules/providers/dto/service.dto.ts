import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  description?: string;

  /** Human-readable estimate, e.g. "2–3 hrs". */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  duration?: string;

  @IsNumber()
  @Min(0)
  price: number;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  duration?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
