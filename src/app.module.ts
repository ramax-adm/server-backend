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

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule, OdbcModule],
  providers: [
    CompanySyncService,
    IncomingBatchSyncService,
    ProductSyncService,
    ProductLineSyncService,
    ReferencePriceSyncService,
    WarehouseSyncService,

    // external
    ExternalIncomingBatchSyncService,
  ],
  controllers: [AppController, ExternalSyncController, SensattaSyncController],
})
export class AppModule {}
