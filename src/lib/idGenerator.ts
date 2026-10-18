import { prisma } from './prisma';

export async function generateNextStudentId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  return await prisma.$transaction(async (tx) => {
    let settings = await tx.schoolSettings.findUnique({
      where: { id: 'settings_primary' },
    });

    if (!settings) {
      settings = await tx.schoolSettings.create({
        data: {
          id: 'settings_primary',
          schoolName: 'FULL OF GRACE PREPARATORY SCHOOL',
        },
      });
    }

    const prefix = settings.idPrefix || 'FOGPS';
    let sequence = settings.nextIdNumber;

    // Check if there are existing students with this or higher sequence to prevent duplicate IDs
    let candidateId = `${prefix}-${currentYear}-${String(sequence).padStart(4, '0')}`;
    let exists = await tx.student.findUnique({ where: { studentId: candidateId } });

    while (exists) {
      sequence++;
      candidateId = `${prefix}-${currentYear}-${String(sequence).padStart(4, '0')}`;
      exists = await tx.student.findUnique({ where: { studentId: candidateId } });
    }

    // Update settings with the next counter
    await tx.schoolSettings.update({
      where: { id: 'settings_primary' },
      data: { nextIdNumber: sequence + 1 },
    });

    return candidateId;
  });
}

export async function generateNextReceiptNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();

  return await prisma.$transaction(async (tx) => {
    let settings = await tx.schoolSettings.findUnique({
      where: { id: 'settings_primary' },
    });

    if (!settings) {
      settings = await tx.schoolSettings.create({
        data: {
          id: 'settings_primary',
          schoolName: 'FULL OF GRACE PREPARATORY SCHOOL',
        },
      });
    }

    const prefix = settings.receiptPrefix || `REC-${currentYear}`;
    let sequence = settings.nextReceiptNumber;

    let candidateReceipt = `${prefix}-${String(sequence).padStart(4, '0')}`;
    let exists = await tx.feePayment.findUnique({ where: { receiptNumber: candidateReceipt } });

    while (exists) {
      sequence++;
      candidateReceipt = `${prefix}-${String(sequence).padStart(4, '0')}`;
      exists = await tx.feePayment.findUnique({ where: { receiptNumber: candidateReceipt } });
    }

    await tx.schoolSettings.update({
      where: { id: 'settings_primary' },
      data: { nextReceiptNumber: sequence + 1 },
    });

    return candidateReceipt;
  });
}
