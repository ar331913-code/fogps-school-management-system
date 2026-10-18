import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "GH₵ 0.00";
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount).replace("GHS", "GH₵");
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function calculateAge(dob: string | Date | null | undefined): string {
  if (!dob) return "N/A";
  const birthDate = typeof dob === "string" ? new Date(dob) : dob;
  if (isNaN(birthDate.getTime())) return "N/A";
  
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    years--;
  }
  return `${years} yrs`;
}

export interface GradeResult {
  grade: string;
  remark: string;
}

export function computeGrade(score: number, gradingSchemeStr?: string): GradeResult {
  // Default Scheme: A1:80-100:Excellent,B2:70-79:Very Good,B3:60-69:Good,C4:55-59:Credit,C5:50-54:Credit,C6:45-49:Pass,D7:40-44:Pass,E8:35-39:Weak Pass,F9:0-34:Fail
  const defaultScheme = [
    { grade: 'A1', min: 80, max: 100, remark: 'Excellent' },
    { grade: 'B2', min: 70, max: 79, remark: 'Very Good' },
    { grade: 'B3', min: 60, max: 69, remark: 'Good' },
    { grade: 'C4', min: 55, max: 59, remark: 'Credit' },
    { grade: 'C5', min: 50, max: 54, remark: 'Credit' },
    { grade: 'C6', min: 45, max: 49, remark: 'Pass' },
    { grade: 'D7', min: 40, max: 44, remark: 'Pass' },
    { grade: 'E8', min: 35, max: 39, remark: 'Weak Pass' },
    { grade: 'F9', min: 0, max: 34, remark: 'Fail' },
  ];

  if (gradingSchemeStr) {
    try {
      const items = gradingSchemeStr.split(',').map((part) => {
        const [g, range, rem] = part.split(':');
        const [min, max] = range.split('-').map(Number);
        return { grade: g.trim(), min, max, remark: rem ? rem.trim() : 'Pass' };
      });
      for (const item of items) {
        if (score >= item.min && score <= item.max) {
          return { grade: item.grade, remark: item.remark };
        }
      }
    } catch {
      // fallback to default
    }
  }

  for (const item of defaultScheme) {
    if (score >= item.min && score <= item.max) {
      return { grade: item.grade, remark: item.remark };
    }
  }

  return { grade: score >= 50 ? 'Pass' : 'Fail', remark: score >= 50 ? 'Satisfactory' : 'Needs Improvement' };
}
