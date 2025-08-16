import { Injectable } from '@nestjs/common';
import { OdbcConfigInterface } from './interface/odbc.config.interface';
import * as odbc from 'odbc';
import { StringUtils } from 'src/utils/string.utils';

@Injectable()
export class OdbcService {
  private connectionString: string;
  private currentConnection: odbc.Connection;

  constructor(private odbcConfig: OdbcConfigInterface) {
    const charset = this.odbcConfig.charset
      ? `CHARSET=${this.odbcConfig.charset};`
      : '';
    this.connectionString = `DSN=${this.odbcConfig.dsn};UID=${this.odbcConfig.user};PWD=${this.odbcConfig.password};`;
  }

  private async connect(): Promise<void> {
    const connection = await odbc.connect(this.connectionString);

    this.currentConnection = connection;
  }

  private async closeConnection(): Promise<void> {
    await this.currentConnection.close();
  }

  async query<T>(rawQuery: string): Promise<T[] | undefined> {
    await this.connect();

    try {
      const result = await this.currentConnection.query(rawQuery);

      const response = Object.entries(result)
        .filter(([key]) => !isNaN(Number(key)))
        .map(([, value]) => value);
      // .map((value) =>
      //   typeof value === 'string'
      //     ? StringUtils.normalize(StringUtils.fixEncoding(value))
      //     : value,
      // );
      return response as T[];
    } catch (error) {
      console.log(error?.odbcErrors[0]);

      console.error({ error, odbcCause: error?.odbcErrors, rawQuery });
    } finally {
      await this.closeConnection();
    }
  }
}
