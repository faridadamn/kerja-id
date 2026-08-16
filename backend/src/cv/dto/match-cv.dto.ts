import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MatchCvDto {
  @ApiPropertyOptional({ description: 'CV version ID' })
  @IsOptional()
  @IsString()
  cvVersionId?: string;

  @ApiPropertyOptional({ description: 'Raw CV text' })
  @IsOptional()
  @IsString()
  cvText?: string;

  @ApiPropertyOptional({ description: 'Job ID to match with' })
  @IsOptional()
  @IsString()
  jobId?: string;

  @ApiPropertyOptional({ description: 'Raw job description text' })
  @IsOptional()
  @IsString()
  jobDescription?: string;

  @ApiPropertyOptional({ description: 'Job title' })
  @IsOptional()
  @IsString()
  jobTitle?: string;
}
