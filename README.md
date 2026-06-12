CleanIQ — Employee Training Platform

CleanIQ is a gamified internal training platform built for professional cleaning companies. It allows employers to create quizzes and training modules, and employees to complete them through solo practice or live competitive sessions.


⚠️ Current Status: Frontend UI is complete. Backend database (Supabase) is not yet connected — user data resets when the server restarts. Full backend integration is in progress.




What's Been Built So Far

Employee Side 

PageURLDescriptionRegister/registerCreate a new employee accountLogin/loginSign in to your accountForgot Password/forgot-passwordRequest a password reset linkDashboard/employee/dashboardOverview with streak, training history, leaderboardMy Courses/employee/coursesBrowse and track training coursesQuiz Center/employee/quizView past and upcoming quizzesQuiz Play/employee/quiz/playTake a solo self-paced quizQuiz Review/employee/quiz/reviewReview answers from a past quizLive Game/employee/live/gameJoin a live competitive quiz sessionSettings/employee/settingsAccount preferences and logout

Employer Side

🔜 Coming soon

Backend & Database

🔜 Supabase (PostgreSQL) connection coming soon


Tech Stack

Frontend


React 19 + TypeScript
Vite (build tool)
Tailwind CSS v4
React Router v7
Axios



Backend


Node.js + Express.js
bcryptjs (password hashing)
jsonwebtoken (JWT authentication)
express-validator (input validation)
dotenv
nodemon (development)


Database (not connected yet)


Supabase — PostgreSQL
Upstash — Redis (for live game scores)



How to Run Locally

Requirements


Node.js v18 or higher — download at https://nodejs.org
A code editor (VS Code recommended)


Step 1 — Clone the repository

bashgit clone https://github.com/hope400/CleanIQ.git
cd CleanIQ
git checkout dev

Step 2 — Install backend dependencies

bashcd backend
npm install

Step 3 — Install frontend dependencies

bashcd ../frontend
npm install

Step 4 — Run the backend

Open a terminal and run:

bashcd backend
npm run dev

You should see:

✅ CleanIQ backend running on http://localhost:5000

Step 5 — Run the frontend

Open a second terminal and run:

bashcd frontend
npm run dev

You should see:

VITE ready on http://localhost:5173

Step 6 — Open in browser

http://localhost:5173


How to Use the App

Register an Account


Go to http://localhost:5173/register
Enter your full name, email, and a password
Password must be at least 8 characters with letters and numbers
Click Create Account — you will land on the Employee Dashboard


Log In


Go to http://localhost:5173/login
Enter your email and password
Click Login



⚠️ Since the database is not yet connected, accounts are stored temporarily in memory. If the backend restarts, you will need to register again.



Navigate the App

Use the sidebar on the left to move between pages:


Dashboard — training overview, streak, leaderboard
My Courses — browse assigned courses
Quiz Center — past quizzes and upcoming assignments
Settings — account preferences and logout


Take a Solo Quiz


Go to Quiz Center → Upcoming tab
Click Start Quiz
Answer each question before the timer runs out
A training insight appears after each answer
See your final score and review all answers at the end


Join a Live Game


From Dashboard or My Courses, click Join Live Game
Answer questions competing against other players
Leaderboard updates after every question
Final rankings shown at the end


Log Out

Go to Settings and click Log Out, or click Log out at the bottom of the sidebar.


Project Structure

cleaniq/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── routes/
│   │   │   └── auth.js
│   │   └── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── auth.ts
    │   ├── components/
    │   │   └── Sidebar.tsx
    │   ├── context/
    │   │   └── AuthContext.tsx
    │   ├── pages/
    │   │   ├── RegisterPage.tsx
    │   │   ├── LoginPage.tsx
    │   │   ├── ForgotPasswordPage.tsx
    │   │   ├── EmployeeDashboard.tsx
    │   │   ├── MyCoursesPage.tsx
    │   │   ├── QuizCenterPage.tsx
    │   │   ├── QuizPlayPage.tsx
    │   │   ├── QuizReviewPage.tsx
    │   │   ├── LiveGamePage.tsx
    │   │   └── SettingsPage.tsx
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    └── vite.config.ts

