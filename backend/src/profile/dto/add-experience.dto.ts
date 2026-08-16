import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddExperienceDto {
  @ApiProperty({ example: 'PT Teknologi Indonesia' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  company: string;

  @ApiProperty({ example: 'Frontend Developer' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  position: string;

  @ApiPropertyOptional({ example: 'Mengembangkan aplikasi web menggunakan React' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ example: '2022-01-15' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({ example: '2024-06-30' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @ApiPropertyOptional({ example: 'Jakarta' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;
}
