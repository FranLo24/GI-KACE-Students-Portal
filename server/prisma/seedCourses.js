// One-time seed that migrates the previously hardcoded course catalogue
// (client/src/data/courseCatalog.js) into the Course table, copying the
// existing bundled images into server/uploads so the public site looks
// unchanged immediately after this runs. From here on, courses are managed
// through the admin Settings > Course catalogue panel instead of source code.
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const ASSETS_DIR = path.join(__dirname, '..', '..', 'client', 'src', 'assets');
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const COURSES = [
  {
    title: 'Cybersecurity',
    category: 'Cybersecurity',
    spotlight: 'Security Track',
    description: 'Defend systems, networks, and cloud services with hands-on security labs.',
    outcomes: 'Threat detection · Risk analysis',
    imageFile: 'course-cybersecurity.png',
  },
  {
    title: 'Data Analytics with Python',
    category: 'Data Analytics with Python',
    spotlight: 'Data Track',
    description: 'Use Python to clean, analyse, visualise, and communicate real-world data.',
    outcomes: 'Pandas · Visualisation · Insight storytelling',
    imageFile: 'course-python-analytics.png',
  },
  {
    title: 'Data Analytics with BI',
    category: 'Data Analytics with BI',
    spotlight: 'Business Intelligence',
    description: 'Turn dashboards and reporting tools into faster, smarter business decisions.',
    outcomes: 'Dashboards · KPIs · Executive reporting',
    imageFile: 'course-bi-analytics.png',
  },
  {
    title: 'Certificate in Software Development',
    category: 'Certificate in Software Development',
    spotlight: 'Build Track',
    description: 'Design and build modern software products with practical project delivery.',
    outcomes: 'Frontend · Backend · Product thinking',
    imageFile: 'course-software-development.png',
  },
  {
    title: 'CCNA',
    category: 'CCNA',
    spotlight: 'Network Track',
    description: 'Develop job-ready networking skills and prepare for Cisco certification paths.',
    outcomes: 'Routing · Switching · Network operations',
    imageFile: 'course-ccna.png',
  },
  {
    title: 'Diploma in Business Computing',
    category: 'Diploma in Business Computing',
    spotlight: 'Business Tech',
    description: 'Blend digital productivity, business systems, and core computing capability.',
    outcomes: 'Business workflows · ICT foundations',
    imageFile: 'course-business-computing.png',
  },
  {
    title: 'Office Productivity Suite',
    category: 'Office Productivity Suite',
    spotlight: 'Workplace Essentials',
    description: 'Master everyday digital tools for communication, reporting, and collaboration.',
    outcomes: 'Documents · Spreadsheets · Presentations',
    imageFile: 'course-office-suite.png',
  },
  {
    title: 'Corporate Trainings',
    category: 'Corporate Trainings',
    spotlight: 'Custom Teams',
    description: 'Upskill teams with tailored programmes aligned to real organisational goals.',
    outcomes: 'Custom delivery · Team capability uplift',
    imageFile: 'course-corporate-training.png',
  },
];

function copyImage(fileName) {
  const source = path.join(ASSETS_DIR, fileName);
  if (!fs.existsSync(source)) {
    console.warn(`Source image not found, skipping copy: ${source}`);
    return null;
  }
  const destination = path.join(UPLOAD_DIR, fileName);
  fs.copyFileSync(source, destination);
  return `/uploads/${fileName}`;
}

async function main() {
  for (let index = 0; index < COURSES.length; index++) {
    const { title, category, spotlight, description, outcomes, imageFile } = COURSES[index];
    const imageUrl = copyImage(imageFile);

    const existing = await prisma.course.findFirst({ where: { category } });
    if (existing) {
      console.log(`Course already exists for category "${category}", skipping.`);
      continue;
    }

    await prisma.course.create({
      data: {
        title,
        category,
        spotlight,
        description,
        outcomes,
        imageUrl,
        order: index,
        enabled: true,
      },
    });
  }

  console.log('Courses seeded.');
}

main()
  .catch((error) => {
    console.error('Seed courses error:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
