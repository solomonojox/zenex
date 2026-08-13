import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { StatsService } from './stats.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('stats')
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  /** Public counts for the marketing pages. Scoped to the request's tenant. */
  @Public()
  @Get()
  publicStats(@Req() req: Request) {
    return this.stats.publicStats(req.tenantSlug ?? '');
  }
}
