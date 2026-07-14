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
    const total = await this.prisma.application.count({ where: { userId } });
    const active = await this.prisma.application.count({
      where: {
        userId,
        status: { in: ['APPLIED', 'SCREENING', 'INTERVIEW'] },
      },
    });
    const interviews = await this.prisma.application.count({
      where: { userId, status: 'INTERVIEW' },
    });
    const offers = await this.prisma.application.count({
      where: { userId, status: 'OFFER' },
    });
    const rejected = await this.prisma.application.count({
      where: { userId, status: 'REJECTED' },
    });

    // Response rate
    const responded = total - (await this.prisma.application.count({
      where: { userId, status: { in: ['SAVED', 'APPLIED'] } },
    }));
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

    // Interview rate
    const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;

    return {
      total,
      active,
      interviews,
      offers,
      rejected,
      responseRate,
      interviewRate,
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
