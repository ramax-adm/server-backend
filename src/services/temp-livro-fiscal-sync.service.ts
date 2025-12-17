import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OdbcService } from 'src/config/database/obdc/odbc.service';
import { ArrayUtils } from 'src/utils/array.utils';
import { FileUtils } from 'src/utils/file.utils';
import { DateUtils } from 'src/utils/date.utils';
import { EntitiesEnum, StorageTypesEnum } from 'src/common/constants/utils';
import { UtilsStorageSyncedFile } from 'src/entities/typeorm/utils-storage-synced-file.entity';
import { S3StorageService } from 'src/aws';
import { EnvService } from 'src/config/env/env.service';
import { NumberUtils } from 'src/utils/number.utils';
import { INVOICE_QUERY } from 'src/common/constants/invoice';
import { Invoice } from 'src/entities/typeorm/invoice.entity';
import {
  InvoiceSyncRequestInput,
  InvoiceSyncRequestDto,
} from './dtos/invoice-sync.dto';
import { ODBC_PROVIDER } from 'src/config/database/obdc/providers/odbc.provider';
import { ORACLE_DB_PROVIDER } from 'src/config/database/oracle-db/providers/oracle-db.provider';
import { OracleService } from 'src/config/database/oracle-db/oracle-db.service';
import { ORDER_LINES_QUERY } from 'src/common/constants/orders';
import {
  OrderLineSyncRequestDto,
  OrderLineSyncRequestInput,
} from './dtos/order-line-sync.dto';
import { OrderLine } from 'src/entities/typeorm/order-line.entity';
import { TempLivroFiscalSyncRequestDto } from './dtos/temp-livro-fiscal-sync.dto';
import { TEMP_LIVRO_FISCAL_QUERY } from 'src/common/constants/temp-livro-fiscal';
import { TempLivroFiscal } from 'src/entities/typeorm/temp-livro-fiscal.entity';

@Injectable()
export class TempLivroFiscalSyncService {
  // QUERY SENSATTA
  private startDate = '2025-01-01';
  private endDate = new Date().toISOString().split('T')[0];
  private query = TEMP_LIVRO_FISCAL_QUERY;

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
      this.oracleService.runCursorStream<TempLivroFiscalSyncRequestDto>(
        this.query,
        { data1: this.startDate, data2: this.endDate },
        2000, // cada lote com até 2000 objetos
      );
    for await (const batch of dataIterator) {
      yield batch.map((item) => new TempLivroFiscalSyncRequestDto(item));
    }
  }

  async processData() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // limpa a tabela antes
      await queryRunner.manager.delete(TempLivroFiscal, {});

      // processa lote a lote
      for await (const batch of this.getDataStream()) {
        await queryRunner.manager.insert(TempLivroFiscal, batch);
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
