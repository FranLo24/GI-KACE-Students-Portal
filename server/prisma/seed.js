const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const seedStudents = [
  {
    fullName: 'Ama Mensah',
    gender: 'Female',
    nationality: 'Ghanaian',
    idType: 'Ghana Card',
    idTypeOther: null,
    idNumber: 'GHA-1847293',
    phoneNumber: '0241000001',
    alternativePhone: '0201000001',
    emailAddress: 'ama.mensah@example.com',
    residentialAddress: '12 Adenta Housing Road',
    cityTown: 'Accra',
    highestEducation: 'Diploma',
    highestEducationOther: null,
    fieldOfStudy: 'Information Technology',
    employmentStatus: 'Student',
    organizationName: null,
    jobTitle: null,
    yearsOfExperience: '1',
    courseTitle: 'Cybersecurity',
    courseCategory: 'Cybersecurity',
    courseCategoryOther: null,
    computerLiteracy: 'Intermediate',
    relevantSkills: 'Basic networking and safe internet practices',
    emergencyName: 'Akosua Mensah',
    emergencyRelationship: 'Mother',
    emergencyPhone: '0247000001',
    createdAt: new Date('2026-04-09T09:15:00.000Z'),
  },
  {
    fullName: 'Kojo Asare',
    gender: 'Male',
    nationality: 'Ghanaian',
    idType: 'Passport',
    idTypeOther: null,
    idNumber: 'P1234-5678',
    phoneNumber: '0241000002',
    alternativePhone: '0201000002',
    emailAddress: 'kojo.asare@example.com',
    residentialAddress: '8 Dansoman High Street',
    cityTown: 'Accra',
    highestEducation: "Bachelor's Degree",
    highestEducationOther: null,
    fieldOfStudy: 'Computer Science',
    employmentStatus: 'Employed',
    organizationName: 'Bright Solutions',
    jobTitle: 'Support Analyst',
    yearsOfExperience: '3',
    courseTitle: 'Data Analytics with Python',
    courseCategory: 'Data Analytics with Python',
    courseCategoryOther: null,
    computerLiteracy: 'Advanced',
    relevantSkills: 'Excel reporting, SQL basics, and Python scripting',
    emergencyName: 'Yaw Asare',
    emergencyRelationship: 'Brother',
    emergencyPhone: '0247000002',
    createdAt: new Date('2026-04-10T11:30:00.000Z'),
  },
  {
    fullName: 'Efua Owusu',
    gender: 'Female',
    nationality: 'Ghanaian',
    idType: 'Ghana Card',
    idTypeOther: null,
    idNumber: 'GHA-2847293',
    phoneNumber: '0241000003',
    alternativePhone: null,
    emailAddress: 'efua.owusu@example.com',
    residentialAddress: '33 Fante New Town Road',
    cityTown: 'Kumasi',
    highestEducation: 'High School',
    highestEducationOther: null,
    fieldOfStudy: 'General Arts',
    employmentStatus: 'Unemployed',
    organizationName: null,
    jobTitle: null,
    yearsOfExperience: '0',
    courseTitle: 'Office Productivity Suite',
    courseCategory: 'Office Productivity Suite',
    courseCategoryOther: null,
    computerLiteracy: 'Beginner',
    relevantSkills: 'Typing and internet browsing',
    emergencyName: 'Adwoa Owusu',
    emergencyRelationship: 'Sister',
    emergencyPhone: '0247000003',
    createdAt: new Date('2026-04-11T08:05:00.000Z'),
  },
  {
    fullName: 'Kwame Boateng',
    gender: 'Male',
    nationality: 'Ghanaian',
    idType: 'Ghana Card',
    idTypeOther: null,
    idNumber: 'GHA-3847293',
    phoneNumber: '0241000004',
    alternativePhone: '0201000004',
    emailAddress: 'kwame.boateng@example.com',
    residentialAddress: '17 Airport Residential Avenue',
    cityTown: 'Accra',
    highestEducation: "Master's Degree",
    highestEducationOther: null,
    fieldOfStudy: 'Business Administration',
    employmentStatus: 'Self-Employed',
    organizationName: 'KB Consult',
    jobTitle: 'Business Owner',
    yearsOfExperience: '7',
    courseTitle: 'Corporate Trainings',
    courseCategory: 'Corporate Trainings',
    courseCategoryOther: null,
    computerLiteracy: 'Advanced',
    relevantSkills: 'Team leadership, presentations, and digital workflow tools',
    emergencyName: 'Mabel Boateng',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '0247000004',
    createdAt: new Date('2026-04-12T14:25:00.000Z'),
  },
  {
    fullName: 'Abena Frimpong',
    gender: 'Female',
    nationality: 'Ghanaian',
    idType: 'Other',
    idTypeOther: 'Voter ID',
    idNumber: 'VOT-9182736',
    phoneNumber: '0241000005',
    alternativePhone: null,
    emailAddress: 'abena.frimpong@example.com',
    residentialAddress: '5 Asafo Market Lane',
    cityTown: 'Kumasi',
    highestEducation: 'Other',
    highestEducationOther: 'Professional Certificate',
    fieldOfStudy: 'Accounting',
    employmentStatus: 'Employed',
    organizationName: 'Golden Ledger',
    jobTitle: 'Accounts Clerk',
    yearsOfExperience: '2',
    courseTitle: 'Data Analytics with BI',
    courseCategory: 'Data Analytics with BI',
    courseCategoryOther: null,
    computerLiteracy: 'Intermediate',
    relevantSkills: 'Spreadsheet modelling and dashboard interpretation',
    emergencyName: 'Kofi Frimpong',
    emergencyRelationship: 'Father',
    emergencyPhone: '0247000005',
    createdAt: new Date('2026-04-13T10:40:00.000Z'),
  },
  {
    fullName: 'Yaw Bediako',
    gender: 'Male',
    nationality: 'Ghanaian',
    idType: 'Passport',
    idTypeOther: null,
    idNumber: 'P2234-5678',
    phoneNumber: '0241000006',
    alternativePhone: '0201000006',
    emailAddress: 'yaw.bediako@example.com',
    residentialAddress: '44 Takoradi Harbour Road',
    cityTown: 'Takoradi',
    highestEducation: 'Diploma',
    highestEducationOther: null,
    fieldOfStudy: 'Electrical Engineering',
    employmentStatus: 'Employed',
    organizationName: 'Westline Networks',
    jobTitle: 'Field Technician',
    yearsOfExperience: '4',
    courseTitle: 'CCNA',
    courseCategory: 'CCNA',
    courseCategoryOther: null,
    computerLiteracy: 'Intermediate',
    relevantSkills: 'Cable management and router setup',
    emergencyName: 'Esi Bediako',
    emergencyRelationship: 'Mother',
    emergencyPhone: '0247000006',
    createdAt: new Date('2026-04-14T16:10:00.000Z'),
  },
  {
    fullName: 'Naa Dedei Lamptey',
    gender: 'Female',
    nationality: 'Ghanaian',
    idType: 'Ghana Card',
    idTypeOther: null,
    idNumber: 'GHA-4847293',
    phoneNumber: '0241000007',
    alternativePhone: null,
    emailAddress: 'naa.lamptey@example.com',
    residentialAddress: '19 Spintex Coastal Road',
    cityTown: 'Tema',
    highestEducation: "Bachelor's Degree",
    highestEducationOther: null,
    fieldOfStudy: 'Marketing',
    employmentStatus: 'Employed',
    organizationName: 'Media Reach',
    jobTitle: 'Marketing Assistant',
    yearsOfExperience: '2',
    courseTitle: 'Certificate in Software Development',
    courseCategory: 'Certificate in Software Development',
    courseCategoryOther: null,
    computerLiteracy: 'Intermediate',
    relevantSkills: 'Content planning and website updates',
    emergencyName: 'Sika Lamptey',
    emergencyRelationship: 'Aunt',
    emergencyPhone: '0247000007',
    createdAt: new Date('2026-04-15T07:55:00.000Z'),
  },
  {
    fullName: 'Daniel Tetteh',
    gender: 'Male',
    nationality: 'Ghanaian',
    idType: 'Ghana Card',
    idTypeOther: null,
    idNumber: 'GHA-5847293',
    phoneNumber: '0241000008',
    alternativePhone: '0201000008',
    emailAddress: 'daniel.tetteh@example.com',
    residentialAddress: '27 Koforidua Mission Road',
    cityTown: 'Koforidua',
    highestEducation: 'High School',
    highestEducationOther: null,
    fieldOfStudy: 'Science',
    employmentStatus: 'Student',
    organizationName: null,
    jobTitle: null,
    yearsOfExperience: '0',
    courseTitle: 'Diploma in Business Computing',
    courseCategory: 'Diploma in Business Computing',
    courseCategoryOther: null,
    computerLiteracy: 'Beginner',
    relevantSkills: 'Basic computer maintenance and word processing',
    emergencyName: 'Grace Tetteh',
    emergencyRelationship: 'Mother',
    emergencyPhone: '0247000008',
    createdAt: new Date('2026-04-16T13:20:00.000Z'),
  },
  {
    fullName: 'Mavis Koomson',
    gender: 'Female',
    nationality: 'Ghanaian',
    idType: 'Passport',
    idTypeOther: null,
    idNumber: 'P3234-5678',
    phoneNumber: '0241000009',
    alternativePhone: null,
    emailAddress: 'mavis.koomson@example.com',
    residentialAddress: '6 Cape Coast Castle Road',
    cityTown: 'Cape Coast',
    highestEducation: 'Diploma',
    highestEducationOther: null,
    fieldOfStudy: 'Statistics',
    employmentStatus: 'Employed',
    organizationName: 'Insight Hub',
    jobTitle: 'Research Assistant',
    yearsOfExperience: '3',
    courseTitle: 'Data Analytics with Python',
    courseCategory: 'Data Analytics with Python',
    courseCategoryOther: null,
    computerLiteracy: 'Advanced',
    relevantSkills: 'Data cleaning and report writing',
    emergencyName: 'Kweku Koomson',
    emergencyRelationship: 'Brother',
    emergencyPhone: '0247000009',
    createdAt: new Date('2026-04-17T09:45:00.000Z'),
  },
  {
    fullName: 'Samuel Ofori',
    gender: 'Male',
    nationality: 'Ghanaian',
    idType: 'Other',
    idTypeOther: 'Driver License',
    idNumber: 'DL-9182736',
    phoneNumber: '0241000010',
    alternativePhone: '0201000010',
    emailAddress: 'samuel.ofori@example.com',
    residentialAddress: '15 Sunyani College Road',
    cityTown: 'Sunyani',
    highestEducation: 'Other',
    highestEducationOther: 'Technical Certificate',
    fieldOfStudy: 'Mechanical Engineering',
    employmentStatus: 'Self-Employed',
    organizationName: 'Ofori Tech Works',
    jobTitle: 'Technician',
    yearsOfExperience: '5',
    courseTitle: 'Network Security Operations',
    courseCategory: 'Other',
    courseCategoryOther: 'Network Security',
    computerLiteracy: 'Intermediate',
    relevantSkills: 'Hardware repairs and small office network support',
    emergencyName: 'Comfort Ofori',
    emergencyRelationship: 'Sister',
    emergencyPhone: '0247000010',
    createdAt: new Date('2026-04-18T15:05:00.000Z'),
  },
  {
    fullName: 'Priscilla Nortey',
    gender: 'Female',
    nationality: 'Ghanaian',
    idType: 'Ghana Card',
    idTypeOther: null,
    idNumber: 'GHA-6847293',
    phoneNumber: '0241000011',
    alternativePhone: null,
    emailAddress: 'priscilla.nortey@example.com',
    residentialAddress: '11 Ho Municipal Avenue',
    cityTown: 'Ho',
    highestEducation: "Bachelor's Degree",
    highestEducationOther: null,
    fieldOfStudy: 'Human Resource Management',
    employmentStatus: 'Employed',
    organizationName: 'People First',
    jobTitle: 'HR Officer',
    yearsOfExperience: '4',
    courseTitle: 'Office Productivity Suite',
    courseCategory: 'Office Productivity Suite',
    courseCategoryOther: null,
    computerLiteracy: 'Intermediate',
    relevantSkills: 'Document management and spreadsheet reporting',
    emergencyName: 'Janet Nortey',
    emergencyRelationship: 'Mother',
    emergencyPhone: '0247000011',
    createdAt: new Date('2026-04-19T10:10:00.000Z'),
  },
  {
    fullName: 'Elvis Adu',
    gender: 'Male',
    nationality: 'Ghanaian',
    idType: 'Passport',
    idTypeOther: null,
    idNumber: 'P4234-5678',
    phoneNumber: '0241000012',
    alternativePhone: '0201000012',
    emailAddress: 'elvis.adu@example.com',
    residentialAddress: '9 Tamale Central Link',
    cityTown: 'Tamale',
    highestEducation: 'Diploma',
    highestEducationOther: null,
    fieldOfStudy: 'Business Information Systems',
    employmentStatus: 'Employed',
    organizationName: 'Northern Trade',
    jobTitle: 'Operations Assistant',
    yearsOfExperience: '3',
    courseTitle: 'Corporate Trainings',
    courseCategory: 'Corporate Trainings',
    courseCategoryOther: null,
    computerLiteracy: 'Advanced',
    relevantSkills: 'Operational reporting and team productivity tools',
    emergencyName: 'Latifa Adu',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '0247000012',
    createdAt: new Date('2026-04-20T12:35:00.000Z'),
  },
];

