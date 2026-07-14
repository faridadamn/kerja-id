import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationStatus } from '@prisma/client';

@ApiTags('Applications')
@Controller('applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // ==================== GET STATS ====================
  @Get('stats')
  @ApiOperation({ summary: 'Get application statistics' })
  async getStats(@Request() req) {
    return this.applicationsService.getStats(req.user.sub);
  }

  // ==================== GET REMINDERS ====================
  @Get('reminders')
  @ApiOperation({ summary: 'Get upcoming reminders' })
  async getReminders(@Request() req) {
    return this.applicationsService.getUpcomingReminders(req.user.sub);
  }

  // ==================== GET KANBAN BOARD ====================
  @Get('kanban')
  @ApiOperation({ summary: 'Get applications as kanban board' })
  async getKanbanBoard(@Request() req) {
    return this.applicationsService.getKanbanBoard(req.user.sub);
  }

  // ==================== GET MY APPLICATIONS ====================
  @Get()
  @ApiOperation({ summary: 'Get my applications' })
  async getMyApplications(
    @Request() req,
    @Query('status') status?: ApplicationStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.applicationsService.getMyApplications(
      req.user.sub,
      status,
      page || 1,
      limit || 50,
    );
  }

  // ==================== CREATE APPLICATION ====================
  @Post()
  @ApiOperation({ summary: 'Create new application' })
  async createApplication(@Body() dto: CreateApplicationDto, @Request() req) {
    return this.applicationsService.createApplication(req.user.sub, dto);
  }

  // ==================== UPDATE APPLICATION ====================
  @Put(':id')
  @ApiOperation({ summary: 'Update application' })
  async updateApplication(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
    @Request() req,
  ) {
    return this.applicationsService.updateApplication(req.user.sub, id, dto);
  }

  // ==================== UPDATE STATUS ====================
  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Quick update application status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ApplicationStatus,
    @Request() req,
  ) {
    return this.applicationsService.updateStatus(req.user.sub, id, status);
  }

  // ==================== ADD NOTE ====================
  @Post(':id/notes')
  @ApiOperation({ summary: 'Add note to application' })
  async addNote(
    @Param('id') id: string,
    @Body('content') content: string,
    @Request() req,
  ) {
    return this.applicationsService.addNote(req.user.sub, id, content);
  }

  // ==================== GET TIMELINE ====================
  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get application timeline' })
  async getTimeline(@Param('id') id: string, @Request() req) {
    return this.applicationsService.getTimeline(req.user.sub, id);
  }

  // ==================== DELETE APPLICATION ====================
  @Delete(':id')
  @ApiOperation({ summary: 'Delete application' })
  async deleteApplication(@Param('id') id: string, @Request() req) {
    return this.applicationsService.deleteApplication(req.user.sub, id);
  }
}
