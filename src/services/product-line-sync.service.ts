import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Warehouse } from 'src/entities/typeorm/warehouse.entity';
import { DataSource } from 'typeorm';
import {
  WarehouseSyncRequestDto,
  WarehouseSyncRequestInput,
} from './dtos/warehouse-sync.dto';
import { OdbcService } from 'src/config/database/obdc/odbc.service';
import {
  ProductLineSyncRequestDto,
  ProductLineSyncRequestInput,
} from './dtos/product-line-sync.dto';
import { ProductLine } from 'src/entities/typeorm/product-line.entity';

@Injectable()
export class ProductLineSyncService {
  // QUERY SENSATTA
  private query = `
    select 
        SEQUENCIAL_LINHA,
        CODIGO_LINHA,
        DESCRICAO,
        SIGLA
    from SIGMA_VEN.LINHA;`;

  constructor(
    @Inject('ODBC SERVICE')
    private readonly odbcService: OdbcService,
    private readonly dataSource: DataSource,
  ) {}

  async getData() {
    const response = await this.odbcService.query<ProductLineSyncRequestInput>(
      this.query,
    );

    return response?.map((item) => new ProductLineSyncRequestDto(item));
  }

  async processData() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [sensattaData, previousData] = await Promise.all([
        this.getData(),
        queryRunner.manager.find(ProductLine),
      ]);

      if (!sensattaData) {
        throw new UnprocessableEntityException(
          'Não foi possível buscar dados no Sensatta',
        );
      }

      const consideredStockCodes = new Set(
        previousData
          .filter((pl) => pl.isConsideredOnStock)
          .map((pl) => pl.sensattaCode),
      );

      const updatedData = sensattaData.map((item) => ({
        ...item,
        isConsideredOnStock: consideredStockCodes.has(item.sensattaCode),
      }));

      await queryRunner.manager.delete(ProductLine, {});
      await queryRunner.manager.insert(ProductLine, updatedData);
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error({ error });
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
