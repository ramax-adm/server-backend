import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { OdbcModule } from './config/database/obdc/obdc.module';
import { DatabaseModule } from './config/database/typeorm/database.module';
import { SensattaSyncController } from './controllers/sensatta-sync.controller';
import { WarehouseSyncService } from './services/warehouse-sync.service';
import { ScheduleModule } from '@nestjs/schedule';
import { IncomingBatchSyncService } from './services/incoming-batch-sync.service';
import { ReferencePriceSyncService } from './services/reference-price-sync.service';
import { ProductSyncService } from './services/product-sync.service';
import { CompanySyncService } from './services/company-sync.service';
import { ProductLineSyncService } from './services/product-line-sync.service';
import { ExternalSyncController } from './controllers/external-sync-controller';
import { ExternalIncomingBatchSyncService } from './services/external-incoming-batches-sync.service';
import { CattlePurchaseFreightsSyncService } from './services/cattle-purchase-freights-sync.service';
import { ExternalHumanResourceHoursSyncService } from './services/external-human-resources-hours-sync.service';
import { S3StorageModule } from './aws/s3-storage/s3-storage.module';
import { AwsController } from './controllers/aws.controller';
import { EnvModule } from './config/env/env.module';
import { CattlePurchaseSyncService } from './services/cattle-purchase-sync.service';
import { StockBalanceSyncService } from './services/stock-balance-sync.service';
import { ProductionMovementSyncService } from './services/production-movement-sync.service';
import { InvoiceSyncService } from './services/invoice-sync.service';
import { ClientSyncService } from './services/client-sync.service';
import { OracleDbModule } from './config/database/oracle-db/oracle-db.module';
import { UserSyncService } from './services/user-sync.service';
import { FreightCompanySyncService } from './services/freight-company-sync.service';
import { OrderLineSyncService } from './services/order-line-sync.service';
import { TempLivroFiscalSyncService } from './services/temp-livro-fiscal-sync.service';
import { TempRazaoContabilSyncService } from './services/temp-razao-contabil-sync.service';
import { TempBalanceteSyncService } from './services/temp-balancete-sync.service';
import { TempSyncController } from './controllers/temp-sync.controller';
import { ReturnOccurenceSyncService } from './services/return-occurrence-sync.service';
import { SensattaEntitySyncService } from './services/sensatta-entity-sync.service';
import { InventorySyncService } from './services/inventory-sync.service';
import { InventoryItemAndTraceabilitySyncService } from './services/inventory-item-and-traceability-sync.service';
import { TempTitulosPagarSyncService } from './services/temp-titulos-pagar-sync.service';
import { AccountReceivableSyncService } from './services/account-receivable-sync.service';
import { AccountPayableSyncService } from './services/account-payable-sync.service';
import { TempHistoricoRefaturamentoSyncService } from './services/temp-historico-refaturamento-sync.service';
import { InventoryBalanceSyncService } from './services/inventory-balance-sync.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    S3StorageModule,
    EnvModule,
    DatabaseModule,
    OdbcModule,
    OracleDbModule,
  ],
  providers: [
    AccountPayableSyncService,
    AccountReceivableSyncService,
    ClientSyncService,
    CattlePurchaseSyncService,
    CattlePurchaseFreightsSyncService,
    CompanySyncService,
    IncomingBatchSyncService,
    FreightCompanySyncService,
    ProductSyncService,
    ProductLineSyncService,
    InvoiceSyncService,
    ProductionMovementSyncService,
    ReferencePriceSyncService,
    StockBalanceSyncService,
    InventorySyncService,
    InventoryBalanceSyncService,
    InventoryItemAndTraceabilitySyncService,
    WarehouseSyncService,
    OrderLineSyncService,
    ReturnOccurenceSyncService,
    SensattaEntitySyncService,

    // external
    ExternalIncomingBatchSyncService,
    ExternalHumanResourceHoursSyncService,
    UserSyncService,

    // temp
    TempBalanceteSyncService,
    TempLivroFiscalSyncService,
    TempRazaoContabilSyncService,
    TempTitulosPagarSyncService,
    TempHistoricoRefaturamentoSyncService,
  ],
  controllers: [
    AppController,
    AwsController,
    ExternalSyncController,
    SensattaSyncController,
    TempSyncController,
  ],
})
export class AppModule {}
