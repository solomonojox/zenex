import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import {
  CurrentUser,
  AuthUser,
} from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  add(@CurrentUser() user: AuthUser, @Body() dto: CreateFavoriteDto) {
    return this.favoritesService.add(user, dto.providerId);
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.favoritesService.list(user);
  }

  @Delete(':providerId')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('providerId') providerId: string,
  ) {
    return this.favoritesService.remove(user, providerId);
  }
}
