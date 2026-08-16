import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCvDto {
  @ApiProperty({ example: 'CV Frontend Developer' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'modern' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  content?: any;

  @ApiPropertyOptional({ example: 'Frontend Developer' })
  @IsOptional()
  @IsString()
  targetPosition?: string;

  @ApiPropertyOptional({ example: 'Gojek' })
  @IsOptional()
  @IsString()
  targetCompany?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
