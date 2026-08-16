// KERJA.ID — Job Scraper Framework
// Base scraper class for all job platforms

export interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryLabel?: string;
  type: string; // FULL_TIME, PART_TIME, etc.
  level: string; // ENTRY, JUNIOR, MID, SENIOR
  skills: string[];
  source: string;
  sourceUrl: string;
  sourceId: string;
  postedAt?: Date;
}

export abstract class BaseScraper {
  abstract source: string;
  abstract baseUrl: string;

  abstract scrape(): Promise<ScrapedJob[]>;

  protected normalizeJobType(raw: string): string {
    const lower = raw.toLowerCase();
    if (lower.includes('full') || lower.includes('tetap')) return 'FULL_TIME';
    if (lower.includes('part') || lower.includes('paruh')) return 'PART_TIME';
    if (lower.includes('contract') || lower.includes('kontrak')) return 'CONTRACT';
    if (lower.includes('freelance') || lower.includes('lepas')) return 'FREELANCE';
    if (lower.includes('intern') || lower.includes('magang')) return 'INTERNSHIP';
    return 'FULL_TIME';
  }

  protected normalizeLevel(raw: string): string {
    const lower = raw.toLowerCase();
    if (lower.includes('entry') || lower.includes('fresh') || lower.includes('junior')) return 'ENTRY';
    if (lower.includes('junior')) return 'JUNIOR';
    if (lower.includes('mid') || lower.includes('intermediate')) return 'MID';
    if (lower.includes('senior') || lower.includes('lead')) return 'SENIOR';
    if (lower.includes('manager') || lower.includes('head')) return 'MANAGER';
    if (lower.includes('director') || lower.includes('vp')) return 'DIRECTOR';
    return 'ENTRY';
  }

  protected extractSkills(text: string): string[] {
    const skillPatterns = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'PHP', 'Ruby', 'C++', 'C#',
      'React', 'Vue', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte',
      'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'Spring', 'Laravel',
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
      'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform',
      'Git', 'CI/CD', 'Jenkins', 'GitHub Actions',
      'Figma', 'Adobe XD', 'Sketch',
      'SQL', 'NoSQL', 'GraphQL', 'REST API',
      'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
      'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
      'HTML', 'CSS', 'SASS', 'Tailwind',
      'Flutter', 'React Native', 'Swift', 'Kotlin',
      'Agile', 'Scrum', 'Product Management',
      'Communication', 'Leadership', 'Problem Solving', 'Teamwork',
    ];

    const found: string[] = [];
    const lowerText = text.toLowerCase();

    for (const skill of skillPatterns) {
      if (lowerText.includes(skill.toLowerCase())) {
        found.push(skill);
      }
    }

    return [...new Set(found)];
  }
}

// Example: LinkedIn Scraper skeleton
export class LinkedInScraper extends BaseScraper {
  source = 'linkedin';
  baseUrl = 'https://www.linkedin.com/jobs/search';

  async scrape(): Promise<ScrapedJob[]> {
    // TODO: Implement LinkedIn scraping
    // This would use Puppeteer/Playwright to:
    // 1. Navigate to LinkedIn jobs search
    // 2. Extract job listings
    // 3. Visit each job detail page
    // 4. Extract structured data
    console.log('LinkedIn scraper not yet implemented');
    return [];
  }
}

// Example: JobStreet Scraper skeleton
export class JobStreetScraper extends BaseScraper {
  source = 'jobstreet';
  baseUrl = 'https://www.jobstreet.co.id';

  async scrape(): Promise<ScrapedJob[]> {
    // TODO: Implement JobStreet scraping
    console.log('JobStreet scraper not yet implemented');
    return [];
  }
}

// Example: Glints Scraper skeleton
export class GlintsScraper extends BaseScraper {
  source = 'glints';
  baseUrl = 'https://glints.com/id';

  async scrape(): Promise<ScrapedJob[]> {
    // TODO: Implement Glints scraping
    console.log('Glints scraper not yet implemented');
    return [];
  }
}

// Scraper registry
export const scrapers = {
  linkedin: LinkedInScraper,
  jobstreet: JobStreetScraper,
  glints: GlintsScraper,
};
