import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CompanySyncService } from 'src/services/company-sync.service';
import { IncomingBatchSyncService } from 'src/services/incoming-batch-sync.service';
import { ProductLineSyncService } from 'src/services/product-line-sync.service';
import { ProductSyncService } from 'src/services/product-sync.service';
import { ReferencePriceSyncService } from 'src/services/reference-price-sync.service';
import { WarehouseSyncService } from 'src/services/warehouse-sync.service';

@Controller('sensatta/sync')
export class SensattaSyncController {
  constructor(
    private readonly companySyncService: CompanySyncService,
    private readonly incomingBatchSyncService: IncomingBatchSyncService,
    private readonly productSyncService: ProductSyncService,
    private readonly productLineSyncService: ProductLineSyncService,
    private readonly referencePriceSyncService: ReferencePriceSyncService,
    private readonly warehouseSyncService: WarehouseSyncService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Cron(CronExpression.EVERY_30_MINUTES)
  async syncAll() {
    await this.companySyncService.processData();
    await this.incomingBatchSyncService.processData();
    await this.productSyncService.processData();
    await this.productLineSyncService.processData();
    await this.referencePriceSyncService.processData();
    await this.warehouseSyncService.processData();
  }

  @Post('warehouse')
  @HttpCode(HttpStatus.CREATED)
  async syncWarehouse() {
    return await this.warehouseSyncService.processData();
  }
}
