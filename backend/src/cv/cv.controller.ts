import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { AnalyzeCvDto } from './dto/analyze-cv.dto';
import { MatchCvDto } from './dto/match-cv.dto';

@ApiTags('CV')
@Controller('cv')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CvController {
  constructor(private readonly cvService: CvService) {}

  // ==================== GET TEMPLATES ====================
  @Get('templates')
  @ApiOperation({ summary: 'Get available CV templates' })
  async getTemplates() {
    return this.cvService.getTemplates();
  }

  // ==================== GET MY CVs ====================
  @Get()
  @ApiOperation({ summary: 'Get all my CV versions' })
  async getMyCvs(@Request() req) {
    return this.cvService.getMyCvs(req.user.sub);
  }

  // ==================== GET CV BY ID ====================
  @Get(':id')
  @ApiOperation({ summary: 'Get CV by ID' })
  async getCvById(@Param('id') id: string, @Request() req) {
    return this.cvService.getCvById(req.user.sub, id);
  }

  // ==================== CREATE CV ====================
  @Post()
  @ApiOperation({ summary: 'Create new CV version' })
  @ApiResponse({ status: 201, description: 'CV created' })
  async createCv(@Body() dto: CreateCvDto, @Request() req) {
    return this.cvService.createCv(req.user.sub, dto);
  }

  // ==================== UPDATE CV ====================
  @Put(':id')
  @ApiOperation({ summary: 'Update CV' })
  async updateCv(@Param('id') id: string, @Body() dto: UpdateCvDto, @Request() req) {
    return this.cvService.updateCv(req.user.sub, id, dto);
  }

  // ==================== DELETE CV ====================
  @Delete(':id')
  @ApiOperation({ summary: 'Delete CV' })
  async deleteCv(@Param('id') id: string, @Request() req) {
    return this.cvService.deleteCv(req.user.sub, id);
  }

  // ==================== ANALYZE CV ====================
  @Post('analyze')
  @ApiOperation({ summary: 'Analyze CV for ATS compatibility' })
  async analyzeCv(@Body() dto: AnalyzeCvDto, @Request() req) {
    return this.cvService.analyzeCv(req.user.sub, dto);
  }

  // ==================== MATCH WITH JOB ====================
  @Post('match')
  @ApiOperation({ summary: 'Match CV with job description' })
  async matchWithJob(@Body() dto: MatchCvDto, @Request() req) {
    return this.cvService.matchWithJob(req.user.sub, dto);
  }
}
