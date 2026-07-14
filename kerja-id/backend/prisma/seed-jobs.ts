import { PrismaClient, JobType, JobLevel } from '@prisma/client';

const prisma = new PrismaClient();

// Sample companies
const companies = [
  { name: 'Gojek', industry: 'Technology', size: '5001-10000', website: 'https://gojek.com', logoUrl: null, description: 'Gojek is a Super App. It\'s an ecosystem of apps that provides a wide range of services including transport, payments, food delivery, and logistics.' },
  { name: 'Tokopedia', industry: 'E-commerce', size: '5001-10000', website: 'https://tokopedia.com', logoUrl: null, description: 'Tokopedia is an Indonesian technology company with a mission to democratize commerce through technology.' },
  { name: 'Traveloka', industry: 'Travel Tech', size: '1001-5000', website: 'https://traveloka.com', logoUrl: null, description: 'Traveloka is a technology company that provides a wide range of travel and lifestyle services.' },
  { name: 'Bukalapak', industry: 'E-commerce', size: '1001-5000', website: 'https://bukalapak.com', logoUrl: null, description: 'Bukalapak is one of Indonesia\'s largest e-commerce platforms.' },
  { name: 'Shopee Indonesia', industry: 'E-commerce', size: '5001-10000', website: 'https://shopee.co.id', logoUrl: null, description: 'Shopee is a leading e-commerce platform in Southeast Asia.' },
  { name: 'Bank Central Asia (BCA)', industry: 'Banking', size: '10000+', website: 'https://bca.co.id', logoUrl: null, description: 'BCA is one of the largest private banks in Indonesia.' },
  { name: 'Telkom Indonesia', industry: 'Telecommunications', size: '10000+', website: 'https://telkom.co.id', logoUrl: null, description: 'Telkom Indonesia is the largest telecommunications company in Indonesia.' },
  { name: 'Unilever Indonesia', industry: 'FMCG', size: '5001-10000', website: 'https://unilever.co.id', logoUrl: null, description: 'Unilever is a multinational consumer goods company.' },
  { name: 'Grab Indonesia', industry: 'Technology', size: '1001-5000', website: 'https://grab.com/id', logoUrl: null, description: 'Grab is a leading superapp in Southeast Asia.' },
  { name: 'Ruangguru', industry: 'EdTech', size: '1001-5000', website: 'https://ruangguru.com', logoUrl: null, description: 'Ruangguru is an Indonesian education technology company.' },
];

