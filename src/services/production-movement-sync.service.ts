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
import {
  ProductionMovementSyncRequestDto,
  ProductionMovementSyncRequestInput,
} from './dtos/production-movement-sync.dto';
import { ProductionMovement } from 'src/entities/typeorm/production-movement.entity';
import { PRODUCTION_MOVEMENT_QUERY } from 'src/common/constants/production-movement';
import { ODBC_PROVIDER } from 'src/config/database/obdc/providers/odbc.provider';
import { ORACLE_DB_PROVIDER } from 'src/config/database/oracle-db/providers/oracle-db.provider';
import { OracleService } from 'src/config/database/oracle-db/oracle-db.service';

@Injectable()
export class ProductionMovementSyncService {
  // QUERY SENSATTA
  private query = PRODUCTION_MOVEMENT_QUERY;

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
      this.oracleService.runCursorStream<ProductionMovementSyncRequestInput>(
        this.query,
        {},
        2000, // cada lote com até 2000 objetos
      );
    for await (const batch of dataIterator) {
      yield batch.map((item) => new ProductionMovementSyncRequestDto(item));
    }
  }

  async processData() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // limpa a tabela antes
      await queryRunner.manager.delete(ProductionMovement, {});

      // processa lote a lote
      for await (const batch of this.getDataStream()) {
        await queryRunner.manager.insert(ProductionMovement, batch);
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
    const data = await this.dataSource.manager.find(ProductionMovement);

    const parsedData = data.map((i) => ({
      ...i,
      weightInKg: NumberUtils.nb2(i.weightInKg ?? 0),
      quantity: NumberUtils.nb0(i.quantity ?? 0),
      boxQuantity: NumberUtils.nb0(i.boxQuantity ?? 0),
    }));
    const buffer = await FileUtils.toCsv(parsedData);
    const s3Path = `sync-sensatta-snapshots/${EntitiesEnum.PRODUCTION_MOVEMENT}-${DateUtils.getFileDate()}.csv`;

    await this.storageService.upload({
      Bucket: this.envService.get('AWS_S3_BUCKET'),
      Key: s3Path,
      Body: buffer,
    });

    await this.dataSource.manager.save(UtilsStorageSyncedFile, {
      storageType: StorageTypesEnum.S3,
      entity: EntitiesEnum.PRODUCTION_MOVEMENT,
      fileUrl: s3Path,
    });

    return;
  }
}
