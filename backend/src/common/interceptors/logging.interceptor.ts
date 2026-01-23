import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const now = Date.now();

    const sanitizedBody = this.sanitizeBody(body);

    this.logger.log(
      `Incoming Request: ${method} ${url} | User: ${user?.id || 'anonymous'} | Body: ${JSON.stringify(sanitizedBody)}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `Outgoing Response: ${method} ${url} | ${responseTime}ms`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `Failed Request: ${method} ${url} | ${responseTime}ms | Error: ${error.message}`,
          );
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'passwordHash', 'token', 'apiKey', 'secret'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }
}
