import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobsService } from './jobs.service';
import { SearchJobsDto } from './dto/search-jobs.dto';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // ==================== SEARCH JOBS ====================
  @Get()
  @ApiOperation({ summary: 'Search and filter jobs' })
  @ApiResponse({ status: 200, description: 'Job search results' })
  async search(@Query() dto: SearchJobsDto, @Request() req) {
    const userId = req.user?.sub;
    return this.jobsService.search(dto, userId);
  }

  // ==================== TRENDING SKILLS ====================
  @Get('trending-skills')
  @ApiOperation({ summary: 'Get trending skills from job listings' })
  async getTrendingSkills(@Query('limit') limit?: number) {
    return this.jobsService.getTrendingSkills(limit || 20);
  }

  // ==================== SAVED JOBS ====================
  @Get('saved')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get saved jobs' })
  async getSavedJobs(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.jobsService.getSavedJobs(req.user.sub, page || 1, limit || 20);
  }

  // ==================== GET JOB BY ID ====================
  @Get(':id')
  @ApiOperation({ summary: 'Get job detail by ID' })
  @ApiResponse({ status: 200, description: 'Job detail' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async findById(@Param('id') id: string, @Request() req) {
    const userId = req.user?.sub;
    return this.jobsService.findById(id, userId);
  }

  // ==================== SAVE JOB ====================
  @Post(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/bookmark a job' })
  async saveJob(@Param('id') id: string, @Request() req) {
    return this.jobsService.saveJob(req.user.sub, id);
  }

  // ==================== UNSAVE JOB ====================
  @Delete(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove saved/bookmark job' })
  async unsaveJob(@Param('id') id: string, @Request() req) {
    return this.jobsService.unsaveJob(req.user.sub, id);
  }
}
