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

@Injectable()
export class CompanySyncService {
  // QUERY SENSATTA
  private query = `
    select 
        emp.codigo_empresa,
        emp.nome_fantasia,
        emp.uf,
        emp.cidade         
    from sigma_fis.empresa emp `;

  constructor(
    @Inject('ODBC SERVICE')
    private readonly odbcService: OdbcService,
    private readonly dataSource: DataSource,
  ) {}

  async getData() {
    const response = await this.odbcService.query<CompanySyncRequestInput>(
      this.query,
    );

    return response?.map((item) => new CompanySyncRequestDto(item));
  }

  async processData() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [sensattaData, previousData] = await Promise.all([
        this.getData(),
        queryRunner.manager.find(Company),
      ]);

      if (!sensattaData) {
        throw new UnprocessableEntityException(
          'Não foi possível buscar dados no Sensatta',
        );
      }

      const consideredStockCodes = new Set(
        previousData
          .filter((c) => c.isConsideredOnStock)
          .map((c) => c.sensattaCode),
      );
      const previousCompanies = new Map(
        previousData.map((p) => [
          p.sensattaCode,
          {
            name: p.name,
            priceTableNumberCar: p.priceTableNumberCar,
            priceTableNumberTruck: p.priceTableNumberTruck,
          },
        ]),
      );

      const updatedData = sensattaData.map((item) => {
        const previousCompany = previousCompanies.get(item.sensattaCode);
        return {
          ...item,
          name: previousCompany?.name || item.name,
          priceTableNumberCar: previousCompany?.priceTableNumberCar,
          priceTableNumberTruck: previousCompany?.priceTableNumberTruck,
          isConsideredOnStock: consideredStockCodes.has(item.sensattaCode),
        };
      });

      // PROVISORIO
      updatedData.push({
        name: 'FERNANDOPOLIS TESTE',
        city: 'FERNANDOPOLIS',
        fantasyName: 'FERNANDOPOLIS TESTE',
        isConsideredOnStock: true,
        priceTableNumberCar: '300',
        priceTableNumberTruck: '299',
        sensattaCode: '13',
        uf: 'SP',
      });

      await queryRunner.manager.delete(Company, {});
      await queryRunner.manager.insert(Company, updatedData);
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error({ error });
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
