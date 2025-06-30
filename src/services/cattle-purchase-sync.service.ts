import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OdbcService } from 'src/config/database/obdc/odbc.service';
import { ArrayUtils } from 'src/utils/array.utils';
import { CATTLE_PURCHASE_QUERY } from 'src/common/constants/cattle-purchase';
import {
  CattlePurchaseSyncRequestDto,
  CattlePurchaseSyncRequestInput,
} from './dtos/cattle-purchase-sync.dto';
import { CattlePurchase } from 'src/entities/typeorm/cattle-purchase.entity';
import { EntitiesEnum, StorageTypesEnum } from 'src/common/constants/utils';
import { StockBalance } from 'src/entities/typeorm/stock-balance.entity';
import { UtilsStorageSyncedFile } from 'src/entities/typeorm/utils-storage-synced-file.entity';
import { DateUtils } from 'src/utils/date.utils';
import { FileUtils } from 'src/utils/file.utils';
import { NumberUtils } from 'src/utils/number.utils';
import { S3StorageService } from 'src/aws';
import { EnvService } from 'src/config/env/env.service';

@Injectable()
export class CattlePurchaseSyncService {
  // QUERY SENSATTA
  private startDate = '01/01/2025';
  private query = CATTLE_PURCHASE_QUERY.replaceAll('$1', `'${this.startDate}'`);

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
      await this.odbcService.query<CattlePurchaseSyncRequestInput>(this.query);
    console.log('length', response?.length);

    return response?.map((item) => new CattlePurchaseSyncRequestDto(item));
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

      await queryRunner.manager.delete(CattlePurchase, {});
      const batchSize = 3000; // ajuste conforme necessário
      const chunks = ArrayUtils.chunkArray(sensattaData, batchSize);

      for (const chunk of chunks) {
        await queryRunner.manager.save(CattlePurchase, chunk);
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
    const data = await this.dataSource.manager.find(CattlePurchase);

    const parsedData = data.map((i) => ({
      ...i,
      cattleWeightInArroba: NumberUtils.nb2(i.cattleWeightInArroba),
      commissionPrice: NumberUtils.nb2(i.commissionPrice),
      freightPrice: NumberUtils.nb2(i.freightPrice),
      purchasePrice: NumberUtils.nb2(i.purchasePrice),
      totalValue: NumberUtils.nb2(i.totalValue),
    }));
    const buffer = await FileUtils.toCsv(parsedData);
    const s3Path = `sync-sensatta-snapshots/${EntitiesEnum.CATTLE_PURCHASE}-${DateUtils.getFileDate()}.csv`;

    await this.storageService.upload({
      Bucket: this.envService.get('AWS_S3_BUCKET'),
      Key: s3Path,
      Body: buffer,
    });

    await this.dataSource.manager.save(UtilsStorageSyncedFile, {
      storageType: StorageTypesEnum.S3,
      entity: EntitiesEnum.CATTLE_PURCHASE,
      fileUrl: s3Path,
    });

    return;
  }
}
