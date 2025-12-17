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
import { ACCOUNT_PAYABLE_QUERY } from 'src/common/constants/account-payable';
import { AccountPayable } from 'src/entities/typeorm/account-payable.entity';
import {
  AccountPayableSyncRequestInput,
  AccountPayableSyncRequestDto,
} from './dtos/account-payable-sync.dto';
import { ACCOUNT_RECEIVABLE_QUERY } from 'src/common/constants/account-receivable';
import {
  AccountReceivableSyncRequestDto,
  AccountReceivableSyncRequestInput,
} from './dtos/account-receivable-sync.dto';
import { AccountReceivable } from 'src/entities/typeorm/account-receivable.entity';

@Injectable()
export class AccountReceivableSyncService {
  // QUERY SENSATTA
  private baseDate = new Date().toISOString().split('T')[0];
  private query = ACCOUNT_RECEIVABLE_QUERY;

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
      this.oracleService.runCursorStream<AccountReceivableSyncRequestInput>(
        this.query,
        { data_base: this.baseDate },
        2000, // cada lote com até 2000 objetos
      );
    for await (const batch of dataIterator) {
      yield batch.map((item) => new AccountReceivableSyncRequestDto(item));
    }
  }

  async processData() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const session = await this.oracleService.runQuery(`
        SELECT * FROM nls_session_parameters WHERE parameter LIKE 'NLS_NUMERIC%'`);
    console.log({ session, baseDate: this.baseDate });

    // throw new Error('Erro proposital');

    try {
      // limpa a tabela antes
      await queryRunner.manager.delete(AccountReceivable, {});

      // processa lote a lote
      for await (const batch of this.getDataStream()) {
        await queryRunner.manager.insert(AccountReceivable, batch);
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
