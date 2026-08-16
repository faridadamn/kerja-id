import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddEducationDto {
  @ApiProperty({ example: 'Universitas Indonesia' })
  @IsString()
  @IsNotEmpty()
  institution: string;

  @ApiProperty({ example: 'S1' })
  @IsString()
  @IsNotEmpty()
  degree: string;

  @ApiProperty({ example: 'Teknik Informatika' })
  @IsString()
  @IsNotEmpty()
  field: string;

  @ApiProperty({ example: 2018 })
  @IsInt()
  @Min(1950)
  @Max(2030)
  startYear: number;

  @ApiPropertyOptional({ example: 2022 })
  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2030)
  endYear?: number;

  @ApiPropertyOptional({ example: 3.75 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  gpa?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
