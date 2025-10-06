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
import { TempBalancete } from 'src/entities/typeorm/temp-balancete.entity';
import { TempBalanceteSyncRequestDto } from './dtos/temp-balancete-sync.dto';
import { TEMP_BALANCETE_QUERY } from 'src/common/constants/temp-balancete';
import { RETURN_OCCURRENCES_QUERY } from 'src/common/constants/return-occurrences';
import {
  ReturnOccurrenceSyncRequestDto,
  ReturnOccurrenceSyncRequestInput,
} from './dtos/return-occurrence-sync.dto';
import { ReturnOccurrence } from 'src/entities/typeorm/return-ocurrence.entity';

@Injectable()
export class ReturnOccurenceSyncService {
  // QUERY SENSATTA
  private startDate = '2025-01-01';
  private query = RETURN_OCCURRENCES_QUERY;

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
      this.oracleService.runCursorStream<ReturnOccurrenceSyncRequestInput>(
        this.query,
        [this.startDate],
        2000, // cada lote com até 2000 objetos
      );
    for await (const batch of dataIterator) {
      yield batch.map((item) => new ReturnOccurrenceSyncRequestDto(item));
    }
  }

  async processData() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // limpa a tabela antes
      await queryRunner.manager.delete(ReturnOccurrence, {});

      // processa lote a lote
      for await (const batch of this.getDataStream()) {
        await queryRunner.manager.insert(ReturnOccurrence, batch);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      console.error({ error });
      await queryRunner.rollbackTransaction();
      throw new UnprocessableEntityException(error);
    } finally {
      await queryRunner.release();
    }
  }
}
