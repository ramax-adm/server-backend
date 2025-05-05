import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { OdbcService } from '../config/database/obdc/odbc.service';
import { NumberUtils } from 'src/utils/number.utils';
import { DateUtils } from 'src/utils/date.utils';

@Controller()
export class AppController {
  constructor(
    @Inject('ODBC SERVICE')
    private readonly odbcService: OdbcService,
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
}
