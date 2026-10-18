import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, ROLE_PERMISSIONS } from '@/lib/auth';
import { generateNextStudentId } from '@/lib/idGenerator';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const classId = searchParams.get('classId') || '';
    const gender = searchParams.get('gender') || '';
    const status = searchParams.get('status') || '';
    const academicYearId = searchParams.get('academicYearId') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (classId) {
      whereClause.currentClassId = classId;
    }

    if (gender) {
      whereClause.gender = gender;
    }

    if (status) {
      whereClause.status = status;
    }

    if (academicYearId) {
      whereClause.academicYearId = academicYearId;
    }

    if (search) {
      whereClause.OR = [
        { studentId: { contains: search } },
        { firstName: { contains: search } },
        { middleName: { contains: search } },
        { lastName: { contains: search } },
        { phone: { contains: search } },
        {
          parents: {
            some: {
              parent: {
                OR: [
                  { fullName: { contains: search } },
                  { phone: { contains: search } },
                ],
              },
            },
          },
        },
        {
          currentClass: {
            name: { contains: search },
          },
        },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where: whereClause }),
      prisma.student.findMany({
        where: whereClause,
        include: {
          currentClass: true,
          parents: {
            include: {
              parent: true,
            },
          },
          payments: {
            select: { amountPaid: true },
          },
          _count: {
            select: {
              attendances: true,
              results: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch students error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Only ADMIN and RECEPTIONIST can register students
    if (user.role !== 'ADMIN' && user.role !== 'RECEPTIONIST') {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to register students.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      gender,
      nationality,
      religion,
      residentialAddress,
      digitalAddress,
      phone,
      email,
      previousSchool,
      admissionDate,
      admissionClassId,
      currentClassId,
      academicYearId,
      status,
      photoUrl,
      house,
      studentCategory,
      emergencyContactName,
      emergencyContactPhone,
      bloodGroup,
      knownAllergies,
      medicalConditions,
      specialMedicalNotes,
      customStudentId,
      parents, // array of parent objects
    } = body;

    if (!firstName || !lastName || !dateOfBirth || !gender || !currentClassId) {
      return NextResponse.json(
        { error: 'Please fill in all mandatory student personal and class information.' },
        { status: 400 }
      );
    }

    // Generate or use custom Student ID
    let finalStudentId = customStudentId?.trim();
    if (!finalStudentId) {
      finalStudentId = await generateNextStudentId();
    } else {
      const exists = await prisma.student.findUnique({
        where: { studentId: finalStudentId },
      });
      if (exists) {
        return NextResponse.json(
          { error: `Student ID "${finalStudentId}" already exists. Please provide a unique ID.` },
          { status: 400 }
        );
      }
    }

    // Get active academic year if not supplied
    let yearId = academicYearId;
    if (!yearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { isCurrent: true },
      });
      yearId = activeYear?.id;
    }

    // Perform atomic creation
    const newStudent = await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          studentId: finalStudentId,
          firstName: firstName.trim(),
          middleName: middleName?.trim() || null,
          lastName: lastName.trim(),
          dateOfBirth: new Date(dateOfBirth),
          gender,
          nationality: nationality?.trim() || 'Ghanaian',
          religion: religion?.trim() || null,
          residentialAddress: residentialAddress?.trim() || 'Accra, Ghana',
          digitalAddress: digitalAddress?.trim() || null,
          phone: phone?.trim() || null,
          email: email?.trim() || null,
          previousSchool: previousSchool?.trim() || null,
          admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
          admissionClassId: admissionClassId || currentClassId,
          currentClassId,
          academicYearId: yearId || null,
          status: status || 'ACTIVE',
          photoUrl: photoUrl?.trim() || null,
          house: house?.trim() || null,
          studentCategory: studentCategory || 'Day',
          emergencyContactName: emergencyContactName?.trim() || null,
          emergencyContactPhone: emergencyContactPhone?.trim() || null,
          bloodGroup: bloodGroup?.trim() || null,
          knownAllergies: knownAllergies?.trim() || null,
          medicalConditions: medicalConditions?.trim() || null,
          specialMedicalNotes: specialMedicalNotes?.trim() || null,
        },
      });

      // Handle Parent/Guardian creation and linking
      if (Array.isArray(parents) && parents.length > 0) {
        for (let i = 0; i < parents.length; i++) {
          const p = parents[i];
          if (p.fullName && p.phone) {
            const parentRecord = await tx.parentGuardian.create({
              data: {
                fullName: p.fullName.trim(),
                relationship: p.relationship || 'Guardian',
                phone: p.phone.trim(),
                alternativePhone: p.alternativePhone?.trim() || null,
                email: p.email?.trim() || null,
                occupation: p.occupation?.trim() || null,
                residentialAddress: p.residentialAddress?.trim() || null,
                digitalAddress: p.digitalAddress?.trim() || null,
                isEmergencyContact: Boolean(p.isEmergencyContact),
              },
            });

            await tx.studentParent.create({
              data: {
                studentId: student.id,
                parentId: parentRecord.id,
                isPrimary: i === 0 || Boolean(p.isPrimary),
              },
            });
          }
        }
      }

      // Record Admission in Student History
      await tx.studentHistory.create({
        data: {
          studentId: student.id,
          eventType: 'ADMISSION',
          title: 'Student Registered',
          description: `Student successfully registered and assigned to Class ID: ${currentClassId}. Student ID: ${student.studentId}.`,
          performedBy: `${user.fullName} (${user.role})`,
        },
      });

      return student;
    });

    await logAudit({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'CREATE',
      module: 'Students',
      recordId: newStudent.id,
      details: `Registered new student ${newStudent.firstName} ${newStudent.lastName} with ID ${newStudent.studentId}`,
    });

    return NextResponse.json({
      success: true,
      student: newStudent,
    });
  } catch (error: any) {
    console.error('Student registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register student.' },
      { status: 500 }
    );
  }
}
