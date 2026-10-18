import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { computeGrade } from '@/lib/utils';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');
    const termId = searchParams.get('termId');
    const academicYearId = searchParams.get('academicYearId');

    if (!classId || !subjectId) {
      return NextResponse.json(
        { error: 'classId and subjectId are required' },
        { status: 400 }
      );
    }

    // Get active settings if year/term not given
    const settings = await prisma.schoolSettings.findUnique({
      where: { id: 'settings_primary' },
    });
    const finalYearId = academicYearId || settings?.currentAcademicYearId;
    const finalTermId = termId || settings?.currentTermId;

    if (!finalYearId || !finalTermId) {
      return NextResponse.json({ error: 'Active term and year not configured' }, { status: 400 });
    }

    // Fetch enrolled students
    const students = await prisma.student.findMany({
      where: { currentClassId: classId, status: 'ACTIVE' },
      select: { id: true, studentId: true, firstName: true, lastName: true },
      orderBy: { firstName: 'asc' },
    });

    // Fetch existing results
    const existingResults = await prisma.result.findMany({
      where: {
        classId,
        subjectId,
        academicYearId: finalYearId,
        termId: finalTermId,
      },
    });

    const resultMap = new Map();
    existingResults.forEach((r) => resultMap.set(r.studentId, r));

    const sheet = students.map((st) => {
      const res = resultMap.get(st.id);
      return {
        studentId: st.id,
        admissionId: st.studentId,
        studentName: `${st.firstName} ${st.lastName}`,
        classScore: res ? res.classScore : '',
        examScore: res ? res.examScore : '',
        totalScore: res ? res.totalScore : 0,
        grade: res ? res.grade : '—',
        remarks: res ? res.remarks || '' : '',
        resultId: res?.id || null,
      };
    });

    return NextResponse.json({
      sheet,
      academicYearId: finalYearId,
      termId: finalTermId,
    });
  } catch (error: any) {
    console.error('Fetch results error:', error);
    return NextResponse.json({ error: 'Failed to fetch score sheet.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only Admin and Teacher can record results
    if (user.role !== 'ADMIN' && user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { classId, subjectId, academicYearId, termId, records } = body;

    if (!classId || !subjectId || !academicYearId || !termId || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Invalid score payload' }, { status: 400 });
    }

    const settings = await prisma.schoolSettings.findUnique({
      where: { id: 'settings_primary' },
    });

    // Process each student result
    for (const r of records) {
      const classScore = parseFloat(r.classScore) || 0;
      const examScore = parseFloat(r.examScore) || 0;

      // Validate scores
      if (classScore < 0 || classScore > 40) {
        return NextResponse.json(
          { error: `Class score for ${r.studentName} must be between 0 and 40.` },
          { status: 400 }
        );
      }
      if (examScore < 0 || examScore > 70) {
        return NextResponse.json(
          { error: `Exam score for ${r.studentName} must be between 0 and 70.` },
          { status: 400 }
        );
      }

      const totalScore = Math.min(100, Math.round((classScore + examScore) * 10) / 10);
      const { grade, remark } = computeGrade(totalScore, settings?.gradingScheme);
      const finalRemark = r.remarks?.trim() || remark;

      await prisma.result.upsert({
        where: {
          studentId_subjectId_academicYearId_termId: {
            studentId: r.studentId,
            subjectId,
            academicYearId,
            termId,
          },
        },
        update: {
          classId,
          classScore,
          examScore,
          totalScore,
          grade,
          remarks: finalRemark,
          recordedById: user.id,
        },
        create: {
          studentId: r.studentId,
          classId,
          subjectId,
          academicYearId,
          termId,
          classScore,
          examScore,
          totalScore,
          grade,
          remarks: finalRemark,
          recordedById: user.id,
        },
      });

      // Add to StudentHistory
      await prisma.studentHistory.create({
        data: {
          studentId: r.studentId,
          eventType: 'RESULT_RECORDED',
          title: `Result Recorded: Score ${totalScore}% (${grade})`,
          description: `Class score: ${classScore}/30, Exam score: ${examScore}/70. Grade: ${grade} (${finalRemark}).`,
          performedBy: `${user.fullName} (${user.role})`,
        },
      });
    }

    await logAudit({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'UPDATE',
      module: 'Results',
      details: `Saved term examination results for Class ID ${classId}, Subject ID ${subjectId} (${records.length} students).`,
    });

    return NextResponse.json({ success: true, message: 'Results recorded and grades calculated successfully!' });
  } catch (error: any) {
    console.error('Save results error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save results' }, { status: 500 });
  }
}
