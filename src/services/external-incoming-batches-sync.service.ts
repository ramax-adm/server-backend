import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { GetProductsWithLinesQueryResponse } from 'src/types/external-incoming-batches.types';
import { ExternalIncomingBatch } from 'src/entities/typeorm/external-incoming-batch.entity';
import { GET_PRODUCTS_WITH_LINE_QUERY } from 'src/common/constants/external-incoming-batch';
import { ExternalIncomingBatchSyncRequestInput } from './dtos/external-incoming-batches-sync.dto';
import { ArrayUtils } from 'src/utils/array.utils';

@Injectable()
export class ExternalIncomingBatchSyncService {
  constructor(private readonly dataSource: DataSource) {}

  async getData(
    file: Express.Multer.File,
  ): Promise<Partial<ExternalIncomingBatch>[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);

    console.log('load');

    const sheet = workbook.worksheets[0]; // Pegando a primeira aba
    const result: Partial<ExternalIncomingBatch>[] = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Pular cabeçalho

      const payload: Partial<ExternalIncomingBatch> = {
        productInternalCode: row.getCell('A').text.trim(),
        productCode: '',
        productLineCode: '',
        productionDate: this.parseDate(row.getCell('C').value),
        dueDate: this.parseDate(row.getCell('E').value),
        boxAmount: Number(row.getCell('H').value) || 0,
        quantity: Number(row.getCell('I').value) || 0,
        weightInKg: Number(row.getCell('J').value) || 0,
      };

      result.push(payload);
    });

    return result;
  }

  private parseDate(value: ExcelJS.CellValue): Date {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'object' && value && 'result' in value) {
      return new Date(value.result as string | number);
    }

    if (typeof value === 'string') {
      const parts = value.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        return new Date(year, month - 1, day);
      }
      return new Date(value);
    }

    return new Date(); // fallback
  }

  async processData(
    file: Express.Multer.File,
    dto: ExternalIncomingBatchSyncRequestInput,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const products = await this.dataSource.query<
        GetProductsWithLinesQueryResponse[]
      >(GET_PRODUCTS_WITH_LINE_QUERY);

      const data = await this.getData(file);

      const updatedData = data.map((item) => {
        const relatedProduct = products.find(
          (i) => i.productinternalcode == item.productInternalCode,
        );

        return {
          ...item,
          integrationSystem: dto.integrationSystem,
          companyCode: dto.companyCode,

          productCode: relatedProduct?.productcode ?? 'N/D',
          productLineCode: relatedProduct?.productlinecode ?? 'N/D',
        };
      });

      await queryRunner.manager.delete(ExternalIncomingBatch, {});

      const batchSize = 2000; // ajuste conforme necessário
      const chunks = ArrayUtils.chunkArray(updatedData, batchSize);

      for (const chunk of chunks) {
        await queryRunner.manager.save(ExternalIncomingBatch, chunk);
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
