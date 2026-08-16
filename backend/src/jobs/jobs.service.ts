import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  // ==================== SEARCH JOBS ====================
  async search(dto: SearchJobsDto, userId?: string) {
    const {
      q,
      location,
      city,
      province,
      type,
      level,
      salaryMin,
      salaryMax,
      industry,
      company,
      skills,
      postedWithin,
      page = 1,
      limit = 20,
      sort = 'relevance',
    } = dto;

    // Build where clause
    const where: Prisma.JobWhereInput = {
      isActive: true,
    };

    // Full-text search
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { company: { name: { contains: q, mode: 'insensitive' } } },
        { skills: { has: q } },
      ];
    }

    // Location filter
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    if (province) {
      where.province = { contains: province, mode: 'insensitive' };
    }

    // Type filter
    if (type) {
      where.type = type;
    }

    // Level filter
    if (level) {
      where.level = level;
    }

    // Salary filter
    if (salaryMin || salaryMax) {
      where.AND = [];
      if (salaryMin) {
        (where.AND as any[]).push({
          OR: [{ salaryMax: { gte: salaryMin } }, { salaryMax: null }],
        });
      }
      if (salaryMax) {
        (where.AND as any[]).push({
          OR: [{ salaryMin: { lte: salaryMax } }, { salaryMin: null }],
        });
      }
    }

    // Industry filter
    if (industry) {
      where.company = { industry: { contains: industry, mode: 'insensitive' } };
    }

    // Company filter
    if (company) {
      where.company = { name: { contains: company, mode: 'insensitive' } };
    }

    // Skills filter
    if (skills && skills.length > 0) {
      where.skills = { hasSome: skills };
    }

    // Posted within (days)
    if (postedWithin) {
      const date = new Date();
      date.setDate(date.getDate() - postedWithin);
      where.postedAt = { gte: date };
    }

    // Build orderBy
    let orderBy: Prisma.JobOrderByWithRelationInput;
    switch (sort) {
      case 'date':
        orderBy = { postedAt: 'desc' };
        break;
      case 'salary':
        orderBy = { salaryMax: 'desc' };
        break;
      case 'relevance':
      default:
        orderBy = [{ postedAt: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    // Execute query
    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              industry: true,
              size: true,
            },
          },
          ...(userId
            ? {
                savedBy: {
                  where: { userId },
                  select: { id: true },
                },
              }
            : {}),
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    // Get facets for filters
    const facets = await this.getFacets(where);

    return {
      jobs: jobs.map((job) => ({
        ...job,
        isSaved: userId ? (job as any).savedBy?.length > 0 : false,
        savedBy: undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      facets,
    };
  }

  // ==================== GET JOB BY ID ====================
  async findById(id: string, userId?: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        ...(userId
          ? {
              savedBy: {
                where: { userId },
                select: { id: true },
              },
            }
          : {}),
      },
    });

    if (!job) {
      throw new NotFoundException('Lowongan tidak ditemukan');
    }

    // Get related jobs (same company or similar skills)
    const relatedJobs = await this.prisma.job.findMany({
      where: {
        id: { not: id },
        isActive: true,
        OR: [
          { companyId: job.companyId },
          { skills: { hasSome: job.skills } },
        ],
      },
      include: {
        company: {
          select: { id: true, name: true, logoUrl: true },
        },
      },
      take: 6,
      orderBy: { postedAt: 'desc' },
    });

    return {
      ...job,
      isSaved: userId ? (job as any).savedBy?.length > 0 : false,
      savedBy: undefined,
      relatedJobs,
    };
  }

  // ==================== SAVE / UNSAVE JOB ====================
  async saveJob(userId: string, jobId: string) {
    // Check job exists
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Lowongan tidak ditemukan');

    return this.prisma.savedJob.upsert({
      where: {
        userId_jobId: { userId, jobId },
      },
      update: {},
      create: { userId, jobId },
    });
  }

  async unsaveJob(userId: string, jobId: string) {
    return this.prisma.savedJob.deleteMany({
      where: { userId, jobId },
    });
  }

  // ==================== GET SAVED JOBS ====================
  async getSavedJobs(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [saved, total] = await Promise.all([
      this.prisma.savedJob.findMany({
        where: { userId },
        include: {
          job: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                  industry: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.savedJob.count({ where: { userId } }),
    ]);

    return {
      jobs: saved.map((s) => ({ ...s.job, isSaved: true, savedAt: s.createdAt })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ==================== TRENDING SKILLS ====================
  async getTrendingSkills(limit = 20) {
    // Aggregate skills from active jobs
    const jobs = await this.prisma.job.findMany({
      where: { isActive: true },
      select: { skills: true },
    });

    const skillCount: Record<string, number> = {};
    for (const job of jobs) {
      for (const skill of job.skills) {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      }
    }

    return Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  }

  // ==================== FACETS ====================
  private async getFacets(baseWhere: Prisma.JobWhereInput) {
    const jobs = await this.prisma.job.findMany({
      where: baseWhere,
      select: {
        location: true,
        type: true,
        level: true,
        skills: true,
        company: { select: { industry: true } },
      },
    });

    const locations: Record<string, number> = {};
    const types: Record<string, number> = {};
    const levels: Record<string, number> = {};
    const industries: Record<string, number> = {};
    const skillCounts: Record<string, number> = {};

    for (const job of jobs) {
      if (job.location) locations[job.location] = (locations[job.location] || 0) + 1;
      types[job.type] = (types[job.type] || 0) + 1;
      levels[job.level] = (levels[job.level] || 0) + 1;
      if (job.company?.industry) {
        industries[job.company.industry] = (industries[job.company.industry] || 0) + 1;
      }
      for (const skill of job.skills) {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      }
    }

    const toFacet = (obj: Record<string, number>) =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([value, count]) => ({ value, count }));

    return {
      locations: toFacet(locations),
      types: toFacet(types),
      levels: toFacet(levels),
      industries: toFacet(industries),
      skills: toFacet(skillCounts),
    };
  }
}
