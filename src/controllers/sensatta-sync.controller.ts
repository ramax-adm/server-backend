import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CattlePurchaseFreightsSyncService } from 'src/services/cattle-purchase-freights-sync.service';
import { CattlePurchaseSyncService } from 'src/services/cattle-purchase-sync.service';
import { CompanySyncService } from 'src/services/company-sync.service';
import { IncomingBatchSyncService } from 'src/services/incoming-batch-sync.service';
import { ProductLineSyncService } from 'src/services/product-line-sync.service';
import { ProductSyncService } from 'src/services/product-sync.service';
import { ReferencePriceSyncService } from 'src/services/reference-price-sync.service';
import { StockBalanceSyncService } from 'src/services/stock-balance-sync.service';
import { WarehouseSyncService } from 'src/services/warehouse-sync.service';

@Controller('sensatta/sync')
export class SensattaSyncController {
  constructor(
    private readonly cattlePurchaseFreightSyncService: CattlePurchaseFreightsSyncService,
    private readonly companySyncService: CompanySyncService,
    private readonly incomingBatchSyncService: IncomingBatchSyncService,
    private readonly productSyncService: ProductSyncService,
    private readonly productLineSyncService: ProductLineSyncService,
    private readonly referencePriceSyncService: ReferencePriceSyncService,
    private readonly warehouseSyncService: WarehouseSyncService,
    private readonly cattlePurchaseSyncService: CattlePurchaseSyncService,
    private readonly stockBalanceSyncService: StockBalanceSyncService,
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
    await this.cattlePurchaseFreightSyncService.processData();
    await this.cattlePurchaseSyncService.processData();
    await this.stockBalanceSyncService.processData();
  }

  @Post('stock')
  @HttpCode(HttpStatus.CREATED)
  async syncStock() {
    await this.incomingBatchSyncService.processData();
    await this.productSyncService.processData();
    await this.productLineSyncService.processData();
    await this.referencePriceSyncService.processData();
    await this.warehouseSyncService.processData();
    await this.stockBalanceSyncService.processData();
  }

  @Post('sync-with-storage')
  @HttpCode(HttpStatus.CREATED)
  @Cron(CronExpression.EVERY_DAY_AT_9PM)
  async syncWithStorage() {
    // buscar dados do banco postgres
    // escrever csv
    // upar no s3
    await this.companySyncService.syncWithStorage();
    await this.incomingBatchSyncService.syncWithStorage();
    await this.stockBalanceSyncService.syncWithStorage();
    await this.cattlePurchaseSyncService.syncWithStorage();
  }

  // @Post('warehouse')
  // @HttpCode(HttpStatus.CREATED)
  // async syncWarehouse() {
  //   return await this.warehouseSyncService.processData();
  // }

  @Post('freights')
  @HttpCode(HttpStatus.CREATED)
  async syncFreights() {
    await this.cattlePurchaseFreightSyncService.processData();
  }

  @Post('purchase')
  @HttpCode(HttpStatus.CREATED)
  async syncPurchase() {
    await this.cattlePurchaseSyncService.processData();
  }
}
