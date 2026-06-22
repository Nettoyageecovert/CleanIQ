import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployerSidebar from '../components/EmployerSidebar';
import { useAuth } from '../context/AuthContext';
import {
  deleteQuiz,
  fetchEmployerAnalytics,
  fetchQuizzes,
  type EmployerAnalytics,
  type Quiz,
} from '../api/quiz';
import { formatQuizDate } from '../utils/quizDisplay';

export default function EmployerAnalyticsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [analytics, setAnalytics] = useState<EmployerAnalytics | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [analyticsData, quizData] = await Promise.all([
        fetchEmployerAnalytics(),
        fetchQuizzes(),
      ]);
      setAnalytics(analyticsData);
      setQuizzes(quizData);
    } catch {
      setLoadError('Unable to load analytics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteQuiz = async (quizId: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This also removes all employee attempts for this quiz.`)) {
      return;
    }

    setDeletingId(quizId);
    try {
      await deleteQuiz(quizId);
      await loadData();
    } catch {
      window.alert('Unable to delete quiz. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const summary = analytics?.summary;

  return (
    <div className="theme-page min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <EmployerSidebar />

      <main className="lg:ml-72 min-h-screen">
        <header className="theme-header-bar h-20 flex items-center justify-between px-8 sticky top-0 z-40 border-b">
          <h1 className="text-[24px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Analytics
          </h1>
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: '#172a1e' }}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
        </header>

        <div className="max-w-[1200px] mx-auto px-8 py-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-[40px] font-bold leading-tight theme-text-primary"
                style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}>
                Team Training Analytics
              </h2>
              <p className="text-[16px] mt-1 theme-text-secondary">
                Monitor employee quiz completion, pass rates, and quiz performance.
              </p>
            </div>
            <button onClick={() => navigate('/employer/quiz-creator')}
              className="px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all shrink-0"
              style={{ background: '#172a1e', color: '#ffffff' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2d4033'}
              onMouseLeave={e => e.currentTarget.style.background = '#172a1e'}>
              Create Quiz
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-20 theme-muted">Loading analytics...</div>
          ) : loadError ? (
            <div className="text-center py-20" style={{ color: '#ba1a1a' }}>{loadError}</div>
          ) : analytics ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: 'Active Employees', value: String(summary?.totalEmployees ?? 0), icon: 'groups', variant: 'stars' as const },
                  { label: 'Quiz Completions', value: String(summary?.totalAttempts ?? 0), icon: 'task_alt', variant: 'complete' as const },
                  { label: 'Team Pass Rate', value: `${summary?.overallPassRate ?? 0}%`, icon: 'verified', variant: 'pass' as const },
                  { label: 'Participation', value: `${summary?.employeeParticipationRate ?? 0}%`, icon: 'trending_up', variant: 'pending' as const },
                ].map(stat => (
                  <div key={stat.label} className="theme-stat-card px-5 py-5 rounded-xl border flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full theme-stat-icon theme-stat-icon--${stat.variant}`}>
                      <span className="material-symbols-outlined text-[22px]">{stat.icon}</span>
                    </div>
                    <div>
                      <p className="stat-label text-[11px] font-bold uppercase tracking-wider">{stat.label}</p>
                      <p className="stat-value text-[28px] font-bold leading-none mt-1">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="theme-card bg-white rounded-xl p-8 border" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderColor: 'var(--border-subtle)' }}>
                  <h3 className="text-[20px] font-bold mb-1 theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Employee Completion
                  </h3>
                  <p className="text-[13px] mb-6 theme-muted">
                    How many quizzes each employee has finished
                  </p>
                  {analytics.employeeCompletion.length === 0 ? (
                    <div className="text-center py-12 theme-muted">
                      <span className="material-symbols-outlined text-[40px] block mb-2">person_off</span>
                      <p className="text-[14px]">No employees registered yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {analytics.employeeCompletion.map(employee => (
                        <div key={employee.userId} className="theme-panel rounded-xl p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-[14px] font-bold truncate theme-text-primary">{employee.fullName}</p>
                              <p className="text-[12px] truncate theme-muted">{employee.email}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[18px] font-bold theme-text-primary">
                                {employee.completedCount}/{employee.totalQuizzes}
                              </p>
                              <p className="text-[10px] font-bold uppercase tracking-wider theme-muted">Completed</p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-3 text-[12px]">
                            <span className="theme-muted">{employee.pendingCount} pending</span>
                            <span className="theme-muted">Avg {employee.avgScore}%</span>
                            <span className="theme-muted">Pass {employee.passRate}%</span>
                            {employee.lastCompletedAt && (
                              <span className="theme-muted">Last {formatQuizDate(employee.lastCompletedAt)}</span>
                            )}
                          </div>
                          <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'var(--ring-track)' }}>
                            <div className="h-full rounded-full transition-all"
                              style={{
                                width: employee.totalQuizzes
                                  ? `${Math.round((employee.completedCount / employee.totalQuizzes) * 100)}%`
                                  : '0%',
                                background: 'var(--ring-progress)',
                              }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="theme-card bg-white rounded-xl p-8 border" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderColor: 'var(--border-subtle)' }}>
                  <h3 className="text-[20px] font-bold mb-1 theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Quiz Performance
                  </h3>
                  <p className="text-[13px] mb-6 theme-muted">
                    Completion and pass rates per published quiz
                  </p>
                  {analytics.quizStats.length === 0 ? (
                    <div className="text-center py-12 theme-muted">
                      <span className="material-symbols-outlined text-[40px] block mb-2">quiz</span>
                      <p className="text-[14px]">No quizzes published yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {analytics.quizStats.map(quiz => (
                        <div key={quiz.quizId} className="theme-panel rounded-xl p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-[14px] font-bold truncate theme-text-primary">{quiz.title}</p>
                              <p className="text-[12px] theme-muted">{quiz.category}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[18px] font-bold theme-text-primary">{quiz.completionRate}%</p>
                              <p className="text-[10px] font-bold uppercase tracking-wider theme-muted">Completion</p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-3 text-[12px] theme-muted">
                            <span>{quiz.attemptCount} attempts</span>
                            <span>{quiz.passCount} passed</span>
                            <span>Avg {quiz.avgScore}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <section className="theme-card bg-white rounded-xl p-8 border" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderColor: 'var(--border-subtle)' }}>
                <h3 className="text-[20px] font-bold mb-1 theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Recent Activity
                </h3>
                <p className="text-[13px] mb-6 theme-muted">Latest quiz submissions across your team</p>
                {analytics.recentActivity.length === 0 ? (
                  <div className="text-center py-10 theme-muted">
                    <p className="text-[14px]">No quiz attempts recorded yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="theme-panel">
                          {['Employee', 'Quiz', 'Score', 'Status', 'Date'].map(header => (
                            <th key={header} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider theme-muted">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.recentActivity.map(activity => (
                          <tr key={activity.attemptId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td className="px-4 py-4 text-[14px] font-medium theme-text-primary">{activity.userName}</td>
                            <td className="px-4 py-4 text-[14px] theme-text-secondary">{activity.quizTitle}</td>
                            <td className="px-4 py-4 text-[14px] font-bold theme-text-primary">{activity.score}%</td>
                            <td className="px-4 py-4">
                              <span className={`px-3 py-1 rounded-full text-[11px] font-bold theme-badge ${activity.passed ? 'theme-badge--passed' : 'theme-badge--failed'}`}>
                                {activity.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-[13px] theme-muted">{formatQuizDate(activity.completedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="theme-card bg-white rounded-xl p-8 border" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-[20px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      Manage Quizzes
                    </h3>
                    <p className="text-[13px] mt-1 theme-muted">Edit or delete quizzes your team no longer needs</p>
                  </div>
                  <p className="text-[13px] font-bold theme-muted">{quizzes.length} published</p>
                </div>
                {quizzes.length === 0 ? (
                  <div className="text-center py-10 theme-muted">
                    <p className="text-[14px]">Create your first quiz to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quizzes.map(quiz => (
                      <div key={quiz.id} className="theme-panel rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-bold theme-text-primary">{quiz.title}</p>
                          <p className="text-[12px] theme-muted">{quiz.category} · {quiz.relatedCourse}</p>
                          <p className="text-[12px] theme-muted mt-1">{quiz.questions.length} questions · {quiz.passingPercent}% to pass</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => navigate(`/employer/quiz-creator/${quiz.id}`)}
                            className="px-4 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap"
                            style={{ background: '#d2e8d6', color: '#172a1e' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#b6ccba'}
                            onMouseLeave={e => e.currentTarget.style.background = '#d2e8d6'}>
                            Edit Quiz
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                            disabled={deletingId === quiz.id}
                            className="px-4 py-2 rounded-lg text-[13px] font-bold transition-all disabled:opacity-60 whitespace-nowrap"
                            style={{ background: '#ffdad6', color: '#ba1a1a' }}
                            onMouseEnter={e => { if (deletingId !== quiz.id) e.currentTarget.style.background = '#ffc8c2'; }}
                            onMouseLeave={e => e.currentTarget.style.background = '#ffdad6'}>
                            {deletingId === quiz.id ? 'Deleting...' : 'Delete Quiz'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
