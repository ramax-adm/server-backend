import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OdbcService } from 'src/config/database/obdc/odbc.service';
import {
  CompanySyncRequestDto,
  CompanySyncRequestInput,
} from './dtos/company-sync.dto';
import { Company } from 'src/entities/typeorm/company.entity';
import {
  AccountGroupSyncRequestDto,
  AccountGroupSyncRequestInput,
} from './dtos/account-group-sync.dto';
import { AccountGroup } from 'src/entities/typeorm/account-group.entity';

@Injectable()
export class AccountGroupSyncService {
  // QUERY SENSATTA
  private query = `
    SELECT 
        CODIGO_GRUPO_EMPENHO,
        DESCRICAO AS GRUPO_EMPENHO,
        TIPO
    FROM sigma_ger.grupo_empenho; `;

  constructor(
    @Inject('ODBC SERVICE')
    private readonly odbcService: OdbcService,
    private readonly dataSource: DataSource,
  ) {}

  async getData() {
    const response = await this.odbcService.query<AccountGroupSyncRequestInput>(
      this.query,
    );

    return response?.map((item) => new AccountGroupSyncRequestDto(item));
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

      await queryRunner.manager.delete(AccountGroup, {});
      await queryRunner.manager.insert(AccountGroup, sensattaData);
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error({ error });
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
