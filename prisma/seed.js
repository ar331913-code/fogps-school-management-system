const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Full of Grace Preparatory School Database ---');

  // 1. Settings
  const settings = await prisma.schoolSettings.upsert({
    where: { id: 'settings_primary' },
    update: {},
    create: {
      id: 'settings_primary',
      schoolName: 'FULL OF GRACE PREPARATORY SCHOOL',
      motto: 'Excellence, Discipline and Grace',
      address: 'P.O. Box 123, Spintex Road, Accra, Ghana',
      digitalAddress: 'GR-492-3021',
      phone: '+233 24 412 3456',
      email: 'info@fullofgraceprep.edu.gh',
      website: 'https://fullofgraceprep.edu.gh',
      logoUrl: '/logo.svg',
      idPrefix: 'FOGPS',
      nextIdNumber: 100,
      receiptPrefix: 'REC-2026',
      nextReceiptNumber: 100,
      gradingScheme: 'A1:80-100:Excellent,B2:70-79:Very Good,B3:60-69:Good,C4:55-59:Credit,C5:50-54:Credit,C6:45-49:Pass,D7:40-44:Pass,E8:35-39:Weak Pass,F9:0-34:Fail',
    },
  });
  console.log('✔ School Settings initialized');

  // 2. Academic Year & Terms
  const academicYear = await prisma.academicYear.upsert({
    where: { name: '2025/2026' },
    update: { isCurrent: true },
    create: {
      name: '2025/2026',
      isCurrent: true,
      startDate: new Date('2025-09-08'),
      endDate: new Date('2026-07-24'),
    },
  });

  const term1 = await prisma.term.upsert({
    where: {
      academicYearId_name: {
        academicYearId: academicYear.id,
        name: 'First Term',
      },
    },
    update: {},
    create: {
      name: 'First Term',
      academicYearId: academicYear.id,
      isCurrent: false,
      startDate: new Date('2025-09-08'),
      endDate: new Date('2025-12-18'),
    },
  });

  const term2 = await prisma.term.upsert({
    where: {
      academicYearId_name: {
        academicYearId: academicYear.id,
        name: 'Second Term',
      },
    },
    update: { isCurrent: true },
    create: {
      name: 'Second Term',
      academicYearId: academicYear.id,
      isCurrent: true,
      startDate: new Date('2026-01-12'),
      endDate: new Date('2026-04-10'),
    },
  });

  const term3 = await prisma.term.upsert({
    where: {
      academicYearId_name: {
        academicYearId: academicYear.id,
        name: 'Third Term',
      },
    },
    update: {},
    create: {
      name: 'Third Term',
      academicYearId: academicYear.id,
      isCurrent: false,
      startDate: new Date('2026-05-04'),
      endDate: new Date('2026-07-24'),
    },
  });

  // Update Settings with active year & term
  await prisma.schoolSettings.update({
    where: { id: 'settings_primary' },
    data: {
      currentAcademicYearId: academicYear.id,
      currentTermId: term2.id,
    },
  });
  console.log('✔ Academic Year (2025/2026) and Terms created');

  // 3. Classes
  const classList = [
    { name: 'Creche', category: 'Nursery', capacity: 25 },
    { name: 'Nursery 1', category: 'Nursery', capacity: 30 },
    { name: 'Nursery 2', category: 'Nursery', capacity: 30 },
    { name: 'KG 1', category: 'KG', capacity: 35 },
    { name: 'KG 2', category: 'KG', capacity: 35 },
    { name: 'Primary 1', category: 'Primary', capacity: 40 },
    { name: 'Primary 2', category: 'Primary', capacity: 40 },
    { name: 'Primary 3', category: 'Primary', capacity: 40 },
    { name: 'Primary 4', category: 'Primary', capacity: 40 },
    { name: 'Primary 5', category: 'Primary', capacity: 40 },
    { name: 'Primary 6', category: 'Primary', capacity: 40 },
    { name: 'JHS 1', category: 'JHS', capacity: 45 },
    { name: 'JHS 2', category: 'JHS', capacity: 45 },
    { name: 'JHS 3', category: 'JHS', capacity: 45 },
  ];

  const createdClasses = {};
  for (const c of classList) {
    const cls = await prisma.class.upsert({
      where: { name: c.name },
      update: { category: c.category, capacity: c.capacity },
      create: c,
    });
    createdClasses[c.name] = cls;
  }
  console.log('✔ Classes created (Creche to JHS 3)');

  // 4. Subjects
  const subjectList = [
    { name: 'English Language', code: 'ENG', isCore: true, description: 'Grammar, Composition, Reading and Comprehension' },
    { name: 'Mathematics', code: 'MATH', isCore: true, description: 'Core and Practical Mathematics' },
    { name: 'Integrated Science', code: 'SCI', isCore: true, description: 'Natural and Applied Sciences' },
    { name: 'Social Studies', code: 'SOC', isCore: true, description: 'Citizenship and Social Environment' },
    { name: 'Computing / ICT', code: 'ICT', isCore: true, description: 'Information & Communications Technology' },
    { name: 'Religious & Moral Education', code: 'RME', isCore: true, description: 'Values, Ethics and Religion' },
    { name: 'Creative Arts & Design', code: 'CAD', isCore: false, description: 'Visual arts, Drawing, Music & Dance' },
    { name: 'Ghanaian Language (Twi)', code: 'GHA', isCore: false, description: 'Local Language Studies' },
    { name: 'French', code: 'FRE', isCore: false, description: 'French Language Communication' },
    { name: 'Physical & Health Education', code: 'PHE', isCore: false, description: 'Sports and Health Education' },
  ];

  const createdSubjects = {};
  for (const s of subjectList) {
    const subj = await prisma.subject.upsert({
      where: { code: s.code },
      update: { name: s.name, isCore: s.isCore, description: s.description },
      create: s,
    });
    createdSubjects[s.code] = subj;
  }
  console.log('✔ Subjects created');

  // Link subjects to classes
  for (const cls of Object.values(createdClasses)) {
    for (const subj of Object.values(createdSubjects)) {
      await prisma.classSubject.upsert({
        where: {
          classId_subjectId: {
            classId: cls.id,
            subjectId: subj.id,
          },
        },
        update: {},
        create: {
          classId: cls.id,
          subjectId: subj.id,
        },
      });
    }
  }

  // 5. User Accounts for all 4 roles
  const passwordAdmin = await bcrypt.hash('admin123', 10);
  const passwordTeacher = await bcrypt.hash('teacher123', 10);
  const passwordAccountant = await bcrypt.hash('accountant123', 10);
  const passwordReceptionist = await bcrypt.hash('receptionist123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: passwordAdmin, role: 'ADMIN', fullName: 'Headmaster / Administrator' },
    create: {
      username: 'admin',
      email: 'admin@fullofgraceprep.edu.gh',
      passwordHash: passwordAdmin,
      fullName: 'Headmaster / Administrator',
      phone: '+233 24 111 2233',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { username: 'teacher' },
    update: { passwordHash: passwordTeacher, role: 'TEACHER', fullName: 'Mr. Samuel Mensah (Class Teacher)', teacherClassId: createdClasses['Primary 4'].id },
    create: {
      username: 'teacher',
      email: 'teacher@fullofgraceprep.edu.gh',
      passwordHash: passwordTeacher,
      fullName: 'Mr. Samuel Mensah (Class Teacher)',
      phone: '+233 24 222 3344',
      role: 'TEACHER',
      isActive: true,
      teacherClassId: createdClasses['Primary 4'].id,
    },
  });

  const accountant = await prisma.user.upsert({
    where: { username: 'accountant' },
    update: { passwordHash: passwordAccountant, role: 'ACCOUNTANT', fullName: 'Mrs. Grace Osei (Bursar/Accountant)' },
    create: {
      username: 'accountant',
      email: 'bursar@fullofgraceprep.edu.gh',
      passwordHash: passwordAccountant,
      fullName: 'Mrs. Grace Osei (Bursar/Accountant)',
      phone: '+233 24 333 4455',
      role: 'ACCOUNTANT',
      isActive: true,
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { username: 'receptionist' },
    update: { passwordHash: passwordReceptionist, role: 'RECEPTIONIST', fullName: 'Ms. Abigail Darko (Admissions/Front Desk)' },
    create: {
      username: 'receptionist',
      email: 'frontdesk@fullofgraceprep.edu.gh',
      passwordHash: passwordReceptionist,
      fullName: 'Ms. Abigail Darko (Admissions/Front Desk)',
      phone: '+233 24 444 5566',
      role: 'RECEPTIONIST',
      isActive: true,
    },
  });
  console.log('✔ User accounts created: admin, teacher, accountant, receptionist');

  // 6. Fee Structures
  const feeTuition = await prisma.feeStructure.upsert({
    where: {
      name_classId_academicYearId_termId: {
        name: 'School Tuition Fee',
        classId: createdClasses['Primary 4'].id,
        academicYearId: academicYear.id,
        termId: term2.id,
      },
    },
    update: { amount: 1200 },
    create: {
      name: 'School Tuition Fee',
      classId: createdClasses['Primary 4'].id,
      academicYearId: academicYear.id,
      termId: term2.id,
      amount: 1200,
    },
  });

  const feePTA = await prisma.feeStructure.upsert({
    where: {
      name_classId_academicYearId_termId: {
        name: 'PTA & Development Levy',
        classId: createdClasses['Primary 4'].id,
        academicYearId: academicYear.id,
        termId: term2.id,
      },
    },
    update: { amount: 150 },
    create: {
      name: 'PTA & Development Levy',
      classId: createdClasses['Primary 4'].id,
      academicYearId: academicYear.id,
      termId: term2.id,
      amount: 150,
    },
  });

  const feeICT = await prisma.feeStructure.upsert({
    where: {
      name_classId_academicYearId_termId: {
        name: 'ICT / Lab Fee',
        classId: createdClasses['Primary 4'].id,
        academicYearId: academicYear.id,
        termId: term2.id,
      },
    },
    update: { amount: 100 },
    create: {
      name: 'ICT / Lab Fee',
      classId: createdClasses['Primary 4'].id,
      academicYearId: academicYear.id,
      termId: term2.id,
      amount: 100,
    },
  });
  console.log('✔ Fee Structures created for Primary 4');

  // 7. Seed Sample Student with Full 360 Records
  const student1 = await prisma.student.upsert({
    where: { studentId: 'FOGPS-2026-0001' },
    update: {},
    create: {
      studentId: 'FOGPS-2026-0001',
      firstName: 'Emmanuel',
      middleName: 'Kofi',
      lastName: 'Agyemang',
      dateOfBirth: new Date('2015-05-14'),
      gender: 'Male',
      nationality: 'Ghanaian',
      religion: 'Christian',
      residentialAddress: 'House No. 42, Spintex Close, Accra',
      digitalAddress: 'GR-492-8812',
      phone: '+233 50 123 4567',
      email: 'emmanuel.agyemang@gmail.com',
      previousSchool: 'Grace International School',
      admissionDate: new Date('2024-09-10'),
      admissionClassId: createdClasses['Primary 3'].id,
      currentClassId: createdClasses['Primary 4'].id,
      academicYearId: academicYear.id,
      status: 'ACTIVE',
      house: 'Grace House (Blue)',
      studentCategory: 'Day',
      emergencyContactName: 'Dr. Joseph Agyemang',
      emergencyContactPhone: '+233 24 555 6789',
      bloodGroup: 'O+',
      knownAllergies: 'Peanuts',
      medicalConditions: 'Mild Asthma (Uses Inhaler)',
      specialMedicalNotes: 'Inhaler kept with class teacher.',
    },
  });

  // Parent 1 (Father)
  const parent1 = await prisma.parentGuardian.create({
    data: {
      fullName: 'Dr. Joseph Agyemang',
      relationship: 'Father',
      phone: '+233 24 555 6789',
      alternativePhone: '+233 20 888 1234',
      email: 'joseph.agyemang@health.gov.gh',
      occupation: 'Medical Doctor',
      residentialAddress: 'House No. 42, Spintex Close, Accra',
      digitalAddress: 'GR-492-8812',
      isEmergencyContact: true,
    },
  });

  // Parent 2 (Mother)
  const parent2 = await prisma.parentGuardian.create({
    data: {
      fullName: 'Mrs. Deborah Agyemang',
      relationship: 'Mother',
      phone: '+233 24 777 8899',
      email: 'deborah.agyemang@bank.com.gh',
      occupation: 'Chartered Accountant',
      residentialAddress: 'House No. 42, Spintex Close, Accra',
      digitalAddress: 'GR-492-8812',
      isEmergencyContact: true,
    },
  });

  // Link Parents
  await prisma.studentParent.createMany({
    data: [
      { studentId: student1.id, parentId: parent1.id, isPrimary: true },
      { studentId: student1.id, parentId: parent2.id, isPrimary: false },
    ],
  });

  // Attendance Records for student1
  const todayStr = new Date().toISOString().split('T')[0];
  await prisma.attendance.upsert({
    where: { studentId_date: { studentId: student1.id, date: todayStr } },
    update: {},
    create: {
      studentId: student1.id,
      classId: createdClasses['Primary 4'].id,
      date: todayStr,
      status: 'PRESENT',
      academicYearId: academicYear.id,
      termId: term2.id,
      remarks: 'Prompt and attentive',
    },
  });

  // Results for student1
  await prisma.result.upsert({
    where: {
      studentId_subjectId_academicYearId_termId: {
        studentId: student1.id,
        subjectId: createdSubjects['ENG'].id,
        academicYearId: academicYear.id,
        termId: term2.id,
      },
    },
    update: {},
    create: {
      studentId: student1.id,
      classId: createdClasses['Primary 4'].id,
      subjectId: createdSubjects['ENG'].id,
      academicYearId: academicYear.id,
      termId: term2.id,
      classScore: 28, // /30
      examScore: 62, // /70
      totalScore: 90,
      grade: 'A1',
      remarks: 'Excellent mastery of language and vocabulary',
      position: 1,
    },
  });

  await prisma.result.upsert({
    where: {
      studentId_subjectId_academicYearId_termId: {
        studentId: student1.id,
        subjectId: createdSubjects['MATH'].id,
        academicYearId: academicYear.id,
        termId: term2.id,
      },
    },
    update: {},
    create: {
      studentId: student1.id,
      classId: createdClasses['Primary 4'].id,
      subjectId: createdSubjects['MATH'].id,
      academicYearId: academicYear.id,
      termId: term2.id,
      classScore: 27,
      examScore: 65,
      totalScore: 92,
      grade: 'A1',
      remarks: 'Exceptional problem-solving skills',
      position: 1,
    },
  });

  await prisma.result.upsert({
    where: {
      studentId_subjectId_academicYearId_termId: {
        studentId: student1.id,
        subjectId: createdSubjects['SCI'].id,
        academicYearId: academicYear.id,
        termId: term2.id,
      },
    },
    update: {},
    create: {
      studentId: student1.id,
      classId: createdClasses['Primary 4'].id,
      subjectId: createdSubjects['SCI'].id,
      academicYearId: academicYear.id,
      termId: term2.id,
      classScore: 26,
      examScore: 58,
      totalScore: 84,
      grade: 'A1',
      remarks: 'Very enthusiastic during experiments',
      position: 2,
    },
  });

  // Fee Payments for student1
  await prisma.feePayment.create({
    data: {
      receiptNumber: 'REC-2026-0001',
      studentId: student1.id,
      feeStructureId: feeTuition.id,
      amountPaid: 1000,
      paymentMethod: 'MOMO',
      reference: 'MNT-88293019',
      description: 'Part payment for Term 2 Tuition',
      recordedById: accountant.id,
      recordedByName: accountant.fullName,
    },
  });

  // Student Document
  await prisma.studentDocument.create({
    data: {
      studentId: student1.id,
      title: 'Birth Certificate',
      documentType: 'BIRTH_CERTIFICATE',
      fileUrl: '/sample-birth-cert.pdf',
      fileSize: '450 KB',
    },
  });

  // Student History
  await prisma.studentHistory.createMany({
    data: [
      {
        studentId: student1.id,
        eventType: 'ADMISSION',
        title: 'Admitted to Full of Grace Prep',
        description: 'Successfully admitted into Primary 3 upon passing entrance assessment.',
        performedBy: receptionist.fullName,
      },
      {
        studentId: student1.id,
        eventType: 'CLASS_PROMOTION',
        title: 'Promoted to Primary 4',
        description: 'Promoted from Primary 3 to Primary 4 after achieving Overall Average of 88%.',
        performedBy: admin.fullName,
      },
      {
        studentId: student1.id,
        eventType: 'PAYMENT_RECORDED',
        title: 'Payment of GHS 1,000.00 Recorded',
        description: 'Received part payment for Term 2 Tuition via Mobile Money (Ref: MNT-88293019).',
        performedBy: accountant.fullName,
      },
    ],
  });

  // Audit Log Entry
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      userName: admin.fullName,
      userRole: 'ADMIN',
      action: 'SYSTEM_SEED',
      module: 'Settings',
      details: 'Initial system initialization and database seeding completed.',
    },
  });

  console.log('✔ Sample student profile with full 360 records seeded (ID: FOGPS-2026-0001)');
  console.log('\n--- Seeding Complete Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
