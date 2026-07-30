import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

// Augment Express Request with the resolved tenant slug.
declare module 'express-serve-static-core' {
  interface Request {
    tenantSlug?: string;
  }
}

/**
 * Reads the tenant from the "x-Tenant" header the frontend sends
 * (see the frontend's utils/tokenAxios.ts) and attaches it to the request.
 * Downstream services scope every query by this tenant.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly header: string;
  private readonly defaultTenant: string;

  constructor(private readonly config: ConfigService) {
    this.header = this.config.get<string>('tenancy.header', 'x-tenant');
    this.defaultTenant = this.config.get<string>(
      'tenancy.defaultTenant',
      'demo',
    );
  }

  use(req: Request, _res: Response, next: NextFunction) {
    const headerValue = req.headers[this.header];
    const slug = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    req.tenantSlug = (slug || this.defaultTenant).toString().toLowerCase();
    next();
  }
}
