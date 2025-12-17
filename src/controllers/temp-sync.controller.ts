import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TempBalanceteSyncService } from 'src/services/temp-balancete-sync.service';
import { TempHistoricoRefaturamentoSyncService } from 'src/services/temp-historico-refaturamento-sync.service';
import { TempLivroFiscalSyncService } from 'src/services/temp-livro-fiscal-sync.service';
import { TempRazaoContabilSyncService } from 'src/services/temp-razao-contabil-sync.service';
import { TempTitulosPagarSyncService } from 'src/services/temp-titulos-pagar-sync.service';

@Controller('temp/sync')
export class TempSyncController {
  constructor(
    private readonly tempLivroFiscalSyncService: TempLivroFiscalSyncService,
    private readonly tempRazaoContabilSyncService: TempRazaoContabilSyncService,
    private readonly tempBalanceteSyncService: TempBalanceteSyncService,
    private readonly tempTitulosPagarSyncService: TempTitulosPagarSyncService,
    private readonly tempHistoricoRefaturamentoSyncService: TempHistoricoRefaturamentoSyncService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Cron(CronExpression.EVERY_30_MINUTES)
  async syncAll() {
    // temp
    await this.tempHistoricoRefaturamentoSyncService.processData();
    await this.tempTitulosPagarSyncService.processData();
    // await this.tempLivroFiscalSyncService.processData();
    // await this.tempRazaoContabilSyncService.processData();
    // await this.tempBalanceteSyncService.processData();
  }
}
