import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OdbcService } from 'src/config/database/obdc/odbc.service';
import { ReferencePrice } from 'src/entities/typeorm/reference-price.entity';
import {
  ReferencePriceSyncRequestDto,
  ReferencePriceSyncRequestInput,
} from './dtos/reference-price-sync.dto';

@Injectable()
export class ReferencePriceSyncService {
  // QUERY SENSATTA
  private query = `
SELECT 
    IP.SEQUENCIAL_ITEM_PRECO,
    IP.SEQUENCIAL_PRODUTO,
    TP.SEQUENCIAL_TABELA_PRECO,
    TP.CODIGO_EMPRESA,
    TP.NUMERO_TABELA,
    TP.DESCRICAO,
    IP.PRECO
FROM SIGMA_VEN.ITEM_PRECO IP
LEFT JOIN SIGMA_VEN.TABELA_PRECO TP ON TP.SEQUENCIAL_TABELA_PRECO = IP.SEQUENCIAL_TABELA_PRECO;`;

  constructor(
    @Inject('ODBC SERVICE')
    private readonly odbcService: OdbcService,
    private readonly dataSource: DataSource,
  ) {}

  async getData() {
    const response =
      await this.odbcService.query<ReferencePriceSyncRequestInput>(this.query);

    return response?.map((item) => new ReferencePriceSyncRequestDto(item));
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

      await queryRunner.manager.delete(ReferencePrice, {});
      await queryRunner.manager.insert(ReferencePrice, sensattaData);
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
