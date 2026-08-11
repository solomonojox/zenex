import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { CreateTimeOffDto } from './dto/create-time-off.dto';
import { QuerySlotsDto } from './dto/query-slots.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import {
  CurrentUser,
  AuthUser,
} from '../../common/decorators/current-user.decorator';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  /** Public: bookable slots for a provider on a given day. */
  @Public()
  @Get('providers/:providerId/slots')
  slots(
    @Param('providerId') providerId: string,
    @Query() query: QuerySlotsDto,
  ) {
    return this.availability.getSlots(
      providerId,
      query.date,
      query.durationMins,
    );
  }

  /** Public: a provider's weekly working hours. */
  @Public()
  @Get('providers/:providerId/schedule')
  schedule(@Param('providerId') providerId: string) {
    return this.availability.getSchedule(providerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROVIDER)
  @Get('me')
  mySchedule(@CurrentUser() user: AuthUser) {
    return this.availability.getMySchedule(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROVIDER)
  @Put('me')
  setMySchedule(
    @CurrentUser() user: AuthUser,
    @Body() dto: SetAvailabilityDto,
  ) {
    return this.availability.setMySchedule(user, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROVIDER)
  @Post('me/time-off')
  addTimeOff(@CurrentUser() user: AuthUser, @Body() dto: CreateTimeOffDto) {
    return this.availability.addTimeOff(user, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROVIDER)
  @Delete('me/time-off/:id')
  removeTimeOff(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.availability.removeTimeOff(user, id);
  }
}
