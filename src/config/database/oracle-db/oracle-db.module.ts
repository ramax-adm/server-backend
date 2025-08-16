import { Module } from '@nestjs/common';
import { OracleDbProvider } from './providers/oracle-db.provider';

@Module({
  providers: [OracleDbProvider],
  exports: [OracleDbProvider],
})
export class OracleDbModule {}