const femaleFirstNames = [
  'Akosua', 'Adwoa', 'Esi', 'Joana', 'Janet', 'Naana', 'Yaa', 'Doreen', 'Belinda', 'Patricia',
  'Mercy', 'Paulina', 'Sena', 'Christiana', 'Vida', 'Anita', 'Josephine', 'Mildred', 'Matilda', 'Beatrice',
];

const maleFirstNames = [
  'Kofi', 'Kwadwo', 'Nana', 'Richard', 'Michael', 'Emmanuel', 'Isaac', 'Albert', 'Francis', 'Solomon',
  'Ernest', 'Desmond', 'Patrick', 'Evans', 'Felix', 'Benjamin', 'Augustine', 'Stephen', 'Mawuli', 'Theophilus',
];

const surnames = [
  'Mensima', 'Agyeman', 'Appiah', 'Oppong', 'Darko', 'Ampofo', 'Nyarko', 'Sarpong', 'Ankomah', 'Baah',
  'Kusi', 'Amankwah', 'Gyamfi', 'Bonsu', 'Acheampong', 'Owusu', 'Asiedu', 'Antwi', 'Boadi', 'Anim',
];

const emergencyFirstNames = [
  'Grace', 'Comfort', 'Mabel', 'Akua', 'Linda', 'Esther', 'Ruth', 'Abigail', 'Rose', 'Irene',
  'Yaw', 'Kwesi', 'Kojo', 'Nii', 'Samuel', 'Daniel', 'David', 'Paul', 'Peter', 'Joseph',
];

