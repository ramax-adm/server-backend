import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OdbcService } from 'src/config/database/obdc/odbc.service';
import {
  IncomingBatchesSyncRequestDto,
  IncomingBatchesSyncRequestInput,
} from './dtos/incoming-batch-sync.dto';
import { IncomingBatches } from 'src/entities/typeorm/incoming-batch.entity';
import { FileUtils } from 'src/utils/file.utils';
import { DateUtils } from 'src/utils/date.utils';
import { S3StorageService } from 'src/aws';
import { UtilsStorageSyncedFile } from 'src/entities/typeorm/utils-storage-synced-file.entity';
import { EntitiesEnum, StorageTypesEnum } from 'src/common/constants/utils';
import { EnvService } from 'src/config/env/env.service';
import { ODBC_PROVIDER } from 'src/config/database/obdc/providers/odbc.provider';
import { ArrayUtils } from 'src/utils/array.utils';

@Injectable()
export class IncomingBatchSyncService {
  // QUERY SENSATTA
  private query = `
SELECT 
    LE.DATA_PRODUCAO,
    LE.DATA_ABATE,
    LE.DATA_IMPRESSA,
    LE.DATA_VALIDADE,
    TM.DESCRICAO AS TIPO_MOVIMENTACAO,
    EMP.CODIGO_EMPRESA,
    L.CODIGO_LINHA,
    P.CODIGO_PRODUTO,
    LE.CODIGO_ALMOXARIFADO,
    COUNT(*) AS CAIXAS,
    SUM(LE.QUANTIDADE) AS QUANTIDADE,
    SUM(LE.PESO) AS PESO
    
FROM sigma_pcp.lote_entrada LE
JOIN SIGMA_MAT.ALMOXARIFADO AM ON LE.CODIGO_ALMOXARIFADO = AM.CODIGO_ALMOXARIFADO
JOIN SIGMA_MAT.TIPO_MOVIMENTACAO TM ON LE.TIPO_MOVIMENTO = TM.CODIGO_TIPO_MOVIMENTACAO
JOIN sigma_fis.empresa EMP ON AM.CODIGO_EMPRESA = EMP.codigo_empresa
JOIN SIGMA_VEN.PRODUTO P ON LE.SEQUENCIAL_PRODUTO = P.SEQUENCIAL_PRODUTO
JOIN SIGMA_VEN.LINHA L ON P.SEQUENCIAL_LINHA = L.SEQUENCIAL_LINHA
      

WHERE LE.EXPEDIDO = 0
  AND LE.CANCELADO = 0 
GROUP BY 
    LE.DATA_PRODUCAO,
    LE.DATA_ABATE,
    LE.DATA_IMPRESSA,
    LE.DATA_VALIDADE,
    TM.DESCRICAO,
    EMP.CODIGO_EMPRESA,
    L.CODIGO_LINHA,
    P.CODIGO_PRODUTO,
    LE.CODIGO_ALMOXARIFADO; `;

  constructor(
    @Inject('STORAGE_SERVICE')
    private readonly storageService: S3StorageService,
    @Inject(ODBC_PROVIDER)
    private readonly odbcService: OdbcService,
    private readonly dataSource: DataSource,
    private readonly envService: EnvService,
  ) {}

  async getData() {
    const response =
      await this.odbcService.query<IncomingBatchesSyncRequestInput>(this.query);

    return response?.map((item) => new IncomingBatchesSyncRequestDto(item));
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
      await queryRunner.manager.delete(IncomingBatches, {});

      const batchSize = 2000; // ajuste conforme necessário
      const chunks = ArrayUtils.chunkArray(sensattaData, batchSize);

      for (const chunk of chunks) {
        await queryRunner.manager.save(IncomingBatches, chunk);
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
    const data = await this.dataSource.manager.find(IncomingBatches);
    const buffer = await FileUtils.toCsv(data);
    const s3Path = `sync-sensatta-snapshots/incoming-batches-${DateUtils.getFileDate()}.csv`;

    await this.storageService.upload({
      Bucket: this.envService.get('AWS_S3_BUCKET'),
      Key: s3Path,
      Body: buffer,
    });

    await this.dataSource.manager.save(UtilsStorageSyncedFile, {
      storageType: StorageTypesEnum.S3,
      entity: EntitiesEnum.INCOMING_BATCHES,
      fileUrl: s3Path,
    });

    return;
  }
}
