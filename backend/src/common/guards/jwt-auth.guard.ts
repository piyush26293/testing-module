import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(_context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Basic JWT authentication check
    // In production, this should validate JWT token
    // const request = _context.switchToHttp().getRequest();
    return true; // Simplified for MVP
  }
}
