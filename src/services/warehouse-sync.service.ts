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

@Injectable()
export class WarehouseSyncService {
  // QUERY SENSATTA
  private query = `
    select 
      CODIGO_ALMOXARIFADO,
      CODIGO_EMPRESA,
      NOME
    from SIGMA_MAT.ALMOXARIFADO; `;

  constructor(
    @Inject('ODBC SERVICE')
    private readonly odbcService: OdbcService,
    private readonly dataSource: DataSource,
  ) {}

  async getData() {
    const response = await this.odbcService.query<WarehouseSyncRequestInput>(
      this.query,
    );

    return response?.map((item) => new WarehouseSyncRequestDto(item));
  }

  async processData() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [sensattaData, previousData] = await Promise.all([
        this.getData(),
        queryRunner.manager.find(Warehouse),
      ]);

      if (!sensattaData) {
        throw new UnprocessableEntityException(
          'Não foi possível buscar dados no Sensatta',
        );
      }

      const consideredStockCodes = new Set(
        previousData
          .filter((w) => w.isConsideredOnStock)
          .map((w) => w.sensattaCode),
      );

      const updatedData = sensattaData.map((item) => ({
        ...item,
        isConsideredOnStock: consideredStockCodes.has(item.sensattaCode),
        isActive: consideredStockCodes.has(item.sensattaCode),
      }));

      await queryRunner.manager.delete(Warehouse, {});
      await queryRunner.manager.insert(Warehouse, updatedData);
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
