import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Restrict a route to one or more roles.
 * Usage: @Roles(Role.ADMIN, Role.PROVIDER)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
