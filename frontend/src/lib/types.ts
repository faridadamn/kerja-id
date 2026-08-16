// Auth
export interface User {
  id: string;
  email: string;
  role: "JOB_SEEKER" | "EMPLOYER" | "MENTOR" | "ADMIN" | "SUPER_ADMIN";
  emailVerified: boolean;
  profile?: Profile;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Profile
export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  headline?: string;
  bio?: string;
  photoUrl?: string;
  location?: string;
  city?: string;
  province?: string;
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  expectedSalary?: number;
  jobType?: string[];
  preferredLocations?: string[];
  remotePreference?: string;
  profileCompletion: number;
  isPublic: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showSalary: boolean;
  username?: string;
  experiences?: Experience[];
  educations?: Education[];
  skills?: UserSkill[];
  certifications?: Certification[];
  portfolioItems?: PortfolioItem[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  location?: string;
  sortOrder: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  gpa?: number;
  description?: string;
}

export interface UserSkill {
  id: string;
  name: string;
  level: number;
  verified: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
  imageUrl?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  images: string[];
  sortOrder: number;
}

// Jobs
export interface Job {
  id: string;
  title: string;
  companyId?: string;
  company?: Company;
  location?: string;
  city?: string;
  province?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryLabel?: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "FREELANCE" | "INTERNSHIP";
  level: "ENTRY" | "JUNIOR" | "MID" | "SENIOR" | "MANAGER" | "DIRECTOR";
  description: string;
  requirements?: string;
  skills: string[];
  source: string;
  sourceUrl?: string;
  postedAt?: string;
  expiresAt?: string;
  isActive: boolean;
  isSaved?: boolean;
  relatedJobs?: Job[];
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  industry?: string;
  size?: string;
  website?: string;
  description?: string;
  location?: string;
  jobs?: Job[];
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: {
    locations: FacetItem[];
    types: FacetItem[];
    levels: FacetItem[];
    industries: FacetItem[];
    skills: FacetItem[];
  };
}

export interface FacetItem {
  value: string;
  count: number;
}

// CV
export interface CvVersion {
  id: string;
  userId: string;
  name: string;
  templateId?: string;
  content?: any;
  targetPosition?: string;
  targetCompany?: string;
  atsScore?: number;
  pdfUrl?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CvTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  previewUrl: string;
  atsScore: number;
}

export interface CvAnalysis {
  overallScore: number;
  sections: {
    name: string;
    score: number;
    weight: number;
    feedback: string;
  }[];
  keywords: {
    found: string[];
    missing: string[];
  };
  suggestions: {
    priority: "high" | "medium" | "low";
    message: string;
  }[];
  actionVerbs: string[];
  quantifiedAchievements: number;
  estimatedAtsCompatibility: "high" | "medium" | "low";
}

export interface CvMatch {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: {
    priority: "high" | "medium" | "low";
    message: string;
  }[];
  jobTitle: string;
  recommendation: string;
}

// Applications / JobTracker
export interface Application {
  id: string;
  userId: string;
  jobId?: string;
  cvVersionId?: string;
  position: string;
  company: string;
  source?: string;
  sourceUrl?: string;
  status: ApplicationStatus;
  appliedAt?: string;
  followUpAt?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  notes?: string;
  rejectionReason?: string;
  job?: Job;
  cv?: CvVersion;
  timeline?: ApplicationTimeline[];
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface ApplicationTimeline {
  id: string;
  applicationId: string;
  action: string;
  description?: string;
  createdAt: string;
}

// SkillGap
export interface SkillTrend {
  name: string;
  count: number;
}

export interface GapAnalysis {
  mySkills: { name: string; level: number }[];
  industryDemand: { name: string; demand: number }[];
  gaps: { name: string; myLevel: number; demand: number; priority: "high" | "medium" | "low" }[];
  recommendations: {
    skill: string;
    courses: { title: string; provider: string; url: string; rating: number; price: string }[];
  }[];
}

// SkillAssessment
export interface AssessmentQuestion {
  id: string;
  skillName: string;
  question: string;
  options: string[];
  timeLimit: number;
}

export interface AssessmentSession {
  sessionId: string;
  questions: AssessmentQuestion[];
  currentQuestion: number;
  totalQuestions: number;
}

export interface AssessmentResult {
  id: string;
  sessionId: string;
  completedAt: string;
  overallScore: number;
  skillResults: {
    skillName: string;
    score: number;
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    totalQuestions: number;
    correctAnswers: number;
  }[];
  certificateId?: string;
}

export interface CourseRecommendation {
  skill: string;
  courses: {
    title: string;
    provider: string;
    url: string;
    rating: number;
    price: string;
    duration?: string;
    thumbnail?: string;
  }[];
}

// InterviewSim
export interface InterviewSession {
  id: string;
  position: string;
  company?: string;
  type: "behavioral" | "technical" | "case_study" | "hr_culture";
  language: "id" | "en" | "mixed";
  duration: number;
  score?: number;
  feedback?: string;
  status: "active" | "completed";
  createdAt: string;
}

// SalaryInsight
export interface SalaryData {
  position: string;
  industry?: string;
  location?: string;
  median: number;
  p25: number;
  p75: number;
  min: number;
  max: number;
  sampleSize: number;
}

// MoodEntry
export interface MoodEntry {
  id: string;
  mood: number;
  journal?: string;
  date: string;
}

// MicroIntern / Project Marketplace
export interface MicroInternProject {
  id: string;
  title: string;
  description: string;
  companyId: string;
  company?: Company;
  skills: string[];
  budget: number;
  duration: number; // days
  difficulty: 1 | 2 | 3 | 4 | 5;
  type: "REMOTE" | "ONSITE" | "HYBRID";
  deliverables: string[];
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";
  applicantCount: number;
  postedAt: string;
  deadline?: string;
  relatedProjects?: MicroInternProject[];
}

export interface MicroInternApplication {
  id: string;
  projectId: string;
  project?: MicroInternProject;
  userId: string;
  coverLetter: string;
  portfolioLinks: string[];
  estimatedTimeline: number; // days
  status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
  appliedAt: string;
  updatedAt: string;
}

export interface MicroInternListResponse {
  projects: MicroInternProject[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ConnectPro
export interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  photoUrl?: string;
  industry: string;
  expertise: string[];
  rating: number;
  reviewCount: number;
  sessionCount: number;
  availability: "available" | "busy" | "unavailable";
  sessionTypes: ("chat" | "video" | "async_qa")[];
  hourlyRate?: number;
}

export interface MentorDetail extends Mentor {
  reviews: MentorReview[];
}

export interface MentorReview {
  id: string;
  menteeName: string;
  menteePhotoUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface MentorsResponse {
  mentors: Mentor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  type: "industry" | "skill" | "location" | "alumni";
  isJoined?: boolean;
  createdAt: string;
}

export interface CommunityGroupDetail extends CommunityGroup {
  posts: CommunityPost[];
  members: CommunityMember[];
}

export interface CommunityMember {
  id: string;
  name: string;
  photoUrl?: string;
  role: "admin" | "member";
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorPhotoUrl?: string;
  content: string;
  link?: string;
  likes: number;
  isLiked?: boolean;
  commentCount: number;
  comments: PostComment[];
  createdAt: string;
}

export interface PostComment {
  id: string;
  authorName: string;
  authorPhotoUrl?: string;
  content: string;
  createdAt: string;
}

export interface CommunityGroupsResponse {
  groups: CommunityGroup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


