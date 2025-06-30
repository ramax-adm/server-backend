import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OdbcService } from 'src/config/database/obdc/odbc.service';
import { CATTLE_PURCHASE_FREIGHTS_QUERY } from 'src/common/constants/cattle-purchase-freights';
import {
  CattlePurchaseFreightsSyncRequestDto,
  CattlePurchaseFreightsSyncRequestInput,
} from './dtos/cattle-purchase-freights-sync.dto';
import { CattlePurchaseFreight } from 'src/entities/typeorm/cattle-purchase-freight.entity';
import { ArrayUtils } from 'src/utils/array.utils';

@Injectable()
export class CattlePurchaseFreightsSyncService {
  // QUERY SENSATTA
  private startDate = '01/01/2025';
  private query = CATTLE_PURCHASE_FREIGHTS_QUERY.replaceAll(
    '$1',
    `'${this.startDate}'`,
  );

  constructor(
    @Inject('ODBC SERVICE')
    private readonly odbcService: OdbcService,
    private readonly dataSource: DataSource,
  ) {}

  async getData() {
    const response =
      await this.odbcService.query<CattlePurchaseFreightsSyncRequestInput>(
        this.query,
      );

    return response?.map(
      (item) => new CattlePurchaseFreightsSyncRequestDto(item),
    );
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

      await queryRunner.manager.delete(CattlePurchaseFreight, {});
      const batchSize = 2000; // ajuste conforme necessário
      const chunks = ArrayUtils.chunkArray(sensattaData, batchSize);

      for (const chunk of chunks) {
        await queryRunner.manager.save(CattlePurchaseFreight, chunk);
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
}
