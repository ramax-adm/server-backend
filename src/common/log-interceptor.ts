import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    console.log(`\nExecutando ${request.method} - ${request.url}`);

    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`Finalizado em ... ${Date.now() - now}ms`)));
  }
}
