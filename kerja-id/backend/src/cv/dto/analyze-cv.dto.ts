import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzeCvDto {
  @ApiPropertyOptional({ description: 'CV version ID to analyze' })
  @IsOptional()
  @IsString()
  cvVersionId?: string;

  @ApiPropertyOptional({ description: 'Raw CV text to analyze' })
  @IsOptional()
  @IsString()
  cvText?: string;

  @ApiPropertyOptional({ description: 'Target position for analysis' })
  @IsOptional()
  @IsString()
  targetPosition?: string;
}
