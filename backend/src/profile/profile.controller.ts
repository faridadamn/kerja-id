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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddExperienceDto } from './dto/add-experience.dto';
import { AddEducationDto } from './dto/add-education.dto';
import { AddSkillDto } from './dto/add-skill.dto';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // ==================== MY PROFILE ====================
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my full profile' })
  async getMyProfile(@Request() req) {
    return this.profileService.getMyProfile(req.user.sub);
  }

  // ==================== PUBLIC PROFILE ====================
  @Get(':userId')
  @ApiOperation({ summary: 'Get public profile by user ID' })
  async getPublicProfile(@Param('userId') userId: string) {
    return this.profileService.getPublicProfile(userId);
  }

  // ==================== UPDATE PROFILE ====================
  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my profile' })
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.sub, dto);
  }

  // ==================== EXPERIENCE ====================
  @Post('me/experience')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add experience' })
  async addExperience(@Request() req, @Body() dto: AddExperienceDto) {
    return this.profileService.addExperience(req.user.sub, dto);
  }

  @Put('me/experience/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update experience' })
  async updateExperience(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AddExperienceDto,
  ) {
    return this.profileService.updateExperience(req.user.sub, id, dto);
  }

  @Delete('me/experience/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete experience' })
  async deleteExperience(@Request() req, @Param('id') id: string) {
    return this.profileService.deleteExperience(req.user.sub, id);
  }

  // ==================== EDUCATION ====================
  @Post('me/education')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add education' })
  async addEducation(@Request() req, @Body() dto: AddEducationDto) {
    return this.profileService.addEducation(req.user.sub, dto);
  }

  @Put('me/education/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update education' })
  async updateEducation(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AddEducationDto,
  ) {
    return this.profileService.updateEducation(req.user.sub, id, dto);
  }

  @Delete('me/education/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete education' })
  async deleteEducation(@Request() req, @Param('id') id: string) {
    return this.profileService.deleteEducation(req.user.sub, id);
  }

  // ==================== SKILLS ====================
  @Post('me/skills')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add or update skill' })
  async addSkill(@Request() req, @Body() dto: AddSkillDto) {
    return this.profileService.addSkill(req.user.sub, dto);
  }

  @Delete('me/skills/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete skill' })
  async deleteSkill(@Request() req, @Param('id') id: string) {
    return this.profileService.deleteSkill(req.user.sub, id);
  }

  @Get('skills/search')
  @ApiOperation({ summary: 'Search skills (autocomplete)' })
  async searchSkills(@Query('q') query: string) {
    return this.profileService.searchSkills(query);
  }
}
