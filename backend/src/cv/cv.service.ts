import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { AnalyzeCvDto } from './dto/analyze-cv.dto';
import { MatchCvDto } from './dto/match-cv.dto';

@Injectable()
export class CvService {
  constructor(private prisma: PrismaService) {}

  // ==================== GET MY CVs ====================
  async getMyCvs(userId: string) {
    return this.prisma.cvVersion.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // ==================== GET CV BY ID ====================
  async getCvById(userId: string, cvId: string) {
    const cv = await this.prisma.cvVersion.findUnique({
      where: { id: cvId },
    });

    if (!cv) throw new NotFoundException('CV tidak ditemukan');
    if (cv.userId !== userId) throw new ForbiddenException('Akses ditolak');

    return cv;
  }

  // ==================== CREATE CV ====================
  async createCv(userId: string, dto: CreateCvDto) {
    // If this is set as default, unset others
    if (dto.isDefault) {
      await this.prisma.cvVersion.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Get user profile for auto-fill
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            experiences: true,
            educations: true,
            skills: true,
            certifications: true,
          },
        },
      },
    });

    // Build CV content from profile if template is selected
    const content = dto.content || this.buildContentFromProfile(profile);

    return this.prisma.cvVersion.create({
      data: {
        userId,
        name: dto.name,
        templateId: dto.templateId,
        content,
        targetPosition: dto.targetPosition,
        targetCompany: dto.targetCompany,
        isDefault: dto.isDefault || false,
      },
    });
  }

  // ==================== UPDATE CV ====================
  async updateCv(userId: string, cvId: string, dto: UpdateCvDto) {
    const cv = await this.prisma.cvVersion.findUnique({ where: { id: cvId } });
    if (!cv) throw new NotFoundException('CV tidak ditemukan');
    if (cv.userId !== userId) throw new ForbiddenException('Akses ditolak');

    if (dto.isDefault) {
      await this.prisma.cvVersion.updateMany({
        where: { userId, isDefault: true, id: { not: cvId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.cvVersion.update({
      where: { id: cvId },
      data: {
        name: dto.name,
        templateId: dto.templateId,
        content: dto.content,
        targetPosition: dto.targetPosition,
        targetCompany: dto.targetCompany,
        isDefault: dto.isDefault,
      },
    });
  }

  // ==================== DELETE CV ====================
  async deleteCv(userId: string, cvId: string) {
    const cv = await this.prisma.cvVersion.findUnique({ where: { id: cvId } });
    if (!cv) throw new NotFoundException('CV tidak ditemukan');
    if (cv.userId !== userId) throw new ForbiddenException('Akses ditolak');

    return this.prisma.cvVersion.delete({ where: { id: cvId } });
  }

  // ==================== ANALYZE CV ====================
  async analyzeCv(userId: string, dto: AnalyzeCvDto) {
    // Get CV content
    let cvContent: string = dto.cvText || '';

    if (dto.cvVersionId) {
      const cv = await this.prisma.cvVersion.findUnique({
        where: { id: dto.cvVersionId },
      });
      if (!cv) throw new NotFoundException('CV tidak ditemukan');
      if (cv.userId !== userId) throw new ForbiddenException('Akses ditolak');
      cvContent = JSON.stringify(cv.content);
    }

    if (!cvContent) {
      throw new NotFoundException('Tidak ada konten CV untuk dianalisis');
    }

    // Perform analysis
    const analysis = this.performAnalysis(cvContent, dto.targetPosition);

    // Save analysis result if CV version exists
    if (dto.cvVersionId) {
      await this.prisma.cvVersion.update({
        where: { id: dto.cvVersionId },
        data: { atsScore: analysis.overallScore },
      });
    }

    return analysis;
  }

  // ==================== MATCH CV WITH JOB ====================
  async matchWithJob(userId: string, dto: MatchCvDto) {
    let cvContent = '';

    if (dto.cvVersionId) {
      const cv = await this.prisma.cvVersion.findUnique({
        where: { id: dto.cvVersionId },
      });
      if (!cv) throw new NotFoundException('CV tidak ditemukan');
      cvContent = JSON.stringify(cv.content);
    } else if (dto.cvText) {
      cvContent = dto.cvText;
    } else {
      throw new NotFoundException('CV tidak ditemukan');
    }

    // Get job description
    let jobDescription = dto.jobDescription || '';
    let jobTitle = dto.jobTitle || '';

    if (dto.jobId) {
      const job = await this.prisma.job.findUnique({
        where: { id: dto.jobId },
      });
      if (!job) throw new NotFoundException('Lowongan tidak ditemukan');
      jobDescription = `${job.title} ${job.description} ${job.requirements || ''}`;
      jobTitle = job.title;
    }

    return this.performMatching(cvContent, jobDescription, jobTitle);
  }

  // ==================== GET TEMPLATES ====================
  async getTemplates() {
    // Return available templates
    return [
      {
        id: 'modern',
        name: 'Modern',
        category: 'professional',
        description: 'Template bersih dan modern, cocok untuk tech & startup',
        previewUrl: '/templates/modern.png',
        atsScore: 95,
      },
      {
        id: 'classic',
        name: 'Classic',
        category: 'traditional',
        description: 'Template klasik untuk corporate & banking',
        previewUrl: '/templates/classic.png',
        atsScore: 98,
      },
      {
        id: 'creative',
        name: 'Creative',
        category: 'creative',
        description: 'Template kreatif untuk designer & marketer',
        previewUrl: '/templates/creative.png',
        atsScore: 85,
      },
      {
        id: 'minimal',
        name: 'Minimal',
        category: 'professional',
        description: 'Template minimalis, fokus pada konten',
        previewUrl: '/templates/minimal.png',
        atsScore: 97,
      },
      {
        id: 'executive',
        name: 'Executive',
        category: 'senior',
        description: 'Template untuk level manager & direktur',
        previewUrl: '/templates/executive.png',
        atsScore: 92,
      },
    ];
  }

  // ==================== ANALYSIS ENGINE ====================
  private performAnalysis(cvContent: string, targetPosition?: string) {
    const lowerContent = cvContent.toLowerCase();

    // Section detection
    const sections = [
      {
        name: 'Personal Info',
        check: () =>
          lowerContent.includes('nama') ||
          lowerContent.includes('name') ||
          lowerContent.includes('email') ||
          lowerContent.includes('phone'),
        weight: 10,
      },
      {
        name: 'Summary/Objective',
        check: () =>
          lowerContent.includes('summary') ||
          lowerContent.includes('objective') ||
          lowerContent.includes('profil') ||
          lowerContent.includes('tentang'),
        weight: 15,
      },
      {
        name: 'Experience',
        check: () =>
          lowerContent.includes('experience') ||
          lowerContent.includes('pengalaman') ||
          lowerContent.includes('kerja') ||
          lowerContent.includes('company'),
        weight: 25,
      },
      {
        name: 'Education',
        check: () =>
          lowerContent.includes('education') ||
          lowerContent.includes('pendidikan') ||
          lowerContent.includes('university') ||
          lowerContent.includes('universitas'),
        weight: 15,
      },
      {
        name: 'Skills',
        check: () =>
          lowerContent.includes('skills') ||
          lowerContent.includes('skill') ||
          lowerContent.includes('keahlian') ||
          lowerContent.includes('kemampuan'),
        weight: 20,
      },
      {
        name: 'Certifications',
        check: () =>
          lowerContent.includes('certification') ||
          lowerContent.includes('sertifikat') ||
          lowerContent.includes('certified'),
        weight: 10,
      },
      {
        name: 'Contact',
        check: () =>
          lowerContent.includes('@') ||
          lowerContent.includes('linkedin') ||
          lowerContent.includes('github'),
        weight: 5,
      },
    ];

    let totalScore = 0;
    const sectionResults = sections.map((section) => {
      const found = section.check();
      const score = found ? section.weight : 0;
      totalScore += score;
      return {
        name: section.name,
        score: found ? 100 : 0,
        weight: section.weight,
        feedback: found
          ? `${section.name} ditemukan dalam CV`
          : `${section.name} tidak ditemukan. Tambahkan section ini untuk meningkatkan skor ATS.`,
      };
    });

    // Action verbs check
    const actionVerbs = [
      'mengembangkan', 'develop', 'built', 'created', 'designed', 'implemented',
      'managed', 'led', 'improved', 'increased', 'reduced', 'optimized',
      'collaborated', 'delivered', 'achieved', 'established', 'initiated',
    ];
    const foundVerbs = actionVerbs.filter((verb) => lowerContent.includes(verb));
    const verbScore = Math.min((foundVerbs.length / 5) * 10, 10);

    // Quantified achievements check
    const numberPattern = /\d+%|\d+\+|\d+ [a-z]+|\d+ tahun|\d+ tahun/gi;
    const numbers = cvContent.match(numberPattern) || [];
    const quantifiedScore = Math.min(numbers.length * 2, 10);

    // Final score
    const finalScore = Math.min(totalScore + verbScore + quantifiedScore, 100);

    // Keyword extraction
    const commonKeywords = [
      'javascript', 'typescript', 'python', 'java', 'react', 'node.js',
      'sql', 'docker', 'kubernetes', 'aws', 'git', 'agile', 'scrum',
      'communication', 'leadership', 'teamwork', 'problem solving',
    ];
    const foundKeywords = commonKeywords.filter((kw) => lowerContent.includes(kw));
    const missingKeywords = commonKeywords.filter((kw) => !lowerContent.includes(kw));

    // Suggestions
    const suggestions = [];
    if (!lowerContent.includes('summary') && !lowerContent.includes('objective')) {
      suggestions.push({
        priority: 'high' as const,
        message: 'Tambahkan section Summary/Objective di awal CV untuk memberikan gambaran singkat tentang dirimu.',
      });
    }
    if (foundVerbs.length < 3) {
      suggestions.push({
        priority: 'high' as const,
        message: 'Gunakan lebih banyak action verbs (develop, manage, improve, dll) untuk mendeskripsikan pencapaianmu.',
      });
    }
    if (numbers.length < 2) {
      suggestions.push({
        priority: 'high' as const,
        message: 'Tambahkan angka dan data kuantitatif untuk mendukung pencapaianmu (contoh: "Meningkatkan penjualan sebesar 30%").',
      });
    }
    if (!lowerContent.includes('linkedin')) {
      suggestions.push({
        priority: 'medium' as const,
        message: 'Tambahkan link LinkedIn untuk memudahkan employer mengenalimu lebih lanjut.',
      });
    }
    if (cvContent.length < 500) {
      suggestions.push({
        priority: 'medium' as const,
        message: 'CV terlalu singkat. Tambahkan lebih detail tentang pengalaman dan pencapaian.',
      });
    }
    if (cvContent.length > 5000) {
      suggestions.push({
        priority: 'low' as const,
        message: 'CV terlalu panjang. Pertimbangkan untuk mempersingkat menjadi 1-2 halaman.',
      });
    }

    return {
      overallScore: Math.round(finalScore),
      sections: sectionResults,
      keywords: {
        found: foundKeywords,
        missing: missingKeywords.slice(0, 10),
      },
      suggestions,
      actionVerbs: foundVerbs,
      quantifiedAchievements: numbers.length,
      estimatedAtsCompatibility: finalScore >= 80 ? 'high' : finalScore >= 60 ? 'medium' : 'low',
    };
  }

  // ==================== MATCHING ENGINE ====================
  private performMatching(cvContent: string, jobDescription: string, jobTitle: string) {
    const cvLower = cvContent.toLowerCase();
    const jobLower = jobDescription.toLowerCase();

    // Extract skills from job description
    const skillPatterns = [
      'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'php',
      'react', 'vue', 'angular', 'next.js', 'svelte',
      'node.js', 'express', 'nestjs', 'django', 'flask',
      'postgresql', 'mysql', 'mongodb', 'redis',
      'docker', 'kubernetes', 'aws', 'gcp', 'azure',
      'git', 'ci/cd', 'terraform',
      'figma', 'adobe xd',
      'sql', 'graphql', 'rest api',
      'machine learning', 'deep learning', 'nlp',
      'html', 'css', 'tailwind',
      'flutter', 'react native',
      'agile', 'scrum',
    ];

    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    for (const skill of skillPatterns) {
      if (jobLower.includes(skill)) {
        if (cvLower.includes(skill)) {
          matchedKeywords.push(skill);
        } else {
          missingKeywords.push(skill);
        }
      }
    }

    // Calculate match score
    const totalJobKeywords = matchedKeywords.length + missingKeywords.length;
    const matchScore =
      totalJobKeywords > 0
        ? Math.round((matchedKeywords.length / totalJobKeywords) * 100)
        : 50;

    // Generate suggestions
    const suggestions = [];
    if (missingKeywords.length > 0) {
      suggestions.push({
        priority: 'high' as const,
        message: `Tambahkan skill berikut ke CV kamu: ${missingKeywords.slice(0, 5).join(', ')}`,
      });
    }
    if (jobTitle && !cvLower.includes(jobTitle.toLowerCase())) {
      suggestions.push({
        priority: 'medium' as const,
        message: `Pertimbangkan untuk menambahkan "${jobTitle}" atau posisi serupa di pengalaman atau summary.`,
      });
    }
    suggestions.push({
      priority: 'medium' as const,
      message: 'Sesuaikan keyword di CV dengan yang ada di deskripsi lowongan untuk meningkatkan skor ATS.',
    });

    return {
      matchScore,
      matchedKeywords,
      missingKeywords,
      suggestions,
      jobTitle,
      recommendation:
        matchScore >= 80
          ? 'CV kamu sangat cocok dengan lowongan ini! Langsung lamar.'
          : matchScore >= 60
            ? 'CV kamu cukup cocok. Pertimbangkan untuk menambahkan skill yang kurang.'
            : 'CV kamu kurang cocok. Tambahkan skill yang dibutuhkan sebelum melamar.',
    };
  }

  // ==================== BUILD CONTENT FROM PROFILE ====================
  private buildContentFromProfile(profile: any) {
    if (!profile) return {};

    return {
      personalInfo: {
        fullName: profile.fullName,
        email: profile.user?.email,
        phone: profile.user?.phone,
        location: profile.location,
        headline: profile.headline,
        bio: profile.bio,
        website: profile.website,
        linkedin: profile.linkedinUrl,
        github: profile.githubUrl,
      },
      summary: profile.bio || '',
      experience: profile.user?.experiences?.map((exp: any) => ({
        company: exp.company,
        position: exp.position,
        description: exp.description,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrent: exp.isCurrent,
        location: exp.location,
      })) || [],
      education: profile.user?.educations?.map((edu: any) => ({
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        startYear: edu.startYear,
        endYear: edu.endYear,
        gpa: edu.gpa,
      })) || [],
      skills: profile.user?.skills?.map((s: any) => ({
        name: s.name,
        level: s.level,
      })) || [],
      certifications: profile.user?.certifications?.map((c: any) => ({
        name: c.name,
        issuer: c.issuer,
        date: c.date,
      })) || [],
    };
  }
}
