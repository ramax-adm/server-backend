import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OdbcService } from 'src/config/database/obdc/odbc.service';
import { S3StorageService } from 'src/aws';
import { EnvService } from 'src/config/env/env.service';

import { ODBC_PROVIDER } from 'src/config/database/obdc/providers/odbc.provider';
import { ORACLE_DB_PROVIDER } from 'src/config/database/oracle-db/providers/oracle-db.provider';
import { OracleService } from 'src/config/database/oracle-db/oracle-db.service';

import { TempLivroFiscalSyncRequestDto } from './dtos/temp-livro-fiscal-sync.dto';
import { TEMP_LIVRO_FISCAL_QUERY } from 'src/common/constants/temp-livro-fiscal';
import { TempLivroFiscal } from 'src/entities/typeorm/temp-livro-fiscal.entity';
import { TempRazaoContabil } from 'src/entities/typeorm/temp-razao-contabil.entity';
import { TempRazaoContabilSyncRequestDto } from './dtos/temp-razao-contabil-sync.dto';
import { TEMP_RAZAO_CONTABIL_QUERY } from 'src/common/constants/temp-razao-contabil';

@Injectable()
export class TempRazaoContabilSyncService {
  // QUERY SENSATTA
  private startDate = '2025-01-01';
  private endDate = new Date().toISOString().split('T')[0];
  private query = TEMP_RAZAO_CONTABIL_QUERY;

  constructor(
    @Inject('STORAGE_SERVICE')
    private readonly storageService: S3StorageService,
    @Inject(ODBC_PROVIDER)
    private readonly odbcService: OdbcService,
    @Inject(ORACLE_DB_PROVIDER)
    private readonly oracleService: OracleService,
    private readonly dataSource: DataSource,
    private readonly envService: EnvService,
  ) {}

  async *getDataStream() {
    const dataIterator =
      this.oracleService.runCursorStream<TempRazaoContabilSyncRequestDto>(
        this.query,
        [this.startDate, this.endDate],
        2000, // cada lote com até 2000 objetos
      );
    for await (const batch of dataIterator) {
      yield batch.map((item) => new TempRazaoContabilSyncRequestDto(item));
    }
  }

  async processData() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // limpa a tabela antes
      await queryRunner.manager.delete(TempRazaoContabil, {});

      // processa lote a lote
      for await (const batch of this.getDataStream()) {
        await queryRunner.manager.insert(TempRazaoContabil, batch);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      console.error({ error });
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
