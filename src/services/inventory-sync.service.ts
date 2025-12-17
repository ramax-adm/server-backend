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
import { ODBC_PROVIDER } from 'src/config/database/obdc/providers/odbc.provider';
import { ORACLE_DB_PROVIDER } from 'src/config/database/oracle-db/providers/oracle-db.provider';
import { OracleService } from 'src/config/database/oracle-db/oracle-db.service';
import { Inventory } from 'src/entities/typeorm/inventory.entity';
import {
  InventorySyncRequestInput,
  InventorySyncRequestDto,
} from './dtos/inventory-sync.dto';
import { INVENTORY_QUERY } from 'src/common/constants/inventory';

@Injectable()
export class InventorySyncService {
  private query = INVENTORY_QUERY;

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
      this.oracleService.runCursorStream<InventorySyncRequestInput>(
        this.query,
        {},
        1000, // cada lote com até 2000 objetos
      );
    for await (const batch of dataIterator) {
      yield batch.map((item) => new InventorySyncRequestDto(item));
    }
  }

  async processData() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const previousData = await queryRunner.manager.find(Inventory);
    const previousDataMap = new Map(
      previousData.map((i) => [String(i.sensattaId), i]),
    );

    try {
      // limpa a tabela antes
      await queryRunner.manager.delete(Inventory, {});

      // processa lote a lote
      for await (const batch of this.getDataStream()) {
        const dataToInsert = batch.map((i) => {
          const previousInvetory = previousDataMap.get(String(i.sensattaId));

          return { ...i, syncedAt: previousInvetory?.syncedAt };
        });
        console.log({ previousDataMap, dataToInsert });
        // throw new Error('ERRO');
        await queryRunner.manager.insert(Inventory, dataToInsert);
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

  async syncWithStorage() {
    const data = await this.dataSource.manager.find(Inventory);

    const buffer = await FileUtils.toCsv(data);
    const s3Path = `sync-sensatta-snapshots/${EntitiesEnum.INVENTORY}-${DateUtils.getFileDate()}.csv`;

    await this.storageService.upload({
      Bucket: this.envService.get('AWS_S3_BUCKET'),
      Key: s3Path,
      Body: buffer,
    });

    await this.dataSource.manager.save(UtilsStorageSyncedFile, {
      storageType: StorageTypesEnum.S3,
      entity: EntitiesEnum.INVENTORY,
      fileUrl: s3Path,
    });

    return;
  }
}