const streetNames = [
  'Community Road', 'College Avenue', 'Station Road', 'Market Lane', 'Harbour Street', 'Mission Road',
  'Coastal Road', 'Central Avenue', 'Industrial Area', 'High Street', 'Ring Road', 'Independence Avenue',
];

const cities = [
  'Accra', 'Kumasi', 'Tema', 'Takoradi', 'Koforidua', 'Cape Coast', 'Sunyani', 'Tamale', 'Ho', 'Kasoa',
  'Bolgatanga', 'Wa',
];

const fieldStudies = [
  'Computer Science', 'Information Technology', 'Business Administration', 'Marketing', 'Accounting', 'Statistics',
  'Electrical Engineering', 'Human Resource Management', 'General Arts', 'Business Information Systems',
  'Procurement Management', 'Economics',
];

const employmentProfiles = [
  { status: 'Student', organizationName: null, jobTitle: null, yearsOfExperience: '0' },
  { status: 'Unemployed', organizationName: null, jobTitle: null, yearsOfExperience: '0' },
  { status: 'Employed', organizationName: 'BlueWave Systems', jobTitle: 'Operations Assistant', yearsOfExperience: '2' },
  { status: 'Employed', organizationName: 'Summit Data Hub', jobTitle: 'Administrative Officer', yearsOfExperience: '4' },
  { status: 'Self-Employed', organizationName: 'PrimeTech Services', jobTitle: 'Consultant', yearsOfExperience: '5' },
];

