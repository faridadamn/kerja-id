import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        jobs: {
          where: { isActive: true },
          orderBy: { postedAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Perusahaan tidak ditemukan');
    }

    return company;
  }

  async search(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = {
      name: { contains: query, mode: 'insensitive' as const },
    };

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        include: {
          _count: {
            select: { jobs: { where: { isActive: true } } },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      companies: companies.map((c) => ({
        ...c,
        activeJobs: c._count.jobs,
        _count: undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTopIndustries() {
    const result = await this.prisma.company.groupBy({
      by: ['industry'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    });

    return result
      .filter((r) => r.industry)
      .map((r) => ({ industry: r.industry, count: r._count.id }));
  }
}
