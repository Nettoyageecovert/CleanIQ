import { useAuth } from '../context/AuthContext';
import EmployerSidebar from '../components/EmployerSidebar';

export default function EmployerDashboardPage() {
  const { user } = useAuth();

  const cards = [
    { label: 'Published courses', value: '12', detail: 'Available to employees' },
    { label: 'Published quizzes', value: '8', detail: 'Linked to training paths' },
    { label: 'Admin tools', value: '3', detail: 'Courses & quiz creator' },
  ];

  return (
    <div className="theme-page" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <EmployerSidebar />

      <main className="lg:ml-72 min-h-screen">
        <header className="theme-header-bar h-20 flex items-center justify-between px-8 sticky top-0 z-40 border-b">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-1 theme-muted">Employer Console</p>
            <h1 className="text-[24px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Welcome, {user?.fullName || 'Admin'}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: '#172a1e' }}>
            {user?.fullName?.charAt(0).toUpperCase() || 'A'}
          </div>
        </header>

        <div className="p-8 max-w-[1200px] mx-auto space-y-8">
          <section className="rounded-2xl p-8 text-white overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #172a1e 0%, #2d4033 100%)', boxShadow: '0 20px 40px rgba(23,42,30,0.15)' }}>
            <div className="relative z-10 max-w-2xl">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#b6ccba' }}>
                Admin dashboard
              </p>
              <h2 className="text-[34px] font-bold leading-tight mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Manage training content and monitor rollout from one place.
              </h2>
              <p className="text-[16px]" style={{ color: 'rgba(182,204,186,0.85)' }}>
                Publish courses for employees and create quizzes linked to each course.
              </p>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-3">
            {cards.map(card => (
              <div key={card.label} className="theme-card rounded-2xl border p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderColor: 'var(--border-subtle)' }}>
                <p className="text-[12px] font-bold uppercase tracking-wide theme-muted">{card.label}</p>
                <div className="mt-3 text-[36px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>{card.value}</div>
                <p className="mt-1 text-[14px] theme-text-secondary">{card.detail}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="theme-card rounded-2xl border p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderColor: 'var(--border-subtle)' }}>
              <h3 className="text-[20px] font-bold mb-3 theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>Quick actions</h3>
              <div className="flex gap-3 flex-wrap">
                <a className="px-4 py-3 rounded-xl font-bold" href="/employer/courses" style={{ background: '#172a1e', color: '#ffffff' }}>
                  Open course management
                </a>
                <a className="px-4 py-3 rounded-xl font-bold" href="/employer/quiz-creator" style={{ background: '#d2e8d6', color: '#172a1e' }}>
                  Build a quiz
                </a>
              </div>
            </div>

            <div className="theme-card rounded-2xl border p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderColor: 'var(--border-subtle)' }}>
              <h3 className="text-[20px] font-bold mb-3 theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>Tip</h3>
              <p className="text-[14px] leading-6 theme-text-secondary">
                When creating quizzes, set the Related Course to match a published course title so employee progress updates automatically.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
