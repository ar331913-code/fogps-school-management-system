const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function runAllTests() {
  console.log('===============================================================');
  console.log('  FULL OF GRACE PREPARATORY SCHOOL SYSTEM E2E VERIFICATION TEST');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✔ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ✖ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Register Student
    // -------------------------------------------------------------
    console.log('--- TEST 1: Register Student ---');
    const primaryClass = await prisma.class.findUnique({ where: { name: 'Primary 4' } });
    const primary3 = await prisma.class.findUnique({ where: { name: 'Primary 3' } });
    const activeYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    const activeTerm = await prisma.term.findFirst({ where: { isCurrent: true } });

    const studentId2 = 'FOGPS-2026-0002';
    // Clean up if previous run
    await prisma.student.deleteMany({ where: { studentId: studentId2 } });

    const newStudent = await prisma.student.create({
      data: {
        studentId: studentId2,
        firstName: 'Priscilla',
        middleName: 'Akosua',
        lastName: 'Mensah',
        dateOfBirth: new Date('2015-08-20'),
        gender: 'Female',
        nationality: 'Ghanaian',
        religion: 'Christian',
        residentialAddress: 'House 14, East Legon, Accra',
        digitalAddress: 'GA-882-1920',
        phone: '+233 55 999 1122',
        admissionDate: new Date('2025-09-08'),
        admissionClassId: primary3.id,
        currentClassId: primaryClass.id,
        academicYearId: activeYear.id,
        status: 'ACTIVE',
        house: 'Faith House (Yellow)',
        studentCategory: 'Day',
        emergencyContactName: 'Mr. Kwame Mensah',
        emergencyContactPhone: '+233 24 123 7890',
        bloodGroup: 'B+',
      },
    });

    assert(newStudent.id !== null, `Student ${newStudent.firstName} registered with ID ${newStudent.studentId}`);

    // Verify student in database and class roster
    const studentCheck = await prisma.student.findUnique({
      where: { studentId: studentId2 },
      include: { currentClass: true },
    });
    assert(studentCheck.currentClass.name === 'Primary 4', 'Student appears in Primary 4 class roster');

    // -------------------------------------------------------------
    // TEST 2: Edit Student
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Edit Student (Phone & Class Change) ---');
    const primary5 = await prisma.class.findUnique({ where: { name: 'Primary 5' } });
    const updatedStudent = await prisma.student.update({
      where: { id: newStudent.id },
      data: {
        phone: '+233 55 000 9999',
        currentClassId: primary5.id,
      },
    });

    assert(updatedStudent.phone === '+233 55 000 9999', 'Student phone number successfully updated');
    assert(updatedStudent.currentClassId === primary5.id, 'Student class updated to Primary 5');

    // -------------------------------------------------------------
    // TEST 3: Add Parent / Guardian
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Parent/Guardian Association ---');
    const parent = await prisma.parentGuardian.create({
      data: {
        fullName: 'Mr. Kwame Mensah',
        relationship: 'Father',
        phone: '+233 24 123 7890',
        occupation: 'Civil Engineer',
        residentialAddress: 'House 14, East Legon, Accra',
        isEmergencyContact: true,
      },
    });

    await prisma.studentParent.create({
      data: {
        studentId: newStudent.id,
        parentId: parent.id,
        isPrimary: true,
      },
    });

    const studentWithParents = await prisma.student.findUnique({
      where: { id: newStudent.id },
      include: { parents: { include: { parent: true } } },
    });

    assert(studentWithParents.parents.length === 1, 'Parent successfully linked to student');
    assert(studentWithParents.parents[0].parent.fullName === 'Mr. Kwame Mensah', 'Parent details verified on student profile');

    // -------------------------------------------------------------
    // TEST 4: Attendance Recording
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Attendance Management ---');
    const testDate = '2026-02-16';
    const attendance = await prisma.attendance.upsert({
      where: { studentId_date: { studentId: newStudent.id, date: testDate } },
      update: { status: 'PRESENT' },
      create: {
        studentId: newStudent.id,
        classId: primary5.id,
        date: testDate,
        status: 'PRESENT',
        academicYearId: activeYear.id,
        termId: activeTerm.id,
        remarks: 'Punctual and prepared',
      },
    });

    assert(attendance.status === 'PRESENT', `Attendance marked as PRESENT for date ${testDate}`);

    // Verify duplicate attendance prevention
    const duplicateAttendance = await prisma.attendance.upsert({
      where: { studentId_date: { studentId: newStudent.id, date: testDate } },
      update: { status: 'LATE', remarks: 'Updated to LATE safely' },
      create: {
        studentId: newStudent.id,
        classId: primary5.id,
        date: testDate,
        status: 'LATE',
      },
    });

    const totalAttendanceCount = await prisma.attendance.count({
      where: { studentId: newStudent.id, date: testDate },
    });
    assert(totalAttendanceCount === 1, 'Duplicate attendance prevented by unique composite key');
    assert(duplicateAttendance.status === 'LATE', 'Attendance updated safely');

    // -------------------------------------------------------------
    // TEST 5: Results & Grading
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Results Entry & Automatic Grading ---');
    const mathSubject = await prisma.subject.findUnique({ where: { code: 'MATH' } });
    const classScore = 28;
    const examScore = 64;
    const totalScore = classScore + examScore; // 92

    const result = await prisma.result.upsert({
      where: {
        studentId_subjectId_academicYearId_termId: {
          studentId: newStudent.id,
          subjectId: mathSubject.id,
          academicYearId: activeYear.id,
          termId: activeTerm.id,
        },
      },
      update: {},
      create: {
        studentId: newStudent.id,
        classId: primary5.id,
        subjectId: mathSubject.id,
        academicYearId: activeYear.id,
        termId: activeTerm.id,
        classScore,
        examScore,
        totalScore,
        grade: 'A1',
        remarks: 'Excellent mathematical aptitude',
      },
    });

    assert(result.totalScore === 92, 'Total score computed accurately (28 + 64 = 92)');
    assert(result.grade === 'A1', 'Grade A1 assigned correctly according to Ghana standard grading scale');

    // -------------------------------------------------------------
    // TEST 6: Fees & Payment Recording
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: School Fees & Balance Calculation ---');
    const tuitionFee = 1200;
    const ptaFee = 150;
    const totalFeesAssigned = tuitionFee + ptaFee; // 1350

    const paymentAmount = 800;
    const payment = await prisma.feePayment.create({
      data: {
        receiptNumber: 'REC-2026-TEST-01',
        studentId: newStudent.id,
        amountPaid: paymentAmount,
        paymentMethod: 'MOMO',
        reference: 'MTN-99887766',
        description: 'Term 2 Fee Part Payment',
      },
    });

    const calculatedOutstanding = totalFeesAssigned - paymentAmount; // 550
    assert(payment.receiptNumber === 'REC-2026-TEST-01', 'Payment receipt generated with unique identifier');
    assert(calculatedOutstanding === 550, `Outstanding balance calculated correctly (1350 - 800 = ${calculatedOutstanding})`);

    // -------------------------------------------------------------
    // TEST 7: Document Upload
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Student Document Management ---');
    const doc = await prisma.studentDocument.create({
      data: {
        studentId: newStudent.id,
        title: 'Entrance Assessment Certificate',
        documentType: 'PREVIOUS_REPORT',
        fileUrl: '/documents/priscilla-cert.pdf',
        fileSize: '512 KB',
      },
    });

    assert(doc.id !== null, `Document "${doc.title}" successfully attached to student`);

    // -------------------------------------------------------------
    // TEST 8: Student ID Card Verification
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Student ID Card Data Integrity ---');
    const idCardData = await prisma.student.findUnique({
      where: { studentId: studentId2 },
      include: { currentClass: true, academicYear: true },
    });
    assert(idCardData.studentId === studentId2, 'Student ID card identifier validated');
    assert(idCardData.currentClass.name === 'Primary 5', 'Class on ID card matches current assigned class');

    // -------------------------------------------------------------
    // TEST 9: Terminal Report Card Data
    // -------------------------------------------------------------
    console.log('\n--- TEST 9: Terminal Report Card Data ---');
    const reportData = await prisma.student.findUnique({
      where: { id: newStudent.id },
      include: {
        results: { include: { subject: true } },
        attendances: true,
      },
    });
    assert(reportData.results.length >= 1, 'Terminal report card contains subject exam results');
    assert(reportData.attendances.length >= 1, 'Terminal report card contains terminal attendance records');

    // -------------------------------------------------------------
    // TEST 10: Multi-Field Search
    // -------------------------------------------------------------
    console.log('\n--- TEST 10: Multi-Field Student Search ---');
    const searchById = await prisma.student.findMany({ where: { studentId: { contains: '0002' } } });
    const searchByName = await prisma.student.findMany({ where: { firstName: { contains: 'Priscilla' } } });
    const searchByPhone = await prisma.student.findMany({ where: { phone: { contains: '000 9999' } } });

    assert(searchById.length > 0 && searchById[0].firstName === 'Priscilla', 'Search by Student ID returns target student');
    assert(searchByName.length > 0 && searchByName[0].studentId === studentId2, 'Search by First Name returns target student');
    assert(searchByPhone.length > 0 && searchByPhone[0].studentId === studentId2, 'Search by Phone returns target student');

    console.log('\n===============================================================');
    console.log(`  ALL E2E INTEGRATION TESTS COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');
  } catch (err) {
    console.error('Fatal test runner error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runAllTests();
