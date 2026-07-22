import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerificationStatus } from '@prisma/client';
import {
  VerificationsService,
  UploadedFileLike,
} from './verifications.service';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import {
  CurrentUser,
  AuthUser,
} from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('verifications')
export class VerificationsController {
  constructor(private readonly service: VerificationsService) {}

  @Roles(Role.PROVIDER)
  @Post('documents')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @CurrentUser() user: AuthUser,
    @Body('type') type: string,
    @UploadedFile() file: UploadedFileLike,
  ) {
    return this.service.uploadDocument(user, type, file);
  }

  @Roles(Role.PROVIDER)
  @Post()
  submit(@CurrentUser() user: AuthUser, @Body() dto: SubmitVerificationDto) {
    return this.service.submit(user, dto);
  }

  @Roles(Role.PROVIDER)
  @Get('me')
  myLatest(@CurrentUser() user: AuthUser) {
    return this.service.myLatest(user);
  }

  @Roles(Role.ADMIN)
  @Get()
  queue(@Query('status') status?: VerificationStatus) {
    return this.service.queue(status);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/review')
  review(@Param('id') id: string, @Body() dto: ReviewVerificationDto) {
    return this.service.review(id, dto);
  }
}
