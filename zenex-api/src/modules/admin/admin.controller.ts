import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DisputeStatus } from '@prisma/client';
import { AdminService } from './admin.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import {
  CurrentUser,
  AuthUser,
} from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('overview')
  overview(@CurrentUser() user: AuthUser) {
    return this.admin.overview(user.tenantId);
  }

  @Get('users')
  users(@CurrentUser() user: AuthUser, @Query() query: QueryUsersDto) {
    return this.admin.listUsers(user.tenantId, query);
  }

  @Patch('users/:id/status')
  setUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.admin.setUserStatus(id, dto.active);
  }

  @Get('disputes')
  disputes(
    @CurrentUser() user: AuthUser,
    @Query('status') status?: DisputeStatus,
  ) {
    return this.admin.listDisputes(user.tenantId, status);
  }

  @Post('disputes')
  createDispute(@CurrentUser() user: AuthUser, @Body() dto: CreateDisputeDto) {
    return this.admin.createDispute(user.tenantId, dto);
  }

  @Patch('disputes/:id/resolve')
  resolveDispute(@Param('id') id: string, @Body() dto: ResolveDisputeDto) {
    return this.admin.resolveDispute(id, dto.status);
  }
}
