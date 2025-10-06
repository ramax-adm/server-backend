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
import { ORDER_LINES_QUERY } from 'src/common/constants/orders';
import {
  OrderLineSyncRequestDto,
  OrderLineSyncRequestInput,
} from './dtos/order-line-sync.dto';
import { OrderLine } from 'src/entities/typeorm/order-line.entity';

@Injectable()
export class OrderLineSyncService {
  // QUERY SENSATTA
  private startDate = '2025-01-01';
  private query = ORDER_LINES_QUERY;

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
      this.oracleService.runCursorStream<OrderLineSyncRequestInput>(
        this.query,
        [this.startDate],
        1000, // cada lote com até 2000 objetos
      );
    for await (const batch of dataIterator) {
      yield batch.map((item) => new OrderLineSyncRequestDto(item));
    }
  }

  async processData() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // limpa a tabela antes
      await queryRunner.manager.delete(OrderLine, {});

      // processa lote a lote
      for await (const batch of this.getDataStream()) {
        await queryRunner.manager.insert(OrderLine, batch);
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
    const data = await this.dataSource.manager.find(OrderLine);

    const parsedData = data.map((i) => ({
      ...i,
      weightInKg: NumberUtils.nb2(i.weightInKg ?? 0),
      costValue: NumberUtils.nb2(i.costValue ?? 0),
      discountPromotionValue: NumberUtils.nb2(i.discountPromotionValue ?? 0),
      saleUnitValue: NumberUtils.nb2(i.saleUnitValue ?? 0),
      totalValue: NumberUtils.nb2(i.totalValue ?? 0),
      referenceTableUnitValue: NumberUtils.nb2(i.referenceTableUnitValue ?? 0),
      receivableTitleValue: NumberUtils.nb2(i.receivableTitleValue ?? 0),
    }));
    const buffer = await FileUtils.toCsv(parsedData);
    const s3Path = `sync-sensatta-snapshots/${EntitiesEnum.ORDER_LINE}-${DateUtils.getFileDate()}.csv`;

    await this.storageService.upload({
      Bucket: this.envService.get('AWS_S3_BUCKET'),
      Key: s3Path,
      Body: buffer,
    });

    await this.dataSource.manager.save(UtilsStorageSyncedFile, {
      storageType: StorageTypesEnum.S3,
      entity: EntitiesEnum.ORDER_LINE,
      fileUrl: s3Path,
    });

    return;
  }
}
