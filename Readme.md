# ProctoGuard 🛡️

**Enterprise-Grade B2B SaaS Proctoring Platform** _A Full-Stack TypeScript B.Tech Final Year Project_

ProctoGuard is a secure, role-based examination platform designed to facilitate online assessments while actively preventing and tracking suspicious behavior.

## 🚀 Tech Stack (Fully Type-Safe Architecture)

**Backend (Completed MVP)**

- Node.js 25.x & Express 5.x (ES Modules)
- MongoDB Atlas & Mongoose 9.x
- JWT (Access & Refresh Token Rotation)
- Bcrypt for secure credential hashing

**Frontend (In Progress)**

- Next.js 16 (App Router) & React 19
- Tailwind CSS v4 & Shadcn UI (Radix)
- React Hook Form & Zod (Strict Validation)
- Zustand & TanStack React Query

## ⚙️ Core Features

### 👨‍🏫 Educator Portal

- **Role-Based Auth:** Secure login and session management.
- **Exam Engine:** Create exams with custom time limits, passing scores, and dynamic question banks.
- **Access Control:** Generates secure, unique 6-character `inviteCodes` for student access.

### 🎓 Student Exam Room & Proctoring

- **Real-Time State:** Auto-saves answers mid-exam to prevent data loss.
- **Auto-Grading:** Cross-references submitted attempts with hidden answer keys on the server.
- **Telemetry & Anti-Cheat:** Tracks browser `visibilitychange` events. Automatically flags exams and locks out students after 3 off-tab warnings.

## 📂 Monorepo Structure

\`\`\`text
procto-guard/
├── backend/ # Express API, MongoDB Models, JWT Auth, Controllers
├── frontend/ # Next.js App Router, Shadcn UI components, API Hooks
└── README.md
\`\`\`

## 🛠️ Local Development Setup

**1. Clone the repository**
\`\`\`bash
git clone https://github.com/yourusername/procto-guard.git
cd procto-guard
\`\`\`

**2. Backend Setup**
\`\`\`bash
cd backend
npm install

# Create a .env file with PORT, MONGODB_URI, ACCESS_TOKEN_SECRET, etc.

npm run dev
\`\`\`

**3. Frontend Setup**
\`\`\`bash
cd ../frontend
npm install
npm run dev
\`\`\`

---

_Currently in active development._
