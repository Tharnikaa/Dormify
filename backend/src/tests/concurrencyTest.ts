import { AllocationService } from '../services/allocationService';
import { prisma } from '../config/db';

async function runConcurrencyTest() {
  console.log('------------------------------------------------------------');
  console.log('[CONCURRENCY TEST] Starting Simultaneous Bed Allocation Test...');
  console.log('------------------------------------------------------------');

  try {
    // 1. Fetch target Academic Year
    const activeYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
    if (!activeYear) throw new Error('No active academic year');

    // 2. Fetch test students (Priya Sharma & Marcus Vance)
    const student1 = await prisma.studentProfile.findFirst({ where: { rollNumber: 'STU2026002' } });
    const student2 = await prisma.studentProfile.findFirst({ where: { rollNumber: 'STU2026003' } });

    if (!student1 || !student2) throw new Error('Test students missing from seed data');

    // Make sure both have FEE_VERIFIED app status for test
    await prisma.application.updateMany({
      where: { id: { in: [student1.id, student2.id] } },
      data: { status: 'FEE_VERIFIED' },
    });

    // 3. Find an AVAILABLE target bed (e.g. Bed B in Room A-101)
    const targetRoom = await prisma.room.findFirst({ where: { roomNumber: 'A-101' } });
    if (!targetRoom) throw new Error('Target room A-101 missing');

    const targetBed = await prisma.bed.findFirst({
      where: { roomId: targetRoom.id, bedNumber: 'B', status: 'AVAILABLE' },
    });
    if (!targetBed) throw new Error('Target Bed B missing or not available');

    console.log(`Targeting Bed ${targetBed.bedNumber} (ID: ${targetBed.id}) in Room A-101...`);
    console.log(`Simulating simultaneous allocation requests from Student 1 (${student1.rollNumber}) & Student 2 (${student2.rollNumber})...`);

    // Execute concurrent allocation calls simultaneously using Promise.allSettled
    const [res1, res2] = await Promise.allSettled([
      AllocationService.allocateBed({
        userId: student1.userId,
        studentId: student1.id,
        bedId: targetBed.id,
      }),
      AllocationService.allocateBed({
        userId: student2.userId,
        studentId: student2.id,
        bedId: targetBed.id,
      }),
    ]);

    console.log('\n[TEST RESULTS]:');
    let successCount = 0;
    let conflictCount = 0;

    if (res1.status === 'fulfilled') {
      console.log(`  ✓ Request 1 (Student 1) SUCCEEDED: Allocation ID ${res1.value.id}`);
      successCount++;
    } else {
      console.log(`  ✕ Request 1 (Student 1) FAILED: Code ${res1.reason.statusCode} - "${res1.reason.message}"`);
      if (res1.reason.statusCode === 409) conflictCount++;
    }

    if (res2.status === 'fulfilled') {
      console.log(`  ✓ Request 2 (Student 2) SUCCEEDED: Allocation ID ${res2.value.id}`);
      successCount++;
    } else {
      console.log(`  ✕ Request 2 (Student 2) FAILED: Code ${res2.reason.statusCode} - "${res2.reason.message}"`);
      if (res2.reason.statusCode === 409) conflictCount++;
    }

    console.log('------------------------------------------------------------');
    if (successCount === 1 && conflictCount === 1) {
      console.log('SUCCESS: Atomic Concurrency Protection Verified!');
      console.log('  - Exactly 1 allocation succeeded');
      console.log('  - Exactly 1 request rejected with 409 Conflict');
    } else {
      console.error(`FAILED: Expected 1 success and 1 conflict, got ${successCount} success and ${conflictCount} conflicts.`);
    }
    console.log('------------------------------------------------------------');
  } catch (err) {
    console.error('[CONCURRENCY TEST ERROR]:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runConcurrencyTest();
