import { Module } from '@nestjs/common';
import { OdbcProvider } from './providers/odbc.provider';

@Module({
  providers: [OdbcProvider],
  exports: [OdbcProvider],
})
export class OdbcModule {}
