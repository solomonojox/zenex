import { IsEmail, IsString, MinLength } from 'class-validator';

export class VerifyEmailDto {
  /** "<rowId>.<secret>" as emailed — same shape as the password reset token. */
  @IsString()
  @MinLength(10)
  token!: string;
}

export class ResendVerificationDto {
  @IsEmail()
  email!: string;
}
