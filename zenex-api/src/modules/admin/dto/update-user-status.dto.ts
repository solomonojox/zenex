import { IsBoolean } from 'class-validator';

export class UpdateUserStatusDto {
  // true = active, false = suspended
  @IsBoolean()
  active: boolean;
}
