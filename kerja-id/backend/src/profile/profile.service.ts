import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddExperienceDto } from './dto/add-experience.dto';
import { AddEducationDto } from './dto/add-education.dto';
import { AddSkillDto } from './dto/add-skill.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  // ==================== GET MY PROFILE ====================
  async getMyProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            emailVerified: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profil tidak ditemukan');
    }

    const experiences = await this.prisma.experience.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
    });

    const educations = await this.prisma.education.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
    });

    const skills = await this.prisma.userSkill.findMany({
      where: { userId },
    });

    const certifications = await this.prisma.certification.findMany({
      where: { userId },
    });

    const portfolioItems = await this.prisma.portfolioItem.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
    });

    return {
      ...profile,
      experiences,
      educations,
      skills,
      certifications,
      portfolioItems,
    };
  }

  // ==================== GET PUBLIC PROFILE ====================
  async getPublicProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        fullName: true,
        headline: true,
        bio: true,
        photoUrl: true,
        location: true,
        website: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        isPublic: true,
        showEmail: true,
        showPhone: true,
        user: {
          select: {
            id: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile || !profile.isPublic) {
      throw new NotFoundException('Profil tidak ditemukan atau bersifat privat');
    }

    const experiences = await this.prisma.experience.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        company: true,
        position: true,
        description: true,
        startDate: true,
        endDate: true,
        isCurrent: true,
        location: true,
      },
    });

    const educations = await this.prisma.education.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
    });

    const skills = await this.prisma.userSkill.findMany({
      where: { userId },
      select: { name: true, level: true, verified: true },
    });

    const certifications = await this.prisma.certification.findMany({
      where: { userId },
    });

    const portfolioItems = await this.prisma.portfolioItem.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
    });

    return {
      ...profile,
      experiences,
      educations,
      skills,
      certifications,
      portfolioItems,
    };
  }

  // ==================== UPDATE PROFILE ====================
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profil tidak ditemukan');
    }

    // Calculate completion
    const completion = this.calculateCompletion(dto, profile);

    const updated = await this.prisma.profile.update({
      where: { userId },
      data: {
        ...dto,
        profileCompletion: completion,
      },
    });

    return updated;
  }

  // ==================== EXPERIENCE ====================
  async addExperience(userId: string, dto: AddExperienceDto) {
    return this.prisma.experience.create({
      data: {
        userId,
        company: dto.company,
        position: dto.position,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isCurrent: dto.isCurrent || false,
        location: dto.location,
      },
    });
  }

  async updateExperience(userId: string, experienceId: string, dto: Partial<AddExperienceDto>) {
    const exp = await this.prisma.experience.findFirst({
      where: { id: experienceId, userId },
    });
    if (!exp) throw new NotFoundException('Pengalaman tidak ditemukan');

    return this.prisma.experience.update({
      where: { id: experienceId },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async deleteExperience(userId: string, experienceId: string) {
    const exp = await this.prisma.experience.findFirst({
      where: { id: experienceId, userId },
    });
    if (!exp) throw new NotFoundException('Pengalaman tidak ditemukan');

    return this.prisma.experience.delete({ where: { id: experienceId } });
  }

  // ==================== EDUCATION ====================
  async addEducation(userId: string, dto: AddEducationDto) {
    return this.prisma.education.create({
      data: {
        userId,
        institution: dto.institution,
        degree: dto.degree,
        field: dto.field,
        startYear: dto.startYear,
        endYear: dto.endYear,
        gpa: dto.gpa,
        description: dto.description,
      },
    });
  }

  async updateEducation(userId: string, educationId: string, dto: Partial<AddEducationDto>) {
    const edu = await this.prisma.education.findFirst({
      where: { id: educationId, userId },
    });
    if (!edu) throw new NotFoundException('Pendidikan tidak ditemukan');

    return this.prisma.education.update({
      where: { id: educationId },
      data: dto,
    });
  }

  async deleteEducation(userId: string, educationId: string) {
    const edu = await this.prisma.education.findFirst({
      where: { id: educationId, userId },
    });
    if (!edu) throw new NotFoundException('Pendidikan tidak ditemukan');

    return this.prisma.education.delete({ where: { id: educationId } });
  }

  // ==================== SKILLS ====================
  async addSkill(userId: string, dto: AddSkillDto) {
    return this.prisma.userSkill.upsert({
      where: {
        userId_name: {
          userId,
          name: dto.name,
        },
      },
      update: { level: dto.level || 1 },
      create: {
        userId,
        name: dto.name,
        level: dto.level || 1,
      },
    });
  }

  async deleteSkill(userId: string, skillId: string) {
    const skill = await this.prisma.userSkill.findFirst({
      where: { id: skillId, userId },
    });
    if (!skill) throw new NotFoundException('Skill tidak ditemukan');

    return this.prisma.userSkill.delete({ where: { id: skillId } });
  }

  async searchSkills(query: string) {
    return this.prisma.skillDefinition.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      take: 10,
      orderBy: { demandScore: 'desc' },
    });
  }

  // ==================== HELPERS ====================
  private calculateCompletion(dto: UpdateProfileDto, existing: any): number {
    let score = 0;
    const fields = {
      fullName: 10,
      headline: 10,
      bio: 10,
      photoUrl: 10,
      location: 5,
      website: 5,
      linkedinUrl: 5,
    };

    for (const [field, points] of Object.entries(fields)) {
      if (dto[field] || existing[field]) {
        score += points;
      }
    }

    // Experience bonus
    if (existing._count?.experiences > 0) score += 15;
    // Education bonus
    if (existing._count?.educations > 0) score += 10;
    // Skills bonus
    if (existing._count?.skills > 0) score += 10;

    return Math.min(score, 100);
  }
}
