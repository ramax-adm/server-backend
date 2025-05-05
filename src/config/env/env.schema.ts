// src/config/env.config.ts
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  validateSync,
  IsBoolean,
} from 'class-validator';
import { plainToClass, Transform } from 'class-transformer';

export class EnvSchema {
  @IsNumber()
  @Transform(({ value }) => value || 3000)
  BE_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsBoolean()
  @IsNotEmpty()
  DB_SSL: boolean;

  @IsNumber()
  @IsNotEmpty()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsBoolean()
  @IsNotEmpty()
  DB_LOGGING: boolean;

  @IsString()
  @IsNotEmpty()
  DB_SCHEMA: string;

  static validate(config: Record<string, any>) {
    const validatedConfig = plainToClass(EnvSchema, config, {
      enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      throw new Error(errors.toString());
    }

    return validatedConfig;
  }
}
