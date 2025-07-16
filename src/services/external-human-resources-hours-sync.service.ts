import { Inject, Injectable } from '@nestjs/common';
import { Between, DataSource, Not } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { ArrayUtils } from 'src/utils/array.utils';
import { ExternalHumanResourcesHour } from 'src/entities/typeorm/external-human-resources-hour.entity';
import { ExcelUtils } from 'src/utils/excel.utils';
import { ExternalHumanResourcesHoursSyncRequestInput } from './dtos/external-human-resources-hours-sync.dto';

@Injectable()
export class ExternalHumanResourceHoursSyncService {
  constructor(private readonly dataSource: DataSource) {}

  async getData(
    file: Express.Multer.File,
  ): Promise<Partial<ExternalHumanResourcesHour>[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);

    console.log('load');

    const sheet = workbook.worksheets[0]; // Pegando a primeira aba
    const result: Partial<ExternalHumanResourcesHour>[] = [];

    sheet.eachRow((row, rowNumber) => {
      console.log('J', row.getCell('J').text);
    });

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Pular cabeçalho

      const payload: Partial<ExternalHumanResourcesHour> = {
        date: ExcelUtils.parseDate(row.getCell('A').value),
        payrollNumber: '',
        department: row.getCell('B').text.trim(),
        employeeName: row.getCell('C').text.trim(),
        normalHours:
          ExcelUtils.parseHours(row.getCell('J').value) ?? '00:00:00',
        absenceHours:
          ExcelUtils.parseHours(row.getCell('K').value) ?? '00:00:00',
        fullExtraHours:
          ExcelUtils.parseHours(row.getCell('L').value) ?? '00:00:00',
        hoursOff: '00:00:00',
        halfExtraHours: '00:00:00',
        absenceJustification: '',
      };

      result.push(payload);
    });

    return result;
  }

  async processData(
    file: Express.Multer.File,
    dto: ExternalHumanResourcesHoursSyncRequestInput,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const data = await this.getData(file);

      const dates = data
        .filter((i) => i.date)
        .map((i) => new Date(i.date!))
        .sort((a, b) => a.getTime() - b.getTime());

      const startDate = dates[0];
      const endDate = dates[dates.length - 1];

      const updatedData = data.map((item) => ({
        ...item,
        integrationSystem: dto.integrationSystem,
        companyCode: dto.companyCode,
      }));

      await queryRunner.manager.delete(ExternalHumanResourcesHour, {
        companyCode: dto.companyCode,
        date: Between(startDate, endDate),
      });

      const batchSize = 2000; // ajuste conforme necessário
      const chunks = ArrayUtils.chunkArray(updatedData, batchSize);

      for (const chunk of chunks) {
        await queryRunner.manager.save(ExternalHumanResourcesHour, chunk);
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
