import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VerificationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';

// Minimal shape of a multer-uploaded file (avoids needing @types/multer).
export interface UploadedFileLike {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Injectable()
export class VerificationsService {
  private readonly bucket: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
  ) {
    this.bucket = this.config.get<string>('storage.bucket') || 'zenex-uploads';
  }

  private async providerFor(userId: string) {
    const p = await this.prisma.providerProfile.findUnique({
      where: { userId },
    });
    if (!p) {
      throw new ForbiddenException('Only providers can submit verification');
    }
    return p;
  }

  /** Upload one KYC document to Supabase Storage; returns its path + a signed URL. */
  async uploadDocument(user: AuthUser, type: string, file: UploadedFileLike) {
    const provider = await this.providerFor(user.id);
    const safeType = (type || 'doc').replace(/[^a-z0-9]/gi, '_');
    const path = `${provider.id}/${Date.now()}_${safeType}`;
    await this.supabase.uploadFile(
      this.bucket,
      path,
      file.buffer,
      file.mimetype,
    );
    const signedUrl = await this.supabase.getSignedUrl(this.bucket, path);
    return { type, path, signedUrl };
  }

  /** Provider submits a verification request with the uploaded documents. */
  async submit(user: AuthUser, dto: SubmitVerificationDto) {
    const provider = await this.providerFor(user.id);
    return this.prisma.verificationRequest.create({
      data: {
        providerId: provider.id,
        city: dto.city,
        status: VerificationStatus.SUBMITTED,
        documents: {
          create: dto.documents.map((d) => ({ type: d.type, url: d.url })),
        },
      },
      include: { documents: true },
    });
  }

  /** Provider's latest request + status. */
  async myLatest(user: AuthUser) {
    const provider = await this.providerFor(user.id);
    return this.prisma.verificationRequest.findFirst({
      where: { providerId: provider.id },
      orderBy: { submittedAt: 'desc' },
      include: { documents: true },
    });
  }

  /** Admin review queue (defaults to pending items). */
  async queue(status?: VerificationStatus) {
    const where = status
      ? { status }
      : {
          status: {
            in: [VerificationStatus.SUBMITTED, VerificationStatus.IN_REVIEW],
          },
        };

    const requests = await this.prisma.verificationRequest.findMany({
      where,
      orderBy: { submittedAt: 'asc' },
      include: {
        documents: true,
        provider: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    // Turn stored storage paths into signed, viewable URLs for the reviewer.
    for (const r of requests) {
      for (const d of r.documents) {
        d.url = await this.safeSign(d.url);
      }
    }
    return requests;
  }

  /** Admin approves/rejects — approval flips the provider's `verified` badge. */
  async review(id: string, dto: ReviewVerificationDto) {
    const request = await this.prisma.verificationRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Verification request not found');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.verificationRequest.update({
        where: { id },
        data: {
          status: dto.status,
          reviewNote: dto.note,
          reviewedAt: new Date(),
        },
      });

      if (dto.status === VerificationStatus.APPROVED) {
        await tx.providerProfile.update({
          where: { id: request.providerId },
          data: { verified: true },
        });
      } else if (dto.status === VerificationStatus.REJECTED) {
        await tx.providerProfile.update({
          where: { id: request.providerId },
          data: { verified: false },
        });
      }

      return updated;
    });
  }

  /** Sign a storage path; pass through anything that's already a URL. */
  private async safeSign(pathOrUrl: string): Promise<string> {
    if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
    try {
      return await this.supabase.getSignedUrl(this.bucket, pathOrUrl);
    } catch {
      return pathOrUrl;
    }
  }
}
