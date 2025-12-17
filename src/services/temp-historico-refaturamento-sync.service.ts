import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EnvService } from 'src/config/env/env.service';
import { ORACLE_DB_PROVIDER } from 'src/config/database/oracle-db/providers/oracle-db.provider';
import { OracleService } from 'src/config/database/oracle-db/oracle-db.service';
import { TEMP_BALANCETE_QUERY } from 'src/common/constants/temp-balancete';
import { TempHistoricoRefaturamento } from 'src/entities/typeorm/temp-historico-refaturamento.entity';
import { TempHistoricoRefaturamentoSyncRequestDto } from './dtos/temp-historico-refaturamento.dto';
import { TEMP_HISTORICO_REFATURAMENTO_QUERY } from 'src/common/constants/temp-historico-refaturamento';

@Injectable()
export class TempHistoricoRefaturamentoSyncService {
  // QUERY SENSATTA
  private query = TEMP_HISTORICO_REFATURAMENTO_QUERY;

  constructor(
    @Inject(ORACLE_DB_PROVIDER)
    private readonly oracleService: OracleService,
    private readonly dataSource: DataSource,
    private readonly envService: EnvService,
  ) {}

  async *getDataStream() {
    const dataIterator =
      this.oracleService.runCursorStream<TempHistoricoRefaturamentoSyncRequestDto>(
        this.query,
        {},
        2000, // cada lote com até 2000 objetos
      );
    for await (const batch of dataIterator) {
      yield batch.map(
        (item) => new TempHistoricoRefaturamentoSyncRequestDto(item),
      );
    }
  }

  async processData() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // limpa a tabela antes
      await queryRunner.manager.delete(TempHistoricoRefaturamento, {});

      // processa lote a lote
      for await (const batch of this.getDataStream()) {
        await queryRunner.manager.insert(TempHistoricoRefaturamento, batch);
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
