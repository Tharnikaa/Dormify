import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAllUsers() {
  console.log('[Database Cleanup] Deleting all users and user-related records...');

  try {
    // 1. Delete dependent records first to maintain relational integrity
    const deletedAllocations = await prisma.allocation.deleteMany({});
    console.log(`- Deleted ${deletedAllocations.count} allocations.`);

    const deletedReceipts = await prisma.feeReceipt.deleteMany({});
    console.log(`- Deleted ${deletedReceipts.count} fee receipts.`);

    const deletedApplications = await prisma.application.deleteMany({});
    console.log(`- Deleted ${deletedApplications.count} applications.`);

    const deletedNotifications = await prisma.notification.deleteMany({});
    console.log(`- Deleted ${deletedNotifications.count} notifications.`);

    const deletedAuditLogs = await prisma.auditLog.deleteMany({});
    console.log(`- Deleted ${deletedAuditLogs.count} audit logs.`);

    const deletedStudentProfiles = await prisma.studentProfile.deleteMany({});
    console.log(`- Deleted ${deletedStudentProfiles.count} student profiles.`);

    const deletedAdminProfiles = await prisma.adminProfile.deleteMany({});
    console.log(`- Deleted ${deletedAdminProfiles.count} admin profiles.`);

    // Reset bed statuses to AVAILABLE
    await prisma.bed.updateMany({
      where: { status: 'OCCUPIED' },
      data: { status: 'AVAILABLE' },
    });

    // Reset room statuses to AVAILABLE (except MAINTENANCE / RESERVED)
    await prisma.room.updateMany({
      where: { status: 'FULL' },
      data: { status: 'AVAILABLE' },
    });
    await prisma.room.updateMany({
      where: { status: 'PARTIALLY_OCCUPIED' },
      data: { status: 'AVAILABLE' },
    });

    // Finally delete all User accounts
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`- Deleted ${deletedUsers.count} user accounts.`);

    console.log('------------------------------------------------------------');
    console.log('SUCCESS: All users and user-related records removed from the database!');
    console.log('------------------------------------------------------------');
  } catch (err) {
    console.error('[Cleanup Error]:', err);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllUsers();
