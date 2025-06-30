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
FROM sigma_ven.produto; `;

  constructor(
    @Inject('ODBC SERVICE')
    private readonly odbcService: OdbcService,
    private readonly dataSource: DataSource,
  ) {}

  async getData() {
    const response = await this.odbcService.query<ProductSyncRequestInput>(
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
}
