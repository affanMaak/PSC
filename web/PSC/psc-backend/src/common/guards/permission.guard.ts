// permissions.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // no specific permission required
    }

    // Extract user from request
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.permissions.modules) {
      return false;
    }    
    // Check if user has *any* of the required permissions
    return requiredPermissions.some(permission =>
      user.permissions.modules.includes(permission),
    );
  }
}
