import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDb() {
  console.log('[CheckDB] Inspecting database users...');
  const users = await prisma.user.findMany({
    include: {
      studentProfile: true,
      adminProfile: true,
    },
  });

  console.log(`Total Users in Active DB: ${users.length}`);
  users.forEach((u) => {
    console.log(`- ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Role: ${u.role}`);
  });

  const students = await prisma.studentProfile.findMany();
  console.log(`Total Student Profiles in Active DB: ${students.length}`);
  students.forEach((s) => {
    console.log(`- Student ID: ${s.id} | Roll: ${s.rollNumber} | UserID: ${s.userId}`);
  });
}

checkDb()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
