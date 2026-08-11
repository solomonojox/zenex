import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class AvailabilityRuleDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number; // 0 = Sunday … 6 = Saturday

  @IsInt()
  @Min(0)
  @Max(1440)
  startMinute: number;

  @IsInt()
  @Min(0)
  @Max(1440)
  endMinute: number;
}

export class SetAvailabilityDto {
  /** Full replacement of the provider's weekly schedule. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityRuleDto)
  rules: AvailabilityRuleDto[];
}