// Sample jobs
const jobs = [
  { title: 'Frontend Developer (React)', companyIndex: 0, location: 'Jakarta Selatan', city: 'Jakarta', province: 'DKI Jakarta', salaryMin: 8000000, salaryMax: 15000000, type: JobType.FULL_TIME, level: JobLevel.MID, description: 'Kami mencari Frontend Developer yang berpengalaman dengan React.js untuk bergabung dengan tim engineering kami. Kamu akan bertanggung jawab membangun dan维护 user interface yang responsif dan performant.\n\nResponsibilities:\n- Mengembangkan fitur baru menggunakan React.js dan TypeScript\n- Berkolaborasi dengan designer dan backend developer\n- Melakukan code review dan mentoring junior developer\n- Mengoptimalkan performa aplikasi frontend\n\nRequirements:\n- Pengalaman 2+ tahun dengan React.js\n- Familiar dengan TypeScript, Redux, dan REST API\n- Memahami responsive design dan cross-browser compatibility\n- Pengalaman dengan testing (Jest, React Testing Library) adalah nilai plus', requirements: 'S1 Teknik Informatika / Ilmu Komputer\nPengalaman 2+ tahun di Frontend Development\nReact.js, TypeScript, HTML, CSS\nGit version control\nKomunikasi yang baik', skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Redux', 'Git'], source: 'manual', postedAt: new Date('2026-07-10') },
  { title: 'Backend Developer (Node.js)', companyIndex: 0, location: 'Jakarta Selatan', city: 'Jakarta', province: 'DKI Jakarta', salaryMin: 10000000, salaryMax: 18000000, type: JobType.FULL_TIME, level: JobLevel.MID, description: 'Bergabunglah dengan tim backend kami untuk membangun microservices yang scalable dan reliable.\n\nResponsibilities:\n- Merancang dan mengembangkan RESTful API\n- Mengelola database PostgreSQL dan Redis\n- Mengimplementasikan authentication dan authorization\n- Monitoring dan troubleshooting production issues', requirements: 'S1 Teknik Informatika\nPengalaman 2+ tahun dengan Node.js\nPostgreSQL, Redis, Docker\nPengalaman dengan microservices adalah nilai plus', skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker', 'REST API', 'Git'], source: 'manual', postedAt: new Date('2026-07-11') },
  { title: 'UI/UX Designer', companyIndex: 2, location: 'Jakarta Barat', city: 'Jakarta', province: 'DKI Jakarta', salaryMin: 7000000, salaryMax: 13000000, type: JobType.FULL_TIME, level: JobLevel.JUNIOR, description: 'Kami mencari UI/UX Designer kreatif untuk mendesain pengalaman pengguna yang intuitif dan menarik.', requirements: 'S1 Desain Komunikasi Visual / DKV\nFigma, Adobe XD\nPortfolio yang kuat\nPengalaman 1+ tahun', skills: ['Figma', 'Adobe XD', 'User Research', 'Wireframing', 'Prototyping', 'UI Design'], source: 'manual', postedAt: new Date('2026-07-12') },
  { title: 'Data Analyst', companyIndex: 1, location: 'Jakarta Selatan', city: 'Jakarta', province: 'DKI Jakarta', salaryMin: 9000000, salaryMax: 16000000, type: JobType.FULL_TIME, level: JobLevel.MID, description: 'Bergabung dengan tim data untuk menganalisis data bisnis dan memberikan insight yang actionable.', requirements: 'S1 Matematika / Statistik / Ilmu Komputer\nSQL, Python, Excel\nPengalaman 2+ tahun\nPengalaman dengan BI tools (Tableau, Looker)', skills: ['SQL', 'Python', 'Tableau', 'Excel', 'Data Visualization', 'Statistics'], source: 'manual', postedAt: new Date('2026-07-09') },
  { title: 'Product Manager', companyIndex: 2, location: 'Jakarta Barat', city: 'Jakarta', province: 'DKI Jakarta', salaryMin: 15000000, salaryMax: 25000000, type: JobType.FULL_TIME, level: JobLevel.SENIOR, description: 'Kami mencari Product Manager berpengalaman untuk memimpin pengembangan produk digital kami.', requirements: 'S1/S2 dari universitas terkemuka\nPengalaman 5+ tahun di product management\nPengalaman dengan agile methodology\nLeadership dan communication skills', skills: ['Product Management', 'Agile', 'Scrum', 'User Research', 'Data Analysis', 'Leadership'], source: 'manual', postedAt: new Date('2026-07-08') },
  { title: 'Mobile Developer (Flutter)', companyIndex: 3, location: 'Jakarta', city: 'Jakarta', province: 'DKI Jakarta', salaryMin: 8000000, salaryMax: 15000000, type: JobType.FULL_TIME, level: JobLevel.MID, description: 'Kembangkan aplikasi mobile cross-platform menggunakan Flutter untuk jutaan pengguna.', requirements: 'S1 Teknik Informatika\nPengalaman 2+ tahun dengan Flutter/Dart\nPengalaman publish ke Play Store / App Store\nFirebase, REST API', skills: ['Flutter', 'Dart', 'Firebase', 'REST API', 'Mobile Development', 'Git'], source: 'manual', postedAt: new Date('2026-07-11') },
  { title: 'DevOps Engineer', companyIndex: 4, location: 'Jakarta', city: 'Jakarta', province: 'DKI Jakarta', salaryMin: 12000000, salaryMax: 22000000, type: JobType.FULL_TIME, level: JobLevel.SENIOR, description: 'Manage dan optimalkan infrastructure cloud kami untuk mendukung jutaan transaksi harian.', requirements: 'S1 Teknik Informatika\nPengalaman 3+ tahun di DevOps\nAWS/GCP, Docker, Kubernetes\nCI/CD, Terraform', skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Python'], source: 'manual', postedAt: new Date('2026-07-10') },
  { title: 'Digital Marketing Specialist', companyIndex: 7, location: 'Jakarta', city: 'Jakarta', province: 'DKI Jakarta', salaryMin: 6000000, salaryMax: 11000000, type: JobType.FULL_TIME, level: JobLevel.JUNIOR, description: 'Bergabung dengan tim marketing untuk mengelola kampanye digital dan meningkatkan brand awareness.', requirements: 'S1 Marketing / Komunikasi\nPengalaman 1+ tahun di digital marketing\nGoogle Ads, Facebook Ads, SEO/SEM\nAnalytical thinking', skills: ['Digital Marketing', 'Google Ads', 'Facebook Ads', 'SEO', 'Content Marketing', 'Analytics'], source: 'manual', postedAt: new Date('2026-07-12') },
  { title: 'Full Stack Developer', companyIndex: 9, location: 'Jakarta', city: 'Jakarta', province: 'DKI Jakarta', salaryMin: 10000000, salaryMax: 18000000, type: JobType.FULL_TIME, level: JobLevel.MID, description: 'Kembangkan fitur end-to-end untuk platform edukasi yang digunakan jutaan pelajar Indonesia.', requirements: 'S1 Teknik Informatika\nPengalaman 2+ tahun\nReact/Next.js + Node.js\nPostgreSQL, Redis', skills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker'], source: 'manual', postedAt: new Date('2026-07-11') },
  { title: 'QA Engineer', companyIndex: 8, location: 'Jakarta', city: 'Jakarta', province: 'DKI Jakarta', salaryMin: 7000000, salaryMax: 13000000, type: JobType.FULL_TIME, level: JobLevel.JUNIOR, description: 'Pastikan kualitas produk melalui testing manual dan otomatis.', requirements: 'S1 Teknik Informatika\nPengalaman 1+ tahun di QA\nSelenium, Cypress, atau Playwright\nTest case design', skills: ['QA', 'Selenium', 'Cypress', 'Playwright', 'Manual Testing', 'API Testing'], source: 'manual', postedAt: new Date('2026-07-12') },
  { title: 'Data Engineer', companyIndex: 0, location: 'Jakarta Selatan', city: 'Jakarta', province: 'DKI Jakarta', salaryMin: 12000000, salaryMax: 22000000, type: JobType.FULL_TIME, level: JobLevel.SENIOR, description: 'Bangun dan maintain data pipeline untuk mendukung analitik dan machine learning.', requirements: 'S1 Teknik Informatika / Ilmu Komputer\nPengalaman 3+ tahun\nPython, SQL, Spark, Airflow\nData warehouse design', skills: ['Python', 'SQL', 'Apache Spark', 'Airflow', 'Data Warehouse', 'ETL', 'BigQuery'], source: 'manual', postedAt: new Date('2026-07-09') },
  { title: 'Content Writer', companyIndex: 9, location: 'Remote', city: null, province: null, salaryMin: 5000000, salaryMax: 9000000, type: JobType.FULL_TIME, level: JobLevel.ENTRY, description: 'Buat konten edukatif yang menarik untuk platform Ruangguru.', requirements: 'S1 Sastra / Komunikasi / Journalism\nMenulis yang baik dalam Bahasa Indonesia\nSEO knowledge adalah nilai plus\nPortfolio tulisan', skills: ['Content Writing', 'SEO', 'Copywriting', 'Research', 'Indonesian'], source: 'manual', postedAt: new Date('2026-07-13') },
  { title: 'Intern - Software Engineering', companyIndex: 0, location: 'Jakarta Selatan', city: 'Jakarta', province: 'DKI Jakarta', salaryMin: 3000000, salaryMax: 5000000, type: JobType.INTERNSHIP, level: JobLevel.ENTRY, description: 'Magang di tim engineering Gojek selama 3-6 bulan. Kesempatan untuk belajar dari engineer terbaik.', requirements: 'Mahasiswa semester 5+ dari Teknik Informatika / Ilmu Komputer\nDasar pemrograman (JavaScript, Python, atau Java)\nMotivasi tinggi untuk belajar\nBisa full-time selama magang', skills: ['JavaScript', 'Python', 'Git', 'Problem Solving'], source: 'manual', postedAt: new Date('2026-07-13') },
  { title: 'Cloud Architect', companyIndex: 6, location: 'Bandung', city: 'Bandung', province: 'Jawa Barat', salaryMin: 20000000, salaryMax: 35000000, type: JobType.FULL_TIME, level: JobLevel.DIRECTOR, description: 'Lead cloud architecture dan infrastructure strategy untuk Telkom Indonesia.', requirements: 'S1/S2 Teknik Informatika\nPengalaman 8+ tahun di cloud architecture\nAWS/Azure/GCP certified\nLeadership skills', skills: ['AWS', 'Azure', 'GCP', 'Cloud Architecture', 'Kubernetes', 'Terraform', 'Leadership'], source: 'manual', postedAt: new Date('2026-07-08') },
  { title: 'Freelance Web Designer', companyIndex: null, location: 'Remote', city: null, province: null, salaryMin: 5000000, salaryMax: 15000000, type: JobType.FREELANCE, level: JobLevel.MID, description: 'Desain website untuk berbagai klien startup dan UMKM di Indonesia.', requirements: 'Portfolio web design yang kuat\nFigma, HTML/CSS\nPengalaman 2+ tahun\nBisa bekerja mandiri', skills: ['Web Design', 'Figma', 'HTML', 'CSS', 'WordPress', 'Responsive Design'], source: 'manual', postedAt: new Date('2026-07-12') },
  { title: 'Machine Learning Engineer', companyIndex: 0, location: 'Jakarta Selatan', city: 'Jakarta', province: 'DKI Jakarta', salaryMin: 15000000, salaryMax: 28000000, type: JobType.FULL_TIME, level: JobLevel.SENIOR, description: 'Kembangkan model ML untuk meningkatkan用户体验 di ekosistem Gojek.', requirements: 'S1/S2 Ilmu Komputer / Matematika\nPengalaman 3+ tahun di ML\nPython, TensorFlow/Pytorch\nPengalaman dengan NLP atau Computer Vision', skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'SQL'], source: 'manual', postedAt: new Date('2026-07-10') },
];

async function main() {
  console.log('🌱 Seeding companies and jobs...');

  // Create companies
  const createdCompanies = [];
  for (const companyData of companies) {
    const company = await prisma.company.upsert({
      where: { name: companyData.name },
      update: {},
      create: companyData,
    });
    createdCompanies.push(company);
  }
  console.log(`✅ Created ${createdCompanies.length} companies`);

  // Create jobs
  let jobCount = 0;
  for (const jobData of jobs) {
    const company = jobData.companyIndex !== null ? createdCompanies[jobData.companyIndex] : null;
    await prisma.job.create({
      data: {
        title: jobData.title,
        companyId: company?.id || null,
        location: jobData.location,
        city: jobData.city,
        province: jobData.province,
        salaryMin: jobData.salaryMin,
        salaryMax: jobData.salaryMax,
        salaryLabel: `Rp ${(jobData.salaryMin / 1000000).toFixed(0)}-${(jobData.salaryMax / 1000000).toFixed(0)} juta`,
        type: jobData.type,
        level: jobData.level,
        description: jobData.description,
        requirements: jobData.requirements,
        skills: jobData.skills,
        source: jobData.source,
        postedAt: jobData.postedAt,
      },
    });
    jobCount++;
  }
  console.log(`✅ Created ${jobCount} jobs`);
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
