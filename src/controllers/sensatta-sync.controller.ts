import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CattlePurchaseFreightsSyncService } from 'src/services/cattle-purchase-freights-sync.service';
import { CattlePurchaseSyncService } from 'src/services/cattle-purchase-sync.service';
import { ClientSyncService } from 'src/services/client-sync.service';
import { CompanySyncService } from 'src/services/company-sync.service';
import { IncomingBatchSyncService } from 'src/services/incoming-batch-sync.service';
import { InvoiceSyncService } from 'src/services/invoice-sync.service';
import { ProductLineSyncService } from 'src/services/product-line-sync.service';
import { ProductSyncService } from 'src/services/product-sync.service';
import { ProductionMovementSyncService } from 'src/services/production-movement-sync.service';
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
    private readonly productionMovementSyncService: ProductionMovementSyncService,
    private readonly clientSyncService: ClientSyncService,
    private readonly InvoiceSyncService: InvoiceSyncService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Cron(CronExpression.EVERY_HOUR)
  async syncAll() {
    await this.companySyncService.processData();
    await this.syncInvoice();
    await this.syncStock();
    await this.syncStockBalance();
    await this.syncFreights();
    await this.syncPurchase();
  }

  // mudar dps, segmentar melhor p: estoque/afins
  @Post('sync-with-storage')
  @HttpCode(HttpStatus.CREATED)
  @Cron(CronExpression.EVERY_DAY_AT_9PM)
  async syncAllWithStorage() {
    // buscar dados do banco postgres
    // escrever csv
    // upar no s3
    await this.syncStockWithStorage();
    await this.syncStockBalanceWithStorage();
    await this.syncInvoiceWithStorage();
    await this.syncPurchaseWithStorage();
  }

  @Post('stock')
  @HttpCode(HttpStatus.CREATED)
  async syncStock() {
    await this.companySyncService.processData();
    await this.productionMovementSyncService.processData();
    await this.incomingBatchSyncService.processData();
    await this.productSyncService.processData();
    await this.productLineSyncService.processData();
    await this.referencePriceSyncService.processData();
    await this.warehouseSyncService.processData();
    // await this.stockBalanceSyncService.processData();
  }
  @Post('stock-balance')
  @HttpCode(HttpStatus.CREATED)
  async syncStockBalance() {
    await this.stockBalanceSyncService.processData();
  }

  @Post('invoice')
  @HttpCode(HttpStatus.CREATED)
  async syncInvoice() {
    await this.clientSyncService.processData();
    await this.InvoiceSyncService.processData();
  }

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

  @Post('sync-with-storage/invoice')
  @HttpCode(HttpStatus.CREATED)
  async syncInvoiceWithStorage() {
    await this.clientSyncService.syncWithStorage();
    await this.InvoiceSyncService.syncWithStorage();
  }

  @Post('sync-with-storage/purchase')
  @HttpCode(HttpStatus.CREATED)
  async syncPurchaseWithStorage() {
    await this.cattlePurchaseSyncService.syncWithStorage();
  }

  @Post('sync-with-storage/stock')
  @HttpCode(HttpStatus.CREATED)
  async syncStockWithStorage() {
    await this.productionMovementSyncService.syncWithStorage();
    await this.incomingBatchSyncService.syncWithStorage();
    await this.productSyncService.syncWithStorage();
  }

  @Post('sync-with-storage/stock-balance')
  @HttpCode(HttpStatus.CREATED)
  async syncStockBalanceWithStorage() {
    await this.stockBalanceSyncService.syncWithStorage();
  }
}
