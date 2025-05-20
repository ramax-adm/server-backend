import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExternalIncomingBatchSyncRequestInput } from 'src/services/dtos/external-incoming-batches-sync.dto';
import { ExternalIncomingBatchSyncService } from 'src/services/external-incoming-batches-sync.service';

@Controller('external/sync')
export class ExternalSyncController {
  constructor(
    private externalIncomingBatchSyncService: ExternalIncomingBatchSyncService,
  ) {}

  @Post('incoming-batches')
  @UseInterceptors(FileInterceptor('file'))
  async syncIncomingBatches(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ExternalIncomingBatchSyncRequestInput,
  ) {
    return await this.externalIncomingBatchSyncService.processData(file, dto);
  }
}
