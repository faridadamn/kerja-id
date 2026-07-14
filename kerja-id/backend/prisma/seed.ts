import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create skill categories
  const techCategory = await prisma.skillCategory.upsert({
    where: { name: 'Technology' },
    update: {},
    create: { name: 'Technology', industry: 'IT' },
  });

  const businessCategory = await prisma.skillCategory.upsert({
    where: { name: 'Business' },
    update: {},
    create: { name: 'Business', industry: 'General' },
  });

  // Create skill definitions
  const skills = [
    { name: 'JavaScript', categoryId: techCategory.id, aliases: ['JS', 'ECMAScript'] },
    { name: 'TypeScript', categoryId: techCategory.id, aliases: ['TS'] },
    { name: 'React', categoryId: techCategory.id, aliases: ['React.js', 'ReactJS'] },
    { name: 'Node.js', categoryId: techCategory.id, aliases: ['NodeJS', 'Node'] },
    { name: 'Python', categoryId: techCategory.id, aliases: ['Py'] },
    { name: 'SQL', categoryId: techCategory.id, aliases: ['MySQL', 'PostgreSQL'] },
    { name: 'Communication', categoryId: businessCategory.id, aliases: ['Komunikasi'] },
    { name: 'Leadership', categoryId: businessCategory.id, aliases: ['Kepemimpinan'] },
    { name: 'Project Management', categoryId: businessCategory.id, aliases: ['PM'] },
    { name: 'Data Analysis', categoryId: techCategory.id, aliases: ['Analytics'] },
  ];

  for (const skill of skills) {
    await prisma.skillDefinition.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }

  // Create demo user
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('Demo1234!', salt);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@kerja.id' },
    update: {},
    create: {
      email: 'demo@kerja.id',
      passwordHash,
      emailVerified: true,
      profile: {
        create: {
          fullName: 'Demo User',
          headline: 'Full Stack Developer',
          bio: 'Ini adalah akun demo KERJA.ID',
          location: 'Jakarta, Indonesia',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          profileCompletion: 45,
        },
      },
    },
  });

  // Add some skills to demo user
  for (const skillName of ['JavaScript', 'TypeScript', 'React', 'Node.js']) {
    await prisma.userSkill.upsert({
      where: {
        userId_name: { userId: demoUser.id, name: skillName },
      },
      update: {},
      create: {
        userId: demoUser.id,
        name: skillName,
        level: Math.floor(Math.random() * 3) + 3, // 3-5
      },
    });
  }

  // Add experience
  await prisma.experience.create({
    data: {
      userId: demoUser.id,
      company: 'PT Teknologi Maju',
      position: 'Frontend Developer',
      description: 'Mengembangkan aplikasi web menggunakan React dan TypeScript',
      startDate: new Date('2022-01-15'),
      isCurrent: true,
      location: 'Jakarta',
    },
  });

  // Add education
  await prisma.education.create({
    data: {
      userId: demoUser.id,
      institution: 'Universitas Indonesia',
      degree: 'S1',
      field: 'Teknik Informatika',
      startYear: 2018,
      endYear: 2022,
      gpa: 3.75,
    },
  });

  console.log('✅ Seeding completed!');
  console.log(`   Demo user: demo@kerja.id / Demo1234!`);
  console.log(`   Skills: ${skills.length} created`);
  console.log(`   Skill categories: 2 created`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
