import { IsEmail } from 'class-validator';

export class TestEmailDto {
  /** Where to send the test. Use an inbox you can actually check. */
  @IsEmail()
  to!: string;
}
