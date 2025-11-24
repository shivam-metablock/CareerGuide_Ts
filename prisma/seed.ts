import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample careers for Class 10
  const class10Careers = await Promise.all([
    prisma.career.create({
      data: {
        name: 'Electrician',
        description: 'Install, maintain, and repair electrical systems',
        level: 'Class10',
        isPaid:true,
        salaryInsights: {
          create: Array.from({ length: 21 }, (_, i) => ({
            year: i,
            minSalary: 150000 + i * 10000,
            avgSalary: 200000 + i * 15000,
            maxSalary: 300000 + i * 25000,
          })),
        },
      },
    }),
    prisma.career.create({
      data: {
        name: 'Plumber',
        description: 'Install and repair plumbing systems',
        level: 'Class10',
        salaryInsights: {
          create: Array.from({ length: 21 }, (_, i) => ({
            year: i,
            minSalary: 140000 + i * 9000,
            avgSalary: 180000 + i * 12000,
            maxSalary: 280000 + i * 20000,
          })),
        },
      },
    }),
  ]);

  // Create sample careers for Science stream
  const scienceCareers = await Promise.all([
    prisma.career.create({
      data: {
        name: 'Software Engineer',
        description: 'Design and develop software applications',
        stream: 'Science',
        level: 'Stream',
        isPaid:true,
        salaryInsights: {
          create: Array.from({ length: 21 }, (_, i) => ({
            year: i,
            minSalary: 300000 + i * 50000,
            avgSalary: 500000 + i * 80000,
            maxSalary: 800000 + i * 150000,
          })),
        },
      },
    }),
    prisma.career.create({
      data: {
        name: 'Doctor',
        description: 'Diagnose and treat medical conditions',
        stream: 'Science',
        level: 'Stream',
        salaryInsights: {
          create: Array.from({ length: 21 }, (_, i) => ({
            year: i,
            minSalary: 500000 + i * 80000,
            avgSalary: 800000 + i * 150000,
            maxSalary: 1500000 + i * 300000,
          })),
        },
      },
    }),
  ]);

  // Create sample careers for Commerce stream
  const commerceCareers = await Promise.all([
    prisma.career.create({
      data: {
        name: 'Chartered Accountant',
        description: 'Provide financial and accounting services',
        stream: 'Commerce',
        level: 'Stream',
        isPaid:true,
        salaryInsights: {
          create: Array.from({ length: 21 }, (_, i) => ({
            year: i,
            minSalary: 400000 + i * 60000,
            avgSalary: 600000 + i * 100000,
            maxSalary: 1200000 + i * 200000,
          })),
        },
      },
    }),
  ]);

  // Create sample careers for Arts stream
  const artsCareers = await Promise.all([
    prisma.career.create({
      data: {
        name: 'Graphic Designer',
        description: 'Create visual concepts and designs',
        stream: 'Arts',
        isPaid:true,
        level: 'Stream',
        salaryInsights: {
          create: Array.from({ length: 21 }, (_, i) => ({
            year: i,
            minSalary: 250000 + i * 30000,
            avgSalary: 400000 + i * 60000,
            maxSalary: 700000 + i * 120000,
          })),
        },
      },
    }),
  ]);

  // Create sample coaching centers
  const coaching = await Promise.all([
    prisma.coaching.create({
      data: {
        name: 'Tech Prep Academy',
        description: 'Leading coaching center for engineering and technology careers',
        website: 'https://techprep.example.com',
        address: '123 Tech Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        phone: '+91-9876543210',
        email: 'info@techprep.example.com',
        careers: {
          create: [
            { careerId: scienceCareers[0].id },
          ],
        },
      },
    }),
    prisma.coaching.create({
      data: {
        name: 'Medical Excellence Center',
        description: 'Premium coaching for medical entrance exams',
        website: 'https://medicalexcellence.example.com',
        address: '456 Medical Avenue',
        city: 'Delhi',
        state: 'Delhi',
        isPaid:true,
        phone: '+91-9876543211',
        email: 'info@medicalexcellence.example.com',
        careers: {
          create: [
            { careerId: scienceCareers[1].id },
          ],
        },
      },
    }),
  ]);

  // Create sample colleges
  const colleges = await Promise.all([
    prisma.college.create({
      data: {
        name: 'Mumbai Institute of Technology',
        description: 'Premier engineering college',
        website: 'https://mit.example.com',
        address: '789 Education Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        stream: 'Science',
        courses: ['B.Tech', 'MCA', 'M.Tech'],
        fees: 200000,
        phone: '+91-9876543220',
        email: 'admissions@mit.example.com',
      },
    }),
    prisma.college.create({
      data: {
        name: 'Delhi Commerce College',
        description: 'Leading commerce college',
        website: 'https://dcc.example.com',
        address: '321 Commerce Street',
        city: 'Delhi',
        state: 'Delhi',
        isPaid:true,
        stream: 'Commerce',
        courses: ['B.Com', 'MBA', 'CA'],
        fees: 150000,
        phone: '+91-9876543221',
        email: 'admissions@dcc.example.com',
      },
    }),
  ]);

  // Create sample PGs
  await Promise.all([
    prisma.pG.create({
      data: {
        name: 'Student PG Home',
        description: 'Clean and safe PG accommodation',
        address: '100 Student Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        ownerName: 'Rajesh Kumar',
        isPaid:true,
        ownerPhone: '+91-9876543230',
        ownerEmail: 'rajesh@studentpg.example.com',
        monthlyRent: 8000,
        amenities: ['WiFi', 'AC', 'Food', 'Laundry'],
        coachingId: coaching[0].id,
        distance: 2.5,
      },
    }),
    prisma.pG.create({
      data: {
        name: 'Comfort Stay PG',
        description: 'Premium PG with all amenities',
        address: '200 Comfort Street',
        city: 'Delhi',
        state: 'Delhi',
        ownerName: 'Priya Sharma',
        ownerPhone: '+91-9876543231',
        ownerEmail: 'priya@comfortstay.example.com',
        monthlyRent: 10000,
        amenities: ['WiFi', 'AC', 'Food', 'Gym', 'Laundry'],
        coachingId: coaching[1].id,
        distance: 1.5,
      },
    }),
  ]);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    //@ts-ignore
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

