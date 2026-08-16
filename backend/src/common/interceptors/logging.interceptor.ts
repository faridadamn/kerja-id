import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - now;
        const userId = user?.sub || 'anonymous';

        this.logger.log(
          `${method} ${url} ${response.statusCode} ${duration}ms [user:${userId}]`,
        );

        // Log slow requests
        if (duration > 1000) {
          this.logger.warn(`Slow request: ${method} ${url} took ${duration}ms`);
        }
      }),
    );
  }
}
