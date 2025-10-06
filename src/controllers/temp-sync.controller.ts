import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TempBalanceteSyncService } from 'src/services/temp-balancete-sync.service';
import { TempLivroFiscalSyncService } from 'src/services/temp-livro-fiscal-sync.service';
import { TempRazaoContabilSyncService } from 'src/services/temp-razao-contabil-sync.service';
import { WarehouseSyncService } from 'src/services/warehouse-sync.service';

@Controller('temp/sync')
export class TempSyncController {
  constructor(
    private readonly tempLivroFiscalSyncService: TempLivroFiscalSyncService,
    private readonly tempRazaoContabilSyncService: TempRazaoContabilSyncService,
    private readonly tempBalanceteSyncService: TempBalanceteSyncService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Cron(CronExpression.EVERY_10_MINUTES)
  async syncAll() {
    // temp
    await this.tempLivroFiscalSyncService.processData();
    await this.tempRazaoContabilSyncService.processData();
    await this.tempBalanceteSyncService.processData();
  }
}
