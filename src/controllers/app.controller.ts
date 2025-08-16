import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { OdbcService } from '../config/database/obdc/odbc.service';
import { NumberUtils } from 'src/utils/number.utils';
import { DateUtils } from 'src/utils/date.utils';
import * as iconv from 'iconv-lite';
import { ORACLE_DB_PROVIDER } from 'src/config/database/oracle-db/providers/oracle-db.provider';
import { OracleService } from 'src/config/database/oracle-db/oracle-db.service';
import { ODBC_PROVIDER } from 'src/config/database/obdc/providers/odbc.provider';

@Controller()
export class AppController {
  constructor(
    @Inject(ODBC_PROVIDER)
    private readonly odbcService: OdbcService,

    @Inject(ORACLE_DB_PROVIDER)
    private readonly oracleDbService: OracleService,
  ) {}

  @Get('health')
  async health() {
    // Process testing
    const uptimeInSeconds = NumberUtils.nb2(process.uptime());
    const now = new Date();

    // sensatta health
    const sensattaData = await this.odbcService.query<{ CNT: number }>(
      `SELECT COUNT(*) AS CNT FROM SIGMA_FIS.EMPRESA`,
    );
    const isSensattaHealthy = sensattaData
      ? !isNaN(sensattaData[0]?.CNT) // Se for um numero, esta saudavel
      : false;

    if (!isSensattaHealthy || uptimeInSeconds === 0) {
      throw new ServiceUnavailableException('API indisponivel');
    }

    return {
      message: 'RAMAX WS SERVER API - Health verification',
      moment: now,
      uptime: `${DateUtils.secondsToHours(uptimeInSeconds)}`,
      isSensattaHealthy,
    };
  }

  @Get('test')
  async test() {
    return this.oracleDbService.runQuery(
      "SELECT 'João' AS a, 'Mãe' AS b, 'Coração' AS c FROM dual",
    );
  }
}
