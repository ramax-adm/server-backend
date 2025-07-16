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
import { PRODUCT_INVOICE_QUERY } from 'src/common/constants/product-invoice';
import { ProductInvoice } from 'src/entities/typeorm/product-invoce.entity';
import {
  ProductInvoiceSyncRequestInput,
  ProductInvoiceSyncRequestDto,
} from './dtos/product-invoice-sync.dto';

@Injectable()
export class ProductInvoiceSyncService {
  // QUERY SENSATTA
  private startDate = '01/01/2025';
  private query = PRODUCT_INVOICE_QUERY.replaceAll('$1', `'${this.startDate}'`);

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
      await this.odbcService.query<ProductInvoiceSyncRequestInput>(this.query);

    return response?.map((item) => new ProductInvoiceSyncRequestDto(item));
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

      await queryRunner.manager.delete(ProductInvoice, {});
      const batchSize = 3000; // ajuste conforme necessário
      const chunks = ArrayUtils.chunkArray(sensattaData, batchSize);

      for (const chunk of chunks) {
        await queryRunner.manager.save(ProductInvoice, chunk);
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
    const data = await this.dataSource.manager.find(ProductInvoice);

    const parsedData = data.map((i) => ({
      ...i,
      unitPrice: NumberUtils.nb2(i.unitPrice ?? 0),
      totalPrice: NumberUtils.nb2(i.totalPrice ?? 0),
      weightInKg: NumberUtils.nb2(i.weightInKg ?? 0),
      boxAmount: NumberUtils.nb0(i.boxAmount ?? 0),
    }));
    const buffer = await FileUtils.toCsv(parsedData);
    const s3Path = `sync-sensatta-snapshots/${EntitiesEnum.PRODUCT_INVOICE}-${DateUtils.getFileDate()}.csv`;

    await this.storageService.upload({
      Bucket: this.envService.get('AWS_S3_BUCKET'),
      Key: s3Path,
      Body: buffer,
    });

    await this.dataSource.manager.save(UtilsStorageSyncedFile, {
      storageType: StorageTypesEnum.S3,
      entity: EntitiesEnum.PRODUCT_INVOICE,
      fileUrl: s3Path,
    });

    return;
  }
}
