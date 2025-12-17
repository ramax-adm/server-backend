import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource, In, MoreThanOrEqual, Not } from 'typeorm';
import { OdbcService } from 'src/config/database/obdc/odbc.service';
import { ArrayUtils } from 'src/utils/array.utils';
import { FileUtils } from 'src/utils/file.utils';
import { DateUtils } from 'src/utils/date.utils';
import { EntitiesEnum, StorageTypesEnum } from 'src/common/constants/utils';
import { UtilsStorageSyncedFile } from 'src/entities/typeorm/utils-storage-synced-file.entity';
import { S3StorageService } from 'src/aws';
import { EnvService } from 'src/config/env/env.service';
import { ODBC_PROVIDER } from 'src/config/database/obdc/providers/odbc.provider';
import { ORACLE_DB_PROVIDER } from 'src/config/database/oracle-db/providers/oracle-db.provider';
import { OracleService } from 'src/config/database/oracle-db/oracle-db.service';
import { Inventory } from 'src/entities/typeorm/inventory.entity';
import {
  InventorySyncRequestInput,
  InventorySyncRequestDto,
} from './dtos/inventory-sync.dto';
import { INVENTORY_QUERY } from 'src/common/constants/inventory';
import { INVENTORY_ITEM_QUERY } from 'src/common/constants/inventory-item';
import { INVENTORY_ITEM_TRACEABILITY_QUERY } from 'src/common/constants/inventory-item-traceability';
import {
  InventoryItemSyncRequestDto,
  InventoryItemSyncRequestInput,
} from './dtos/inventory-item-sync.dto';
import { InventoryItem } from 'src/entities/typeorm/inventory-item.entity';
import { InventoryItemTraceability } from 'src/entities/typeorm/inventory-item-traceability.entity';
import {
  InventoryItemTraceabilitySyncRequestDto,
  InventoryItemTraceabilitySyncRequestInput,
} from './dtos/inventory-item-traceability-sync.dto';

@Injectable()
export class InventoryItemAndTraceabilitySyncService {
  private inventoryItemQuery = INVENTORY_ITEM_QUERY;
  private inventoryItemTraceabilityQuery = INVENTORY_ITEM_TRACEABILITY_QUERY;

  constructor(
    @Inject('STORAGE_SERVICE')
    private readonly storageService: S3StorageService,
    @Inject(ODBC_PROVIDER)
    private readonly odbcService: OdbcService,
    @Inject(ORACLE_DB_PROVIDER)
    private readonly oracleService: OracleService,
    private readonly dataSource: DataSource,
    private readonly envService: EnvService,
  ) {}

  async getInventoriesToUpdate() {
    const qb = this.dataSource.manager
      .getRepository(Inventory)
      .createQueryBuilder('inv');

    qb.where('"inv"."end_inventory_date" >= "inv"."synced_at"')
      .orWhere('"inv"."synced_at" IS NULL')
      .orWhere(`"inv"."status" != 'Finalizado'`);

    const data = await qb.getMany();

    return data;
  }

  async getInventoryItemsData(inventoryIds: string[]) {
    const response =
      await this.oracleService.runQuery<InventoryItemSyncRequestInput>(
        this.inventoryItemQuery,
        { id_inventarios: inventoryIds },
      );

    return response?.map((item) => new InventoryItemSyncRequestDto(item));
  }

  async getInventoryTraceabilityData(inventoryIds: string[]) {
    const data: InventoryItemTraceabilitySyncRequestInput[] = [];

    for (const id of inventoryIds) {
      console.log(`Rodando Query para Inventario: ${id}`);
      const response =
        await this.oracleService.runQuery<InventoryItemTraceabilitySyncRequestInput>(
          this.inventoryItemTraceabilityQuery,
          { id_inventario: id },
        );

      data.push(...response);
    }

    return data?.map(
      (item) => new InventoryItemTraceabilitySyncRequestDto(item),
    );
  }

  async processData() {
    const batchSize = 3000; // ajuste conforme necessário
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const inventoriesToUpdate = await this.getInventoriesToUpdate();
    const inventoryIds = inventoriesToUpdate.map((i) => String(i.sensattaId));

    console.log({ inventoryIds });

    try {
      // INVENTORY ITEM
      await this.dataSource.manager.delete(InventoryItem, {
        inventoryId: In(inventoryIds),
      });

      const inventoryItemsData = await this.getInventoryItemsData(inventoryIds);
      const inventoryItemsChunks = ArrayUtils.chunkArray(
        inventoryItemsData,
        batchSize,
      );

      for (const chunk of inventoryItemsChunks) {
        await queryRunner.manager.save(InventoryItem, chunk);
      }

      // INVENTORY ITEM TRACEABILITY
      await this.dataSource.manager.delete(InventoryItemTraceability, {
        inventoryId: In(inventoryIds),
      });

      const inventoryItemTraceabilityData =
        await this.getInventoryTraceabilityData(
          inventoryIds.filter((i) => i !== '135'),
        );

      const inventoryItemTraceabilityChunks = ArrayUtils.chunkArray(
        inventoryItemTraceabilityData,
        batchSize,
      );

      for (const chunk of inventoryItemTraceabilityChunks) {
        await queryRunner.manager.save(InventoryItemTraceability, chunk);
      }

      // INVENTORY SYNCED AT UPDATE
      const updatedInventories = inventoriesToUpdate.map((i) => ({
        ...i,
        syncedAt: new Date(),
      }));
      await this.dataSource.manager.save(Inventory, updatedInventories);

      await queryRunner.commitTransaction();
    } catch (error) {
      console.error({ error });
      await queryRunner.rollbackTransaction();
      throw new UnprocessableEntityException(error);
    } finally {
      await queryRunner.release();
    }
  }

  // async syncWithStorage() {
  //   const data = await this.dataSource.manager.find(Inventory);

  //   const buffer = await FileUtils.toCsv(data);
  //   const s3Path = `sync-sensatta-snapshots/${EntitiesEnum.INVENTORY}-${DateUtils.getFileDate()}.csv`;

  //   await this.storageService.upload({
  //     Bucket: this.envService.get('AWS_S3_BUCKET'),
  //     Key: s3Path,
  //     Body: buffer,
  //   });

  //   await this.dataSource.manager.save(UtilsStorageSyncedFile, {
  //     storageType: StorageTypesEnum.S3,
  //     entity: EntitiesEnum.INVENTORY,
  //     fileUrl: s3Path,
  //   });

  //   return;
  // }
}
