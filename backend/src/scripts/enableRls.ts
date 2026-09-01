import { prisma } from '../config/db';

async function enableRLS() {
  const tables = [
    'AcademicYear',
    'AdminProfile',
    'Allocation',
    'Application',
    'AuditLog',
    'Bed',
    'Block',
    'FeeReceipt',
    'Floor',
    'Hostel',
    'Notification',
    'Room',
    'StudentProfile',
    'User',
  ];

  console.log('[RLS] Enabling Row Level Security on all tables in Supabase...');

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`✔ RLS Enabled on table: ${table}`);
    } catch (err: any) {
      console.error(`✖ Failed to enable RLS on table ${table}:`, err.message);
    }
  }

  await prisma.$disconnect();
  console.log('[RLS] All 14 tables secured with Row Level Security!');
}

enableRLS();
