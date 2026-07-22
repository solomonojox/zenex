import { IsString } from 'class-validator';

export class CreateThreadDto {
  // The other party's profile id: a ProviderProfile id if you're a client,
  // or a ClientProfile id if you're a provider.
  @IsString()
  counterpartId: string;
}
