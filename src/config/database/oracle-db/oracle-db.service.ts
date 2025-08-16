// oracle.service.ts
import { Injectable } from '@nestjs/common';
import * as oracledb from 'oracledb';
import { OracleConfig } from './interface/oracle-db-config.interface';

@Injectable()
export class OracleService {
  constructor(private readonly config: OracleConfig) {
    // Inicializa o Oracle Client e TNS_ADMIN apenas uma vez
    oracledb.initOracleClient({ libDir: config.libDir });
    process.env.TNS_ADMIN = config.tnsAdmin;
  }

  async runQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
    const connection = await oracledb.getConnection({
      user: this.config.user,
      password: this.config.password,
      connectString: this.config.connectString,
    });

    try {
      const result = await connection.execute<T>(query, params, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      return result.rows as T[];
    } finally {
      await connection.close();
    }
  }
}
