import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  const email = 'admin@dormify.edu';
  const password = 'Password123!';
  const name = 'Hostel Administrator';
  const employeeId = 'EMP-ADM-001';

  console.log(`[Create Admin] Creating admin account: ${email}...`);

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const adminUser = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        name,
        role: 'ADMIN',
      },
      create: {
        email,
        passwordHash,
        role: 'ADMIN',
        name,
        adminProfile: {
          create: {
            employeeId,
            department: 'Hostel Administration',
            designation: 'Senior Hostel Registrar & System Administrator',
          },
        },
      },
      include: {
        adminProfile: true,
      },
    });

    console.log('------------------------------------------------------------');
    console.log('ADMIN USER CREATED SUCCESSFULLY');
    console.log(`- User ID     : ${adminUser.id}`);
    console.log(`- Email       : ${adminUser.email}`);
    console.log(`- Password    : ${password}`);
    console.log(`- Role        : ${adminUser.role}`);
    console.log(`- Employee ID : ${adminUser.adminProfile?.employeeId}`);
    console.log('------------------------------------------------------------');
  } catch (err) {
    console.error('[Create Admin Error]:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