const courseProfiles = [
  { courseTitle: 'Cybersecurity', courseCategory: 'Cybersecurity', courseCategoryOther: null },
  { courseTitle: 'Data Analytics with Python', courseCategory: 'Data Analytics with Python', courseCategoryOther: null },
  { courseTitle: 'Data Analytics with BI', courseCategory: 'Data Analytics with BI', courseCategoryOther: null },
  { courseTitle: 'Certificate in Software Development', courseCategory: 'Certificate in Software Development', courseCategoryOther: null },
  { courseTitle: 'CCNA', courseCategory: 'CCNA', courseCategoryOther: null },
  { courseTitle: 'Diploma in Business Computing', courseCategory: 'Diploma in Business Computing', courseCategoryOther: null },
  { courseTitle: 'Office Productivity Suite', courseCategory: 'Office Productivity Suite', courseCategoryOther: null },
  { courseTitle: 'Corporate Trainings', courseCategory: 'Corporate Trainings', courseCategoryOther: null },
  { courseTitle: 'Cloud Support Fundamentals', courseCategory: 'Other', courseCategoryOther: 'Cloud Computing' },
  { courseTitle: 'Digital Media Essentials', courseCategory: 'Other', courseCategoryOther: 'Digital Media' },
];

const skills = [
  'Spreadsheet analysis and reporting',
  'Basic networking and internet research',
  'Document preparation and presentations',
  'Customer support and digital communication',
  'Data entry and records management',
  'Web browsing, email, and collaboration tools',
  'Introductory coding and troubleshooting',
  'Dashboard review and KPI tracking',
];

