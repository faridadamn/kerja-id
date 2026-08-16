import { IsOptional, IsString, IsEnum, IsInt, Min, Max, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { JobType, JobLevel } from '@prisma/client';

export class SearchJobsDto {
  @ApiPropertyOptional({ description: 'Search query (title, company, skill)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Location filter' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'City filter' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Province filter' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ enum: JobType, description: 'Job type filter' })
  @IsOptional()
  @IsEnum(JobType)
  type?: JobType;

  @ApiPropertyOptional({ enum: JobLevel, description: 'Job level filter' })
  @IsOptional()
  @IsEnum(JobLevel)
  level?: JobLevel;

  @ApiPropertyOptional({ description: 'Minimum salary filter' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @ApiPropertyOptional({ description: 'Maximum salary filter' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @ApiPropertyOptional({ description: 'Industry filter' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: 'Company name filter' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: 'Skills filter', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ description: 'Posted within X days' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  postedWithin?: number;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['relevance', 'date', 'salary'],
    default: 'relevance',
  })
  @IsOptional()
  @IsString()
  sort?: 'relevance' | 'date' | 'salary' = 'relevance';
}
