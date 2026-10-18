import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const student = await prisma.student.findFirst({
      where: {
        OR: [{ id: id }, { studentId: id }],
      },
      include: {
        admissionClass: true,
        currentClass: {
          include: {
            feeStructures: true,
          },
        },
        academicYear: true,
        parents: {
          include: {
            parent: true,
          },
        },
        attendances: {
          orderBy: { date: 'desc' },
          include: {
            class: true,
          },
        },
        results: {
          orderBy: { createdAt: 'desc' },
          include: {
            subject: true,
            academicYear: true,
            term: true,
          },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          include: {
            feeStructure: true,
          },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        history: {
          orderBy: { createdAt: 'desc' },
        },
        disciplineRecords: {
          orderBy: { incidentDate: 'desc' },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Calculate fee balances
    const classFees = student.currentClass.feeStructures.reduce(
      (sum, f) => sum + f.amount,
      0
    );
    const totalPaid = student.payments.reduce(
      (sum, p) => sum + p.amountPaid,
      0
    );
    const outstandingBalance = Math.max(0, classFees - totalPaid);

    // Calculate attendance statistics
    const totalAttendanceDays = student.attendances.length;
    const presentCount = student.attendances.filter(
      (a) => a.status === 'PRESENT'
    ).length;
    const lateCount = student.attendances.filter(
      (a) => a.status === 'LATE'
    ).length;
    const absentCount = student.attendances.filter(
      (a) => a.status === 'ABSENT'
    ).length;
    const excusedCount = student.attendances.filter(
      (a) => a.status === 'EXCUSED'
    ).length;

    const attendanceRate =
      totalAttendanceDays > 0
        ? Math.round(((presentCount + lateCount) / totalAttendanceDays) * 100)
        : 100;

    return NextResponse.json({
      student,
      financials: {
        totalFees: classFees,
        totalPaid,
        outstandingBalance,
      },
      attendanceStats: {
        totalDays: totalAttendanceDays,
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        excused: excusedCount,
        rate: attendanceRate,
      },
    });
  } catch (error: any) {
    console.error('Fetch student 360 error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student details.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Admin and Receptionist can edit student details
    if (user.role !== 'ADMIN' && user.role !== 'RECEPTIONIST') {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to edit student records.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const existingStudent = await prisma.student.findFirst({
      where: { OR: [{ id }, { studentId: id }] },
      include: { currentClass: true },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

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
      currentClassId,
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
    } = body;

    // Detect significant changes for history log
    const changes: string[] = [];
    if (currentClassId && currentClassId !== existingStudent.currentClassId) {
      const newClass = await prisma.class.findUnique({ where: { id: currentClassId } });
      changes.push(`Class changed from "${existingStudent.currentClass.name}" to "${newClass?.name || currentClassId}"`);
    }
    if (status && status !== existingStudent.status) {
      changes.push(`Status changed from "${existingStudent.status}" to "${status}"`);
    }
    if (phone && phone !== existingStudent.phone) {
      changes.push(`Phone updated to ${phone}`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const st = await tx.student.update({
        where: { id: existingStudent.id },
        data: {
          firstName: firstName ?? existingStudent.firstName,
          middleName: middleName !== undefined ? middleName : existingStudent.middleName,
          lastName: lastName ?? existingStudent.lastName,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : existingStudent.dateOfBirth,
          gender: gender ?? existingStudent.gender,
          nationality: nationality ?? existingStudent.nationality,
          religion: religion !== undefined ? religion : existingStudent.religion,
          residentialAddress: residentialAddress ?? existingStudent.residentialAddress,
          digitalAddress: digitalAddress !== undefined ? digitalAddress : existingStudent.digitalAddress,
          phone: phone !== undefined ? phone : existingStudent.phone,
          email: email !== undefined ? email : existingStudent.email,
          previousSchool: previousSchool !== undefined ? previousSchool : existingStudent.previousSchool,
          currentClassId: currentClassId ?? existingStudent.currentClassId,
          status: status ?? existingStudent.status,
          photoUrl: photoUrl !== undefined ? photoUrl : existingStudent.photoUrl,
          house: house !== undefined ? house : existingStudent.house,
          studentCategory: studentCategory ?? existingStudent.studentCategory,
          emergencyContactName: emergencyContactName !== undefined ? emergencyContactName : existingStudent.emergencyContactName,
          emergencyContactPhone: emergencyContactPhone !== undefined ? emergencyContactPhone : existingStudent.emergencyContactPhone,
          bloodGroup: bloodGroup !== undefined ? bloodGroup : existingStudent.bloodGroup,
          knownAllergies: knownAllergies !== undefined ? knownAllergies : existingStudent.knownAllergies,
          medicalConditions: medicalConditions !== undefined ? medicalConditions : existingStudent.medicalConditions,
          specialMedicalNotes: specialMedicalNotes !== undefined ? specialMedicalNotes : existingStudent.specialMedicalNotes,
        },
      });

      if (changes.length > 0) {
        await tx.studentHistory.create({
          data: {
            studentId: st.id,
            eventType: 'PROFILE_UPDATED',
            title: 'Profile Updated',
            description: `Updates made: ${changes.join('; ')}.`,
            performedBy: `${user.fullName} (${user.role})`,
          },
        });
      }

      return st;
    });

    await logAudit({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'UPDATE',
      module: 'Students',
      recordId: updated.id,
      details: `Updated profile for ${updated.firstName} ${updated.lastName} (${updated.studentId}). Changes: ${changes.join(', ') || 'General profile info'}`,
    });

    return NextResponse.json({ success: true, student: updated });
  } catch (error: any) {
    console.error('Update student error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update student.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only Administrator can delete or archive student records.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    const student = await prisma.student.findFirst({
      where: { OR: [{ id }, { studentId: id }] },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    if (!permanent) {
      // Soft-archive / status update to WITHDRAWN
      await prisma.student.update({
        where: { id: student.id },
        data: { status: 'WITHDRAWN' },
      });

      await prisma.studentHistory.create({
        data: {
          studentId: student.id,
          eventType: 'STATUS_CHANGE',
          title: 'Student Status Changed to Withdrawn',
          description: 'Student record archived and status set to WITHDRAWN.',
          performedBy: `${user.fullName} (${user.role})`,
        },
      });

      await logAudit({
        userId: user.id,
        userName: user.fullName,
        userRole: user.role,
        action: 'UPDATE',
        module: 'Students',
        recordId: student.id,
        details: `Archived student ${student.firstName} ${student.lastName} (Status -> WITHDRAWN).`,
      });

      return NextResponse.json({
        success: true,
        message: 'Student archived successfully.',
      });
    }

    // Permanent Deletion
    await prisma.student.delete({
      where: { id: student.id },
    });

    await logAudit({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'DELETE',
      module: 'Students',
      recordId: student.id,
      details: `Permanently deleted student ${student.firstName} ${student.lastName} (${student.studentId}) and all cascade records.`,
    });

    return NextResponse.json({
      success: true,
      message: 'Student permanently deleted.',
    });
  } catch (error: any) {
    console.error('Delete student error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete student.' },
      { status: 500 }
    );
  }
}
