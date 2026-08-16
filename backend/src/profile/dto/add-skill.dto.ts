import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddSkillDto {
  @ApiProperty({ example: 'JavaScript' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 4, description: 'Skill level 1-5' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  level?: number;
}
