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
import { ArrayUtils } from 'src/utils/array.utils';

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
      const batchSize = 3000; // ajuste conforme necessário
      const chunks = ArrayUtils.chunkArray(sensattaData, batchSize);

      for (const chunk of chunks) {
        await queryRunner.manager.save(ReferencePrice, chunk);
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
