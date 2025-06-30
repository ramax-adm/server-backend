import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3StorageService } from 'src/aws';
import { EnvService } from 'src/config/env/env.service';

@Controller('aws')
export class AwsController {
  constructor(
    @Inject('STORAGE_SERVICE')
    private readonly storageService: S3StorageService,
    private readonly envService: EnvService,
  ) {}

  @Put('s3')
  @HttpCode(204)
  @UseInterceptors(FileInterceptor('file'))
  putS3Object(@Body() dto, @UploadedFile() file: Express.Multer.File) {
    return this.storageService.upload({
      Bucket: this.envService.get('AWS_S3_BUCKET'),
      Key: dto.path.concat(`/${file.originalname}`),
      Body: file.buffer,
    });
  }
}
