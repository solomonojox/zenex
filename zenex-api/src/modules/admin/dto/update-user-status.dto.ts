import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserStatusDto {
  // true = active, false = suspended
  @IsBoolean()
  active!: boolean;

  /**
   * Why the account is being suspended. Optional, but it goes straight into
   * the email the person receives — a suspension with no reason gives them
   * nothing to act on and turns a solvable problem into a support argument.
   * Ignored when reinstating.
   */
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}
