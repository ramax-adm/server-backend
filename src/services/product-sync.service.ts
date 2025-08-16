import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OdbcService } from 'src/config/database/obdc/odbc.service';
import {
  ProductSyncRequestDto,
  ProductSyncRequestInput,
} from './dtos/product-sync.dto';
import { Product } from 'src/entities/typeorm/product.entity';
import { EntitiesEnum, StorageTypesEnum } from 'src/common/constants/utils';
import { Client } from 'src/entities/typeorm/client.entity';
import { UtilsStorageSyncedFile } from 'src/entities/typeorm/utils-storage-synced-file.entity';
import { DateUtils } from 'src/utils/date.utils';
import { FileUtils } from 'src/utils/file.utils';
import { S3StorageService } from 'src/aws';
import { EnvService } from 'src/config/env/env.service';
import { ProductLine } from 'src/entities/typeorm/product-line.entity';
import { ODBC_PROVIDER } from 'src/config/database/obdc/providers/odbc.provider';
import { OracleService } from 'src/config/database/oracle-db/oracle-db.service';
import { ORACLE_DB_PROVIDER } from 'src/config/database/oracle-db/providers/oracle-db.provider';

@Injectable()
export class ProductSyncService {
  // QUERY SENSATTA
  private query = `
SELECT 
        sequencial_produto,
        codigo_produto,
        descricao,
        sequencial_linha,
        codigo_unidade_medida,
        TIPO_CLASSIFICACAO 
FROM sigma_ven.produto `;

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
    const response = await this.oracleService.runQuery<ProductSyncRequestInput>(
      this.query,
    );

    return response?.map((item) => new ProductSyncRequestDto(item));
  }

  async processData() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sensattaData = await this.getData();

      if (!sensattaData) {
        throw new UnprocessableEntityException(
          'Não foi possível buscar dados no Sensatta',
        );
      }

      sensattaData.push({
        classificationType: 'N/D',
        name: 'Sem DE/PARA',
        productLineId: 'N/D',
        sensattaCode: 'N/D',
        sensattaId: 'N/D',
        unitCode: 'KG',
      });

      await queryRunner.manager.delete(Product, {});
      await queryRunner.manager.insert(Product, sensattaData);
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
    const [products, productLines] = await Promise.all([
      this.dataSource.manager.find(Product),
      this.dataSource.manager.find(ProductLine),
    ]);
    const data = products.map((p) => {
      const relatedProductLine = productLines.find(
        (pl) => pl.sensattaId === p.productLineId,
      );
      return {
        id: p.id,
        sensattaId: p.sensattaId,
        sensattaCode: p.sensattaCode,
        name: p.name,
        productLineId: p.productLineId,
        productLineName: relatedProductLine?.name,
        unitCode: p.unitCode,
        classificationType: p.classificationType,
      };
    });
    const buffer = await FileUtils.toCsv(data);
    const s3Path = `sync-sensatta-snapshots/${EntitiesEnum.PRODUCT}-${DateUtils.getFileDate()}.csv`;

    await this.storageService.upload({
      Bucket: this.envService.get('AWS_S3_BUCKET'),
      Key: s3Path,
      Body: buffer,
    });

    await this.dataSource.manager.save(UtilsStorageSyncedFile, {
      storageType: StorageTypesEnum.S3,
      entity: EntitiesEnum.PRODUCT,
      fileUrl: s3Path,
    });

    return;
  }
}
