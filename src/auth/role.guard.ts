import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private allowedRoles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.userType) {
      return false;
    }
    
    return this.allowedRoles.includes(user.userType);
  }
}

// Factory function to create role guards
export const Roles = (...roles: string[]) => new RoleGuard(roles); 