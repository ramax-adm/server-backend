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

@Injectable()
export class StockBalanceSyncService {
  // QUERY SENSATTA
  private query = STOCK_BALANCE_QUERY;

  constructor(
    @Inject('STORAGE_SERVICE')
    private readonly storageService: S3StorageService,
    @Inject(ODBC_PROVIDER)
    private readonly odbcService: OdbcService,
    private readonly dataSource: DataSource,
    private readonly envService: EnvService,
  ) {}

  async getData() {
    const companies = await this.dataSource.manager.find<Company>(Company, {
      where: {
        isConsideredOnStock: true,
      },
    });

    const response = await this.odbcService.query<StockBalanceSyncRequestInput>(
      this.query.replaceAll(
        '$1',
        companies.map((i) => i.sensattaCode).join(','),
      ),
    );

    console.log('length', response?.length);

    return response?.map((item) => new StockBalanceSyncRequestDto(item));
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

      await queryRunner.manager.delete(StockBalance, {});
      const batchSize = 3000; // ajuste conforme necessário
      const chunks = ArrayUtils.chunkArray(sensattaData, batchSize);

      for (const chunk of chunks) {
        await queryRunner.manager.save(StockBalance, chunk);
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