const relationships = ['Mother', 'Father', 'Brother', 'Sister', 'Spouse', 'Aunt', 'Uncle', 'Guardian'];
const educationLevels = ['High School', 'Diploma', "Bachelor's Degree", "Master's Degree", 'Other'];
const literacyLevels = ['Beginner', 'Intermediate', 'Advanced'];
const otherIdTypes = ['Voter ID', 'Driver License', 'NHIS Card'];
const otherEducationLevels = ['Professional Certificate', 'Technical Certificate', 'Vocational Training'];

function padNumber(value) {
  return String(value).padStart(4, '0');
}

function buildGeneratedStudent(index) {
  const offset = index + 13;
  const isFemale = index % 2 === 0;
  const firstName = isFemale
    ? femaleFirstNames[Math.floor(index / 2) % femaleFirstNames.length]
    : maleFirstNames[Math.floor(index / 2) % maleFirstNames.length];
  const surname = surnames[index % surnames.length];
  const fullName = `${firstName} ${surname}`;
  const idTypeOptions = ['Ghana Card', 'Passport', 'Other'];
  const idType = idTypeOptions[index % idTypeOptions.length];
  const highestEducation = educationLevels[index % educationLevels.length];
  const employment = employmentProfiles[index % employmentProfiles.length];
  const course = courseProfiles[index % courseProfiles.length];
  const cityTown = cities[index % cities.length];
  const emergencyName = `${emergencyFirstNames[index % emergencyFirstNames.length]} ${surname}`;

  return {
    fullName,
    gender: isFemale ? 'Female' : 'Male',
    nationality: 'Ghanaian',
    idType,
    idTypeOther: idType === 'Other' ? otherIdTypes[index % otherIdTypes.length] : null,
    idNumber:
      idType === 'Ghana Card'
        ? `GHA-${8400000 + offset}`
        : idType === 'Passport'
          ? `P${52000000 + offset}`
          : `ID-${7300000 + offset}`,
    phoneNumber: `0241${padNumber(offset)}`,
    alternativePhone: index % 3 === 0 ? `0201${padNumber(offset)}` : null,
    emailAddress: `${firstName.toLowerCase()}.${surname.toLowerCase()}${offset}@example.com`,
    residentialAddress: `${20 + offset} ${streetNames[index % streetNames.length]}`,
    cityTown,
    highestEducation,
    highestEducationOther: highestEducation === 'Other' ? otherEducationLevels[index % otherEducationLevels.length] : null,
    fieldOfStudy: fieldStudies[index % fieldStudies.length],
    employmentStatus: employment.status,
    organizationName: employment.status === 'Student' || employment.status === 'Unemployed' ? null : employment.organizationName,
    jobTitle: employment.status === 'Student' || employment.status === 'Unemployed' ? null : employment.jobTitle,
    yearsOfExperience: employment.yearsOfExperience,
    courseTitle: course.courseTitle,
    courseCategory: course.courseCategory,
    courseCategoryOther: course.courseCategoryOther,
    computerLiteracy: literacyLevels[index % literacyLevels.length],
    relevantSkills: skills[index % skills.length],
    emergencyName,
    emergencyRelationship: relationships[index % relationships.length],
    emergencyPhone: `0247${padNumber(offset)}`,
    createdAt: new Date(Date.UTC(2026, 3, (index % 28) + 1, 8 + (index % 9), (index * 7) % 60, 0)),
  };
}

const generatedStudents = Array.from({ length: 38 }, (_, index) => buildGeneratedStudent(index));
const students = [...seedStudents, ...generatedStudents];

async function main() {
  for (const student of students) {
    const { emailAddress, ...data } = student;

    await prisma.student.upsert({
      where: { emailAddress },
      update: data,
      create: {
        emailAddress,
        ...data,
      },
    });
  }

  console.log(`Seeded ${students.length} student records.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
