import { Module } from '@nestjs/common';
// import { SESEmailServiceProvider } from './common/email-service.provider';
import { SESEmailController } from './ses-email.controller';
import { EnvModule } from 'src/config/env/env.module';

@Module({
  imports: [EnvModule],
  // providers: [SESEmailServiceProvider],
  controllers: [SESEmailController],
  // exports: [SESEmailServiceProvider],
})
export class SESEmailModule {}
