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
import { FileUtils } from 'src/utils/file.utils';
import { S3StorageService } from 'src/aws';
import { EnvService } from 'src/config/env/env.service';
import { DateUtils } from 'src/utils/date.utils';
import { UtilsStorageSyncedFile } from 'src/entities/typeorm/utils-storage-synced-file.entity';
import { EntitiesEnum, StorageTypesEnum } from 'src/common/constants/utils';
import { ODBC_PROVIDER } from 'src/config/database/obdc/providers/odbc.provider';

@Injectable()
export class CompanySyncService {
  // QUERY SENSATTA
  private query = `
    select 
        emp.codigo_empresa,
        emp.nome_fantasia,
        emp.uf,
        emp.cidade,
        emp.endereco,
        emp.bairro,
        emp.cep,
        emp.fone,
        emp.E_MAIL,
        emp.inscricao_estadual
    from sigma_fis.empresa emp `;

  constructor(
    @Inject('STORAGE_SERVICE')
    private readonly storageService: S3StorageService,
    @Inject(ODBC_PROVIDER)
    private readonly odbcService: OdbcService,
    private readonly dataSource: DataSource,
    private readonly envService: EnvService,
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
        name: 'PARAGOMINAS - PA',
        city: 'PARAGOMINAS',
        fantasyName: 'PARAGOMINAS - PA',
        address: 'N/D',
        email: 'N/D',
        neighbourd: 'N/D',
        phone: 'N/D',
        stateSubscription: 'N/D',
        zipcode: 'N/D',
        isConsideredOnStock: true,
        priceTableNumberCar: '300',
        priceTableNumberTruck: '299',
        sensattaCode: '918',
        uf: 'PA',
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

  async syncWithStorage() {
    const data = await this.dataSource.manager.find(Company);
    const buffer = await FileUtils.toCsv(data);
    const s3Path = `sync-sensatta-snapshots/company-${DateUtils.getFileDate()}.csv`;

    await this.storageService.upload({
      Bucket: this.envService.get('AWS_S3_BUCKET'),
      Key: s3Path,
      Body: buffer,
    });

    await this.dataSource.manager.save(UtilsStorageSyncedFile, {
      storageType: StorageTypesEnum.S3,
      entity: EntitiesEnum.COMPANY,
      fileUrl: s3Path,
    });

    return;
  }
}
