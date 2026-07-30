import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ProvidersService } from './providers.service';
import { QueryProvidersDto } from './dto/query-providers.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import {
  CurrentUser,
  AuthUser,
} from '../../common/decorators/current-user.decorator';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryProvidersDto, @Req() req: Request) {
    return this.providersService.findAll(req.tenantSlug ?? '', query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROVIDER)
  @Patch('me/profile')
  updateOwn(@CurrentUser() user: AuthUser, @Body() dto: UpdateProviderDto) {
    return this.providersService.updateOwn(user.id, dto);
  }
}
