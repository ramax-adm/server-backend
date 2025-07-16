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

@Injectable()
export class ProductionMovementSyncService {
  // QUERY SENSATTA
  private query = PRODUCTION_MOVEMENT_QUERY;

  constructor(
    @Inject('STORAGE_SERVICE')
    private readonly storageService: S3StorageService,
    @Inject('ODBC SERVICE')
    private readonly odbcService: OdbcService,
    private readonly dataSource: DataSource,
    private readonly envService: EnvService,
  ) {}

  async getData() {
    const response =
      await this.odbcService.query<ProductionMovementSyncRequestInput>(
        this.query,
      );

    return response?.map((item) => new ProductionMovementSyncRequestDto(item));
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

      await queryRunner.manager.delete(ProductionMovement, {});
      const batchSize = 3000; // ajuste conforme necessário
      const chunks = ArrayUtils.chunkArray(sensattaData, batchSize);

      for (const chunk of chunks) {
        await queryRunner.manager.save(ProductionMovement, chunk);
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
