import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { OdbcModule } from './config/database/obdc/obdc.module';

@Module({
  imports: [OdbcModule],
  controllers: [AppController],
})
export class AppModule {}
