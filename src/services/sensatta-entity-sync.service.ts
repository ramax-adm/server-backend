import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OdbcService } from 'src/config/database/obdc/odbc.service';
import { ArrayUtils } from 'src/utils/array.utils';
import { S3StorageService } from 'src/aws';
import { EnvService } from 'src/config/env/env.service';

import {
  ClientSyncRequestDto,
  ClientSyncRequestInput,
} from './dtos/client-sync.dto';
import { Client } from 'src/entities/typeorm/client.entity';
import { CLIENT_QUERY } from 'src/common/constants/client';
import { FileUtils } from 'src/utils/file.utils';
import { EntitiesEnum, StorageTypesEnum } from 'src/common/constants/utils';
import { DateUtils } from 'src/utils/date.utils';
import { UtilsStorageSyncedFile } from 'src/entities/typeorm/utils-storage-synced-file.entity';
import { ODBC_PROVIDER } from 'src/config/database/obdc/providers/odbc.provider';
import { ORACLE_DB_PROVIDER } from 'src/config/database/oracle-db/providers/oracle-db.provider';
import { OracleService } from 'src/config/database/oracle-db/oracle-db.service';
import { SensattaEntity } from 'src/entities/typeorm/sensatta-entity.entity';
import {
  SensattaEntitySyncRequestDto,
  SensattaEntitySyncRequestInput,
} from './dtos/sensatta-entity-sync.dto';
import { SENSATTA_ENTITY_QUERY } from 'src/common/constants/sensatta-entity';

@Injectable()
export class SensattaEntitySyncService {
  // QUERY SENSATTA
  private query = SENSATTA_ENTITY_QUERY;

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

  async getData() {
    const response =
      await this.oracleService.runQuery<SensattaEntitySyncRequestInput>(
        this.query,
      );

    return response?.map((item) => new SensattaEntitySyncRequestDto(item));
  }

  async processData() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [sensattaData] = await Promise.all([
        this.getData(),
        // queryRunner.manager.find(Company),
      ]);

      if (!sensattaData) {
        throw new UnprocessableEntityException(
          'Não foi possível buscar dados no Sensatta',
        );
      }

      await queryRunner.manager.delete(SensattaEntity, {});
      const batchSize = 3000; // ajuste conforme necessário
      const chunks = ArrayUtils.chunkArray(sensattaData, batchSize);

      for (const chunk of chunks) {
        await queryRunner.manager.save(SensattaEntity, chunk);
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
    const data = await this.dataSource.manager.find(SensattaEntity);

    const buffer = await FileUtils.toCsv(data);
    const s3Path = `sync-sensatta-snapshots/${EntitiesEnum.ENTITY}-${DateUtils.getFileDate()}.csv`;

    await this.storageService.upload({
      Bucket: this.envService.get('AWS_S3_BUCKET'),
      Key: s3Path,
      Body: buffer,
    });

    await this.dataSource.manager.save(UtilsStorageSyncedFile, {
      storageType: StorageTypesEnum.S3,
      entity: EntitiesEnum.ENTITY,
      fileUrl: s3Path,
    });

    return;
  }
}
