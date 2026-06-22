import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmployerSidebar from '../components/EmployerSidebar';
import { deleteQuiz, fetchEmployerAnalytics, fetchQuizzes, type Quiz } from '../api/quiz';

export default function EmployerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [summary, setSummary] = useState({
    totalQuizzes: 0,
    totalEmployees: 0,
    totalAttempts: 0,
    employeeParticipationRate: 0,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      const [quizData, analytics] = await Promise.all([
        fetchQuizzes(),
        fetchEmployerAnalytics(),
      ]);
      setQuizzes(quizData);
      setSummary(analytics.summary);
    } catch {
      const quizData = await fetchQuizzes().catch(() => []);
      setQuizzes(quizData);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleDeleteQuiz = async (quizId: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This also removes all employee attempts for this quiz.`)) {
      return;
    }

    setDeletingId(quizId);
    try {
      await deleteQuiz(quizId);
      await loadDashboard();
    } catch {
      window.alert('Unable to delete quiz. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const cards = [
    { label: 'Published quizzes', value: String(summary.totalQuizzes || quizzes.length), detail: 'Available to employees' },
    { label: 'Registered employees', value: String(summary.totalEmployees), detail: 'Active learner accounts' },
    { label: 'Quiz completions', value: String(summary.totalAttempts), detail: `${summary.employeeParticipationRate}% team participation` },
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
                Publish courses for employees, create quizzes, and track completion in Analytics.
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
                <button onClick={() => navigate('/employer/analytics')}
                  className="px-4 py-3 rounded-xl font-bold"
                  style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }}>
                  View analytics
                </button>
              </div>
            </div>

            <div className="theme-card rounded-2xl border p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderColor: 'var(--border-subtle)' }}>
              <h3 className="text-[20px] font-bold mb-3 theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>Tip</h3>
              <p className="text-[14px] leading-6 theme-text-secondary">
                Use Analytics to see which employees have completed each quiz. You can delete outdated quizzes from the list below or in Analytics.
              </p>
            </div>
          </section>

          <section className="theme-card rounded-2xl border p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-[20px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>Published quizzes</h3>
                <p className="text-[14px] theme-text-secondary mt-1">Remove quizzes employees should no longer take</p>
              </div>
              <span className="text-[13px] font-bold theme-muted">{quizzes.length} total</span>
            </div>
            {quizzes.length === 0 ? (
              <p className="text-[14px] theme-muted">No quizzes yet. Create one from Quiz Creator.</p>
            ) : (
              <div className="space-y-3">
                {quizzes.slice(0, 5).map(quiz => (
                  <div key={quiz.id} className="theme-panel rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-bold theme-text-primary">{quiz.title}</p>
                      <p className="text-[12px] theme-muted">{quiz.category} · {quiz.questions.length} questions</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => navigate(`/employer/quiz-creator/${quiz.id}`)}
                        className="px-4 py-2 rounded-lg text-[13px] font-bold"
                        style={{ background: '#d2e8d6', color: '#172a1e' }}>
                        Edit
                      </button>
                      <button
                      onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                      disabled={deletingId === quiz.id}
                      className="px-4 py-2 rounded-lg text-[13px] font-bold disabled:opacity-60"
                      style={{ background: '#ffdad6', color: '#ba1a1a' }}>
                      {deletingId === quiz.id ? 'Deleting...' : 'Delete'}
                    </button>
                    </div>
                  </div>
                ))}
                {quizzes.length > 5 && (
                  <button onClick={() => navigate('/employer/analytics')}
                    className="text-[14px] font-bold theme-text-primary hover:underline">
                    View all {quizzes.length} quizzes in Analytics
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
