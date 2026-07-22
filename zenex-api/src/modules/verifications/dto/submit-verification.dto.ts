import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class VerificationDocumentDto {
  // e.g. "ID", "Insurance", "Background check", "Business Reg."
  @IsString()
  type: string;

  // Storage path returned by POST /verifications/documents, or a full URL.
  @IsString()
  url: string;
}

export class SubmitVerificationDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VerificationDocumentDto)
  documents: VerificationDocumentDto[];
}
