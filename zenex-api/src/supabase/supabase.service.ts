import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Thin wrapper around the Supabase client, initialized with the server-side
 * SECRET key. Used for Storage (e.g. KYC / verification document uploads) and
 * any admin operations. The database itself is accessed via Prisma, not here.
 */
@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('supabase.url');
    const secretKey = this.config.get<string>('supabase.secretKey');

    if (url && secretKey) {
      this.client = createClient(url, secretKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      this.logger.log('Supabase client initialized');
    } else {
      this.logger.warn(
        'Supabase not configured (SUPABASE_URL / SUPABASE_SECRET_KEY missing) — storage features disabled',
      );
    }
  }

  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase client is not configured');
    }
    return this.client;
  }

  /** Upload a file buffer to a Storage bucket. Returns the stored object path. */
  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    contentType?: string,
  ) {
    const { data, error } = await this.getClient()
      .storage.from(bucket)
      .upload(path, file, { contentType, upsert: true });
    if (error) throw error;
    return data;
  }

  /** Create a signed, time-limited URL for a private stored object. */
  async getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
    const { data, error } = await this.getClient()
      .storage.from(bucket)
      .createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  }
}
