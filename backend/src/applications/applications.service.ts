import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  // ==================== GET MY APPLICATIONS ====================
  async getMyApplications(userId: string, status?: ApplicationStatus, page = 1, limit = 50) {
    const where: any = { userId };
    if (status) where.status = status;

    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          job: {
            include: {
              company: {
                select: { id: true, name: true, logoUrl: true },
              },
            },
          },
          timeline: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ==================== GET BY STATUS (KANBAN) ====================
  async getKanbanBoard(userId: string) {
    const statuses: ApplicationStatus[] = [
      'SAVED', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'ACCEPTED', 'REJECTED',
    ];

    const board: Record<string, any[]> = {};
    for (const status of statuses) {
      board[status] = await this.prisma.application.findMany({
        where: { userId, status },
        include: {
          job: {
            include: {
              company: {
                select: { id: true, name: true, logoUrl: true },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }

    return board;
  }

  // ==================== CREATE APPLICATION ====================
  async createApplication(userId: string, dto: CreateApplicationDto) {
    // Check if already applied
    if (dto.jobId) {
      const existing = await this.prisma.application.findFirst({
        where: { userId, jobId: dto.jobId },
      });
      if (existing) {
        return existing; // Already applied
      }
    }

    const application = await this.prisma.application.create({
      data: {
        userId,
        jobId: dto.jobId,
        cvVersionId: dto.cvVersionId,
        position: dto.position,
        company: dto.company,
        source: dto.source,
        sourceUrl: dto.sourceUrl,
        status: dto.status || 'APPLIED',
        appliedAt: dto.status === 'APPLIED' ? new Date() : null,
        notes: dto.notes,
        recruiterName: dto.recruiterName,
        recruiterEmail: dto.recruiterEmail,
        recruiterPhone: dto.recruiterPhone,
      },
      include: {
        job: true,
      },
    });

    // Create initial timeline entry
    await this.prisma.applicationTimeline.create({
      data: {
        applicationId: application.id,
        action: 'CREATED',
        description: `Lamaran untuk ${dto.position} di ${dto.company} dibuat`,
      },
    });

    return application;
  }

  // ==================== UPDATE APPLICATION ====================
  async updateApplication(userId: string, applicationId: string, dto: UpdateApplicationDto) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!app) throw new NotFoundException('Lamaran tidak ditemukan');
    if (app.userId !== userId) throw new ForbiddenException('Akses ditolak');

    const oldStatus = app.status;
    const statusChanged = dto.status && dto.status !== oldStatus;

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: dto.status,
        notes: dto.notes,
        recruiterName: dto.recruiterName,
        recruiterEmail: dto.recruiterEmail,
        recruiterPhone: dto.recruiterPhone,
        rejectionReason: dto.rejectionReason,
        followUpAt: dto.followUpAt ? new Date(dto.followUpAt) : undefined,
        appliedAt: dto.status === 'APPLIED' && !app.appliedAt ? new Date() : undefined,
      },
    });

    // Add timeline entry if status changed
    if (statusChanged) {
      await this.prisma.applicationTimeline.create({
        data: {
          applicationId,
          action: 'STATUS_CHANGED',
          description: `Status berubah dari ${oldStatus} menjadi ${dto.status}`,
        },
      });
    }

    return updated;
  }

  // ==================== UPDATE STATUS (QUICK) ====================
  async updateStatus(userId: string, applicationId: string, status: ApplicationStatus) {
    return this.updateApplication(userId, applicationId, { status });
  }

  // ==================== DELETE APPLICATION ====================
  async deleteApplication(userId: string, applicationId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!app) throw new NotFoundException('Lamaran tidak ditemukan');
    if (app.userId !== userId) throw new ForbiddenException('Akses ditolak');

    return this.prisma.application.delete({ where: { id: applicationId } });
  }

  // ==================== ADD NOTE ====================
  async addNote(userId: string, applicationId: string, content: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!app) throw new NotFoundException('Lamaran tidak ditemukan');
    if (app.userId !== userId) throw new ForbiddenException('Akses ditolak');

    // Add to timeline
    await this.prisma.applicationTimeline.create({
      data: {
        applicationId,
        action: 'NOTE_ADDED',
        description: content,
      },
    });

    // Update notes field
    return this.prisma.application.update({
      where: { id: applicationId },
      data: {
        notes: app.notes ? `${app.notes}\n${content}` : content,
      },
    });
  }

  // ==================== GET TIMELINE ====================
  async getTimeline(userId: string, applicationId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!app) throw new NotFoundException('Lamaran tidak ditemukan');
    if (app.userId !== userId) throw new ForbiddenException('Akses ditolak');

    return this.prisma.applicationTimeline.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== GET STATS ====================
  async getStats(userId: string) {
    const statuses: ApplicationStatus[] = [
      'SAVED',
      'APPLIED',
      'SCREENING',
      'INTERVIEW',
      'OFFER',
      'ACCEPTED',
      'REJECTED',
      'WITHDRAWN',
    ];

    const [total, groupedStatuses, groupedSources, respondedApplications] = await Promise.all([
      this.prisma.application.count({ where: { userId } }),
      this.prisma.application.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true },
      }),
      this.prisma.application.groupBy({
        by: ['source'],
        where: { userId },
        _count: { source: true },
      }),
      this.prisma.application.findMany({
        where: {
          userId,
          status: { notIn: ['SAVED', 'APPLIED'] },
          appliedAt: { not: null },
        },
        select: {
          appliedAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const byStatus = statuses.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<ApplicationStatus, number>,
    );
    for (const item of groupedStatuses) {
      byStatus[item.status] = item._count.status;
    }

    const bySource: Record<string, number> = {};
    for (const item of groupedSources) {
      bySource[item.source || 'Lainnya'] = item._count.source;
    }

    const active = byStatus.APPLIED + byStatus.SCREENING + byStatus.INTERVIEW;
    const interviews = byStatus.INTERVIEW;
    const offers = byStatus.OFFER;
    const rejected = byStatus.REJECTED;

    // Response rate
    const responded = total - byStatus.SAVED - byStatus.APPLIED;
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

    // Interview rate
    const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;

    const avgResponseTime =
      respondedApplications.length > 0
        ? Math.round(
            respondedApplications.reduce((sum, app) => {
              const diff = app.updatedAt.getTime() - app.appliedAt!.getTime();
              return sum + Math.max(0, diff / (1000 * 60 * 60 * 24));
            }, 0) / respondedApplications.length,
          )
        : 0;

    return {
      total,
      byStatus,
      bySource,
      active,
      interviews,
      offers,
      rejected,
      responseRate,
      interviewRate,
      avgResponseTime,
    };
  }

  // ==================== GET REMINDERS ====================
  async getUpcomingReminders(userId: string) {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return this.prisma.application.findMany({
      where: {
        userId,
        followUpAt: {
          gte: now,
          lte: nextWeek,
        },
      },
      include: {
        job: {
          include: {
            company: { select: { name: true, logoUrl: true } },
          },
        },
      },
      orderBy: { followUpAt: 'asc' },
    });
  }
}
