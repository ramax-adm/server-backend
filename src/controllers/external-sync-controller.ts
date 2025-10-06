import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExternalHumanResourcesHoursSyncRequestInput } from 'src/services/dtos/external-human-resources-hours-sync.dto';
import { ExternalIncomingBatchSyncRequestInput } from 'src/services/dtos/external-incoming-batches-sync.dto';
import { ExternalHumanResourceHoursSyncService } from 'src/services/external-human-resources-hours-sync.service';
import { ExternalIncomingBatchSyncService } from 'src/services/external-incoming-batches-sync.service';
import { UserSyncService } from 'src/services/user-sync.service';

@Controller('external/sync')
export class ExternalSyncController {
  constructor(
    private externalIncomingBatchSyncService: ExternalIncomingBatchSyncService,
    private externalHumanResourceHoursSyncService: ExternalHumanResourceHoursSyncService,
    private userSyncService: UserSyncService,
  ) {}

  @Post('incoming-batches')
  @UseInterceptors(FileInterceptor('file'))
  async syncIncomingBatches(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ExternalIncomingBatchSyncRequestInput,
  ) {
    return await this.externalIncomingBatchSyncService.processData(file, dto);
  }

  @Post('human-resources-hours')
  @UseInterceptors(FileInterceptor('file'))
  async syncExtraHours(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ExternalHumanResourcesHoursSyncRequestInput,
  ) {
    return await this.externalHumanResourceHoursSyncService.processData(
      file,
      dto,
    );
  }

  @Post('users')
  @UseInterceptors(FileInterceptor('file'))
  async syncUsers(@UploadedFile() file: Express.Multer.File) {
    return await this.userSyncService.processData(file);
  }
}
