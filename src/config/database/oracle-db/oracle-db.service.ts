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

  private async getConnection(): Promise<oracledb.Connection> {
    return await oracledb.getConnection({
      user: this.config.user,
      password: this.config.password,
      connectString: this.config.connectString,
    });
  }

  async runQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
    const connection = await this.getConnection();

    try {
      const result = await connection.execute<T>(query, params, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      return result.rows as T[];
    } finally {
      await connection.close();
    }
  }

  async *runCursorStream<T = any>(
    query: string,
    params: any[] = [],
    fetchSize = 2000,
  ): AsyncGenerator<T[], void, unknown> {
    const connection = await this.getConnection();

    try {
      const result = await connection.execute(query, params, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        resultSet: true,
      });

      if (!result.resultSet) {
        return;
      }

      let batch: T[];
      while (
        (batch = (await result.resultSet.getRows(fetchSize)) as T[]).length > 0
      ) {
        yield batch; // devolve o lote atual
      }

      await result.resultSet.close();
    } finally {
      await connection.close();
    }
  }
}
