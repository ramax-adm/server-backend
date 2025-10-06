import { Inject, Injectable } from '@nestjs/common';
import { Between, DataSource, Not } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { ArrayUtils } from 'src/utils/array.utils';
import { ExternalHumanResourcesHour } from 'src/entities/typeorm/external-human-resources-hour.entity';
import { ExcelUtils } from 'src/utils/excel.utils';
import { ExternalHumanResourcesHoursSyncRequestInput } from './dtos/external-human-resources-hours-sync.dto';
import { User } from 'src/entities/typeorm/user.entity';
import { hashSync } from 'bcryptjs';

@Injectable()
export class UserSyncService {
  constructor(private readonly dataSource: DataSource) {}

  async getData(file: Express.Multer.File): Promise<Partial<User>[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);

    const sheet = workbook.worksheets[0]; // Pegando a primeira aba
    const result: Partial<User>[] = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Pular cabeçalho

      const name = row.getCell('B').text;
      const email = row.getCell('A').text;

      // Pega apenas o primeiro nome
      const firstName = name
        .split(' ')[0]
        .normalize('NFD') // separa letras de acentos
        .replace(/[\u0300-\u036f]/g, '') // remove os acentos
        .toLowerCase();

      const payload: Partial<User> = {
        email,
        name,
        cpf: '00000000000',
        isActive: true,
        password: hashSync(firstName.concat('123'), 10),
        role: 'other',
      };

      result.push(payload);
    });

    return result;
  }

  async processData(file: Express.Multer.File) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [data, savedUsers] = await Promise.all([
        this.getData(file),
        queryRunner.manager.find(User),
      ]);

      const updatedData = data.filter((i) => {
        const alreadyHaveUser = savedUsers.find((j) => j.email === i.email);

        if (alreadyHaveUser) {
          return;
        }

        return i;
      });

      console.log('Rows to insert', updatedData.length);

      await queryRunner.manager.save(User, updatedData);

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
