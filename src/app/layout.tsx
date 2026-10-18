import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/layout/AppShell";
import VisitorTracker from "@/components/analytics/VisitorTracker";

export const metadata: Metadata = {
  title: "Full of Grace Preparatory School Management System",
  description: "Official School Management and Academic Portal for Full of Grace Preparatory School",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  // Fetch current academic settings
  let activeYearName = "2025/2026";
  let activeTermName = "Second Term";

  try {
    const settings = await prisma.schoolSettings.findUnique({
      where: { id: "settings_primary" },
    });

    if (settings?.currentAcademicYearId) {
      const year = await prisma.academicYear.findUnique({
        where: { id: settings.currentAcademicYearId },
      });
      if (year) activeYearName = year.name;
    }

    if (settings?.currentTermId) {
      const term = await prisma.term.findUnique({
        where: { id: settings.currentTermId },
      });
      if (term) activeTermName = term.name;
    }
  } catch (err) {
    console.error("Layout fetch error:", err);
  }

  return (
    <html lang="en">
      <body>
        <VisitorTracker />
        <AppShell
          user={user}
          activeYearName={activeYearName}
          activeTermName={activeTermName}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
