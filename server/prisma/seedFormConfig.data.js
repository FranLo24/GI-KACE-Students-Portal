// Course categories mirrored from client/src/data/courseCatalog.js — kept as a
// plain data file here since the seed script (CommonJS, run with plain node)
// can't import the client's JSX/asset-bundled module.
const featuredCourses = [
  { category: 'Cybersecurity' },
  { category: 'Data Analytics with Python' },
  { category: 'Data Analytics with BI' },
  { category: 'Certificate in Software Development' },
  { category: 'CCNA' },
  { category: 'Diploma in Business Computing' },
  { category: 'Office Productivity Suite' },
  { category: 'Corporate Trainings' },
];

module.exports = { featuredCourses };
