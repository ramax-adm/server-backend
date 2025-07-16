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

@Injectable()
export class ClientSyncService {
  // QUERY SENSATTA
  private query = CLIENT_QUERY;

  constructor(
    @Inject('STORAGE_SERVICE')
    private readonly storageService: S3StorageService,
    @Inject('ODBC SERVICE')
    private readonly odbcService: OdbcService,
    private readonly dataSource: DataSource,
    private readonly envService: EnvService,
  ) {}

  async getData() {
    const response = await this.odbcService.query<ClientSyncRequestInput>(
      this.query,
    );

    return response?.map((item) => new ClientSyncRequestDto(item));
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

      await queryRunner.manager.delete(Client, {});
      const batchSize = 3000; // ajuste conforme necessário
      const chunks = ArrayUtils.chunkArray(sensattaData, batchSize);

      for (const chunk of chunks) {
        await queryRunner.manager.save(Client, chunk);
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
    const data = await this.dataSource.manager.find(Client);

    const buffer = await FileUtils.toCsv(data);
    const s3Path = `sync-sensatta-snapshots/${EntitiesEnum.CLIENT}-${DateUtils.getFileDate()}.csv`;

    await this.storageService.upload({
      Bucket: this.envService.get('AWS_S3_BUCKET'),
      Key: s3Path,
      Body: buffer,
    });

    await this.dataSource.manager.save(UtilsStorageSyncedFile, {
      storageType: StorageTypesEnum.S3,
      entity: EntitiesEnum.CLIENT,
      fileUrl: s3Path,
    });

    return;
  }
}
