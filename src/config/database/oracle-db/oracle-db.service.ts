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
    const connection = await oracledb.getConnection({
      user: this.config.user,
      password: this.config.password,
      connectString: this.config.connectString,
    });

    await connection.execute(`ALTER SESSION SET NLS_NUMERIC_CHARACTERS = ',.'`);
    return connection;
  }

  async runExecution(query: string) {
    const connection = await this.getConnection();
    await connection.execute(query);
  }

  async runQuery<T = any>(
    query: string,
    params: Record<string, any> = {},
  ): Promise<T[]> {
    const connection = await this.getConnection();
    const expandedParams: Record<string, any> = {};
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          // Exemplo: :id_inventarios -> :id_inventarios_0, :id_inventarios_1...
          const placeholders = value.map((_, i) => `:${key}_${i}`).join(', ');

          // substitui todas as ocorrências de :id_inventarios no SQL
          query = query.replace(new RegExp(`:${key}\\b`, 'g'), placeholders);

          // adiciona binds individuais
          value.forEach((v, i) => {
            expandedParams[`${key}_${i}`] = v;
          });
        } else {
          expandedParams[key] = value;
        }
      }
    }

    try {
      const result = await connection.execute<T>(query, expandedParams, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      return result.rows as T[];
    } finally {
      await connection.close();
    }
  }

  async *runCursorStream<T = any>(
    query: string,
    params: Record<string, any> = {},
    fetchSize = 2000,
  ): AsyncGenerator<T[], void, unknown> {
    const connection = await this.getConnection();
    const expandedParams: Record<string, any> = {};
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          // Exemplo: :id_inventarios -> :id_inventarios_0, :id_inventarios_1...
          const placeholders = value.map((_, i) => `:${key}_${i}`).join(', ');

          // substitui todas as ocorrências de :id_inventarios no SQL
          query = query.replace(new RegExp(`:${key}\\b`, 'g'), placeholders);

          // adiciona binds individuais
          value.forEach((v, i) => {
            expandedParams[`${key}_${i}`] = v;
          });
        } else {
          expandedParams[key] = value;
        }
      }
    }

    console.log(expandedParams);
    try {
      const result = await connection.execute(query, expandedParams, {
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
