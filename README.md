# FULL OF GRACE PREPARATORY SCHOOL MANAGEMENT SYSTEM

> A complete, professional, and secure School Management & Academic Information System built for **Full of Grace Preparatory School**.

### 🌐 Live Demo Website:
👉 **[https://06fd8efe511c86bd-154-162-7-128.serveousercontent.com](https://06fd8efe511c86bd-154-162-7-128.serveousercontent.com)**

*(Alternative GitHub Pages landing link: [https://ar331913-code.github.io/fogps-school-management-system/](https://ar331913-code.github.io/fogps-school-management-system/))*

---

## 🌟 Key Features

- **Single Source of Truth 360° Student Profiles**: 11 tabs including Overview, Personal Information, Parents/Guardians, Academic Records, Attendance, Results, Bursary Ledger, Documents, Medical Records, Disciplinary Notes, and Chronological Audit History.
- **Role-Based Access Control (4 Roles)**:
  - **Admin**: Full system management, settings, user provisioning, and audit logs.
  - **Teacher**: Class attendance register, terminal exam results entry, student academic profiles.
  - **Accountant**: Fee structures, student ledgers, payment recording, and official receipt generation.
  - **Receptionist**: Student admission wizard, search, and student directory.
- **Live Interactive Dashboard**: Enrollment statistics, gender ratios, fee collection vs. outstanding balance, and attendance counters.
- **Automated ID & Receipt Number Generation**: Configurable sequential formats with zero collision guarantee (`FOGPS-2026-0001`, `REC-2026-0001`).
- **Terminal Report Cards**: Standard Ghana basic school grading scheme (`A1` to `F9`), subject breakdown, teacher and headteacher remarks, print and PDF ready.
- **Student ID Cards**: Professional front and back printable ID cards with barcode/QR code placeholder and emergency details.
- **Official Bursary Receipts**: Instant verifiable receipt generation for cash, mobile money (MoMo), and bank payments.
- **Reporting & Export**: Student directory, fee debtors ledger, and attendance reports with CSV/Excel export.
- **System Audit Trail**: Complete activity logs tracking staff operations with timestamps.

---

## 🚀 Default Demo Accounts

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Full administrative control |
| **Teacher** | `teacher` | `teacher123` | Primary 4 class teacher (Attendance & Marks) |
| **Accountant** | `accountant` | `accountant123` | Bursar (Fees, Payments & Receipts) |
| **Receptionist** | `receptionist` | `receptionist123` | Front desk (Admissions & Directory) |

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router, TypeScript, React 18)
- **Styling**: Tailwind CSS & Lucide Icons
- **Database & ORM**: SQLite & Prisma ORM
- **Authentication**: Role-based session cookies with Bcrypt password hashing
- **Validation**: Zod schema validation

---

## 💻 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ar331913-code/fogps-school-management-system.git
   cd fogps-school-management-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Initialize the database & seed sample records**:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Free Cloud Hosting Deployment

### Option 1: Deploy on Render (Recommended for full SQLite & Server support)
1. Push this repository to your GitHub account (`ar331913-code`).
2. Go to [Render.com](https://render.com) and sign in with GitHub.
3. Click **New +** -> **Web Service**.
4. Select this repository.
5. Set:
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run build`
   - **Start Command**: `npm start`
6. Click **Deploy Web Service** (100% Free tier).

### Option 2: Deploy on Vercel
1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New** -> **Project**.
3. Import this repository.
4. Add environment variable:
   - `JWT_SECRET`: `fogps-secret-key-prep-school-2026-super-secure`
5. Click **Deploy**.

---

## 📄 License
Private property of **Full of Grace Preparatory School**.
