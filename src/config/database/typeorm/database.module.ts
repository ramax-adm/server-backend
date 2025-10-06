import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { EnvModule } from 'src/config/env/env.module';
import { EnvService } from 'src/config/env/env.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        type: 'postgres', // Tipo do banco de dados
        host: envService.get('DB_HOST'),
        port: envService.get('DB_PORT'),
        username: envService.get('DB_USERNAME'),
        password: envService.get('DB_PASSWORD'),
        database: envService.get('DB_NAME'),
        schema: envService.get('DB_SCHEMA'),
        ssl: envService.get('DB_SSL'),
        synchronize: false,
        entities: [join(__dirname, '..', '..', '..', '**', '*.entity.{ts,js}')],
        migrations: [join(__dirname, './migrations/**/*.{ts,js}')],
        logging: envService.get('DB_LOGGING'),
      }),
    }),
    // TypeOrmModule.forFeature([
    //   Company,
    //   CattlePurchase,
    //   CattlePurchaseFreight,
    //   IncomingBatches,
    //   Product,
    //   ProductLine,
    //   ReferencePrice,
    //   Warehouse,

    //   // external
    //   ExternalIncomingBatch,
    //   ExternalHumanResourcesHour,

    //   // utils
    //   SensattaDatavaleProduct,
    // ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
