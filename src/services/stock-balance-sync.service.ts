import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OdbcService } from 'src/config/database/obdc/odbc.service';
import { ArrayUtils } from 'src/utils/array.utils';
import {
  StockBalanceSyncRequestDto,
  StockBalanceSyncRequestInput,
} from './dtos/stock-balance-sync.dto';
import { STOCK_BALANCE_QUERY } from 'src/common/constants/stock-balance';
import { StockBalance } from 'src/entities/typeorm/stock-balance.entity';
import { Company } from 'src/entities/typeorm/company.entity';
import { FileUtils } from 'src/utils/file.utils';
import { DateUtils } from 'src/utils/date.utils';
import { EntitiesEnum, StorageTypesEnum } from 'src/common/constants/utils';
import { UtilsStorageSyncedFile } from 'src/entities/typeorm/utils-storage-synced-file.entity';
import { S3StorageService } from 'src/aws';
import { EnvService } from 'src/config/env/env.service';
import { NumberUtils } from 'src/utils/number.utils';
import { ODBC_PROVIDER } from 'src/config/database/obdc/providers/odbc.provider';
import { ORACLE_DB_PROVIDER } from 'src/config/database/oracle-db/providers/oracle-db.provider';
import { OracleService } from 'src/config/database/oracle-db/oracle-db.service';

@Injectable()
export class StockBalanceSyncService {
  // QUERY SENSATTA
  private query = STOCK_BALANCE_QUERY;

  constructor(
    @Inject('STORAGE_SERVICE')
    private readonly storageService: S3StorageService,

    @Inject(ORACLE_DB_PROVIDER)
    private readonly oracleService: OracleService,
    private readonly dataSource: DataSource,
    private readonly envService: EnvService,
  ) {}

  async *getDataStream({ companies }: { companies: Company[] }) {
    const dataIterator =
      this.oracleService.runCursorStream<StockBalanceSyncRequestInput>(
        this.query,
        [],
        2000, // cada lote com até 2000 objetos
      );
    for await (const batch of dataIterator) {
      yield batch.map((item) => new StockBalanceSyncRequestDto(item));
    }
  }

  async processData() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const companies = await this.dataSource.manager.find<Company>(Company, {
        where: {
          isConsideredOnStock: true,
        },
      });
      // limpa a tabela antes
      await queryRunner.manager.delete(StockBalance, {});

      // processa lote a lote
      for await (const batch of this.getDataStream({ companies })) {
        await queryRunner.manager.insert(StockBalance, batch);
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

  async syncWithStorage() {
    const data = await this.dataSource.manager.find(StockBalance);

    const parsedData = data.map((i) => ({
      ...i,
      weightInKg: NumberUtils.nb2(i.weightInKg),
      reservedWeightInKg: NumberUtils.nb2(i.reservedWeightInKg),
      availableWeightInKg: NumberUtils.nb2(i.availableWeightInKg),
    }));
    const buffer = await FileUtils.toCsv(parsedData);
    const s3Path = `sync-sensatta-snapshots/${EntitiesEnum.STOCK_BALANCE}-${DateUtils.getFileDate()}.csv`;

    await this.storageService.upload({
      Bucket: this.envService.get('AWS_S3_BUCKET'),
      Key: s3Path,
      Body: buffer,
    });

    await this.dataSource.manager.save(UtilsStorageSyncedFile, {
      storageType: StorageTypesEnum.S3,
      entity: EntitiesEnum.STOCK_BALANCE,
      fileUrl: s3Path,
    });

    return;
  }
}
