import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AccountPayableSyncService } from 'src/services/account-payable-sync.service';
import { AccountReceivableSyncService } from 'src/services/account-receivable-sync.service';
import { CattlePurchaseFreightsSyncService } from 'src/services/cattle-purchase-freights-sync.service';
import { CattlePurchaseSyncService } from 'src/services/cattle-purchase-sync.service';
import { ClientSyncService } from 'src/services/client-sync.service';
import { CompanySyncService } from 'src/services/company-sync.service';
import { FreightCompanySyncService } from 'src/services/freight-company-sync.service';
import { IncomingBatchSyncService } from 'src/services/incoming-batch-sync.service';
import { InventoryBalanceSyncService } from 'src/services/inventory-balance-sync.service';
import { InventoryItemAndTraceabilitySyncService } from 'src/services/inventory-item-and-traceability-sync.service';
import { InventorySyncService } from 'src/services/inventory-sync.service';
import { InvoiceSyncService } from 'src/services/invoice-sync.service';
import { OrderLineSyncService } from 'src/services/order-line-sync.service';
import { ProductLineSyncService } from 'src/services/product-line-sync.service';
import { ProductSyncService } from 'src/services/product-sync.service';
import { ProductionMovementSyncService } from 'src/services/production-movement-sync.service';
import { ReferencePriceSyncService } from 'src/services/reference-price-sync.service';
import { ReturnOccurenceSyncService } from 'src/services/return-occurrence-sync.service';
import { SensattaEntitySyncService } from 'src/services/sensatta-entity-sync.service';
import { StockBalanceSyncService } from 'src/services/stock-balance-sync.service';
import { TempBalanceteSyncService } from 'src/services/temp-balancete-sync.service';
import { TempLivroFiscalSyncService } from 'src/services/temp-livro-fiscal-sync.service';
import { TempRazaoContabilSyncService } from 'src/services/temp-razao-contabil-sync.service';
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
    private readonly freightCompanySyncService: FreightCompanySyncService,
    private readonly OrderLineSyncService: OrderLineSyncService,
    private readonly returnOccurenceSyncService: ReturnOccurenceSyncService,
    private readonly sensattaEntitySyncService: SensattaEntitySyncService,
    private readonly inventorySyncService: InventorySyncService,
    private readonly inventoryBalanceSyncService: InventoryBalanceSyncService,
    private readonly inventoryItemAndTraceabilitySyncService: InventoryItemAndTraceabilitySyncService,
    private readonly accountPayableSyncService: AccountPayableSyncService,
    private readonly accountReceivableSyncService: AccountReceivableSyncService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Cron(CronExpression.EVERY_HOUR)
  async syncAll() {
    await this.companySyncService.processData();
    await this.sensattaEntitySyncService.processData();
    await this.productionMovementSyncService.processData();
    await this.syncInvoice();
    await this.syncStock();
    await this.syncStockBalance();
    await this.syncFreights();
    await this.syncPurchase();
    await this.syncFinance();
    await this.syncInventory();
  }

  @Post('stock')
  @HttpCode(HttpStatus.CREATED)
  async syncStock() {
    await this.productionMovementSyncService.processData();
    await this.incomingBatchSyncService.processData();
    await this.productSyncService.processData();
    await this.productLineSyncService.processData();
    await this.referencePriceSyncService.processData();
    await this.warehouseSyncService.processData();
  }
  @Post('stock-balance')
  @HttpCode(HttpStatus.CREATED)
  async syncStockBalance() {
    await this.stockBalanceSyncService.processData();
  }

  @Post('inventory')
  @HttpCode(HttpStatus.CREATED)
  async syncInventory() {
    await this.inventorySyncService.processData();
    await this.inventoryBalanceSyncService.processData();
    await this.inventoryItemAndTraceabilitySyncService.processData();
  }

  @Post('invoice')
  @HttpCode(HttpStatus.CREATED)
  async syncInvoice() {
    await this.clientSyncService.processData();
    await this.returnOccurenceSyncService.processData();
    await this.InvoiceSyncService.processData();
    await this.OrderLineSyncService.processData();
  }

  @Post('freights')
  @HttpCode(HttpStatus.CREATED)
  async syncFreights() {
    await this.cattlePurchaseFreightSyncService.processData();
    await this.freightCompanySyncService.processData();
  }

  @Post('purchase')
  @HttpCode(HttpStatus.CREATED)
  async syncPurchase() {
    await this.cattlePurchaseSyncService.processData();
  }

  @Post('finance')
  @HttpCode(HttpStatus.CREATED)
  async syncFinance() {
    await this.accountPayableSyncService.processData();
    await this.accountReceivableSyncService.processData();
  }
}

// mudar dps, segmentar melhor p: estoque/afins
// @Post('sync-with-storage')
// @HttpCode(HttpStatus.CREATED)
// @Cron(CronExpression.EVERY_DAY_AT_9PM)
// async syncAllWithStorage() {
//   // buscar dados do banco postgres
//   // escrever csv
//   // upar no s3
//   await this.companySyncService.syncWithStorage();
//   await this.sensattaEntitySyncService.syncWithStorage();
//   await this.syncStockWithStorage();
//   await this.syncInvoiceWithStorage();
//   await this.syncPurchaseWithStorage();
//   await this.syncFreightsWithStorage();
// }

// @Post('sync-with-storage/freights')
// @HttpCode(HttpStatus.CREATED)
// async syncFreightsWithStorage() {
//   await this.freightCompanySyncService.syncWithStorage();
// }

// @Post('sync-with-storage/invoice')
// @HttpCode(HttpStatus.CREATED)
// async syncInvoiceWithStorage() {
//   await this.clientSyncService.syncWithStorage();
//   await this.InvoiceSyncService.syncWithStorage();
//   await this.OrderLineSyncService.syncWithStorage();
// }

// @Post('sync-with-storage/purchase')
// @HttpCode(HttpStatus.CREATED)
// async syncPurchaseWithStorage() {
//   await this.cattlePurchaseSyncService.syncWithStorage();
// }

// @Post('sync-with-storage/stock')
// @HttpCode(HttpStatus.CREATED)
// async syncStockWithStorage() {
//   await this.productionMovementSyncService.syncWithStorage();
//   await this.incomingBatchSyncService.syncWithStorage();
//   await this.productSyncService.syncWithStorage();
// }

// @Post('sync-with-storage/stock-balance')
// @HttpCode(HttpStatus.CREATED)
// async syncStockBalanceWithStorage() {
//   await this.stockBalanceSyncService.syncWithStorage();
// }
