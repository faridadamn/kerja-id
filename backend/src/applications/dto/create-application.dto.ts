import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

export class CreateApplicationDto {
  @ApiPropertyOptional({ description: 'Job ID (if from our platform)' })
  @IsOptional()
  @IsString()
  jobId?: string;

  @ApiPropertyOptional({ description: 'CV version used' })
  @IsOptional()
  @IsString()
  cvVersionId?: string;

  @ApiProperty({ example: 'Frontend Developer' })
  @IsString()
  position: string;

  @ApiProperty({ example: 'PT Teknologi Indonesia' })
  @IsString()
  company: string;

  @ApiPropertyOptional({ example: 'linkedin' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/jobs/123' })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiPropertyOptional({ enum: ApplicationStatus, default: 'APPLIED' })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recruiterName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recruiterEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recruiterPhone?: string;
}
