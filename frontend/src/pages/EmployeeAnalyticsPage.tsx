import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { fetchAttemptsByUser, fetchQuizzes, type Quiz, type QuizAttempt } from '../api/quiz';
import { formatQuizDate } from '../utils/quizDisplay';

interface CategoryStat {
  category: string;
  avgScore: number;
  count: number;
}

interface ScoreEntry {
  id: string;
  title: string;
  score: number;
  passed: boolean;
  date: string;
}

export default function EmployeeAnalyticsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const [quizData, attemptData] = await Promise.all([
          fetchQuizzes(),
          fetchAttemptsByUser(user.id),
        ]);
        setQuizzes(quizData);
        setAttempts(attemptData);
      } catch {
        setLoadError('Unable to load analytics. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user?.id]);

  const quizMap = useMemo(() => new Map(quizzes.map(q => [q.id, q])), [quizzes]);

  const completedCount = attempts.length;
  const upcomingCount = quizzes.filter(q => !attempts.some(a => a.quizId === q.id)).length;
  const avgScore = completedCount > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / completedCount)
    : 0;
  const passRate = completedCount > 0
    ? Math.round((attempts.filter(a => a.passed).length / completedCount) * 100)
    : 0;
  const bestScore = completedCount > 0 ? Math.max(...attempts.map(a => a.score)) : 0;

  const scoreHistory: ScoreEntry[] = useMemo(() =>
    [...attempts]
      .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
      .slice(-6)
      .map(attempt => {
        const quiz = quizMap.get(attempt.quizId);
        return {
          id: attempt.id,
          title: quiz?.title ?? 'Unknown Quiz',
          score: attempt.score,
          passed: attempt.passed,
          date: formatQuizDate(attempt.completedAt),
        };
      }),
    [attempts, quizMap]
  );

  const categoryStats: CategoryStat[] = useMemo(() => {
    const groups = new Map<string, number[]>();
    attempts.forEach(attempt => {
      const quiz = quizMap.get(attempt.quizId);
      if (!quiz) return;
      const scores = groups.get(quiz.category) ?? [];
      scores.push(attempt.score);
      groups.set(quiz.category, scores);
    });
    return Array.from(groups.entries())
      .map(([category, scores]) => ({
        category,
        avgScore: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
        count: scores.length,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }, [attempts, quizMap]);

  return (
    <div className="theme-page min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <Sidebar />

      <main className="lg:ml-72 min-h-screen">
        <header className="theme-header-bar h-20 flex items-center justify-between px-8 sticky top-0 z-40 border-b">
          <h1 className="text-[24px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Analytics
          </h1> 
          <div className="flex items-center gap-3 pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-[14px] font-bold theme-text-primary">{user?.fullName}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider theme-muted">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: '#172a1e' }}>
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="max-w-[1200px] mx-auto px-8 py-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-[40px] font-bold leading-tight theme-text-primary"
                style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}>
                Training Analytics
              </h2>
              <p className="text-[16px] mt-1 theme-text-secondary">
                Track your quiz performance and progress over time.
              </p>
            </div>
            <button onClick={() => navigate('/employee/quiz')}
              className="px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all shrink-0"
              style={{ background: '#172a1e', color: '#ffffff' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2d4033'}
              onMouseLeave={e => e.currentTarget.style.background = '#172a1e'}>
              Go to Quiz Center
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-20 theme-muted">Loading analytics...</div>
          ) : loadError ? (
            <div className="text-center py-20" style={{ color: '#ba1a1a' }}>{loadError}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: 'Average Score', value: `${avgScore}%`, icon: 'stars', variant: 'stars' as const },
                  { label: 'Pass Rate', value: `${passRate}%`, icon: 'task_alt', variant: 'pass' as const },
                  { label: 'Completed', value: String(completedCount), icon: 'check_circle', variant: 'complete' as const },
                  { label: 'Upcoming', value: String(upcomingCount), icon: 'pending_actions', variant: 'pending' as const },
                ].map(stat => (
                  <div key={stat.label}
                    className="theme-stat-card px-5 py-5 rounded-xl border flex items-center gap-4">
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
                <section className="theme-card rounded-xl p-8 border" style={{ borderColor: 'var(--border-subtle)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-[20px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Score Trend
                      </h3>
                      <p className="text-[13px] mt-1 theme-muted">
                        {scoreHistory.length > 0 ? 'Your most recent quiz attempts' : 'Complete a quiz to see your trend'}
                      </p>
                    </div>
                    {bestScore > 0 && (
                      <span className="px-3 py-1 rounded-full text-[12px] font-bold theme-badge theme-badge--accent">
                        Best: {bestScore}%
                      </span>
                    )}
                  </div>
                  {scoreHistory.length === 0 ? (
                    <div className="text-center py-12 theme-muted">
                      <span className="material-symbols-outlined text-[40px] block mb-2">bar_chart</span>
                      <p className="text-[14px]">No quiz data yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {scoreHistory.map(entry => (
                        <div key={entry.id}>
                          <div className="flex justify-between items-center mb-1.5">
                            <p className="text-[13px] font-medium truncate pr-4 theme-text-primary">{entry.title}</p>
                            <span className="text-[13px] font-bold shrink-0"
                              style={{ color: entry.passed ? 'var(--icon-success-fg)' : 'var(--icon-error-fg)' }}>
                              {entry.score}%
                            </span>
                          </div>
                          <div className="h-2.5 rounded-full overflow-hidden theme-progress-track">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${entry.score}%`,
                                background: entry.passed ? 'var(--ring-progress)' : 'var(--badge-failed-bg)',
                              }} />
                          </div>
                          <p className="text-[11px] mt-1 theme-muted">{entry.date}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                <section className="theme-card rounded-xl p-8 border" style={{ borderColor: 'var(--border-subtle)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <h3 className="text-[20px] font-bold mb-1 theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Performance by Category
                  </h3>
                  <p className="text-[13px] mb-6 theme-muted">
                    Average scores grouped by training category
                  </p>
                  {categoryStats.length === 0 ? (
                    <div className="text-center py-12 theme-muted">
                      <span className="material-symbols-outlined text-[40px] block mb-2">category</span>
                      <p className="text-[14px]">No category data yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {categoryStats.map(cat => (
                        <div key={cat.category} className="theme-analytics-panel flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] panel-title truncate">{cat.category}</p>
                            <p className="text-[12px] panel-subtitle">{cat.count} quiz{cat.count !== 1 ? 'zes' : ''} taken</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[22px] panel-value">{cat.avgScore}%</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider panel-subtitle">Avg</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
              <section className="rounded-xl p-8 border border-[#e1e4e0]/40 flex flex-col md:flex-row items-start md:items-center gap-6"
                style={{ background: 'linear-gradient(135deg, #172a1e 0%, #2d4033 100%)' }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(210,232,214,0.15)' }}>
                  <span className="material-symbols-outlined text-[28px]" style={{ color: '#d2e8d6' }}>insights</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-[18px] font-bold mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: '#ffffff' }}>
                    {completedCount === 0
                      ? 'Start your first quiz to unlock insights'
                      : passRate >= 80
                        ? 'Excellent progress — keep your streak going'
                        : passRate >= 50
                          ? 'Good work — focus on upcoming quizzes to improve'
                          : 'Review past quizzes to strengthen weak areas'}
                  </h3>
                  <p className="text-[14px]" style={{ color: 'rgba(210,232,214,0.85)' }}>
                    {completedCount === 0
                      ? `${upcomingCount} quiz${upcomingCount !== 1 ? 'zes are' : ' is'} waiting in your Quiz Center.`
                      : `You've completed ${completedCount} of ${quizzes.length} available quizzes with a ${avgScore}% average.`}
                  </p>
                </div>
              </section>
            </>
          )}
        </div>

        <footer className="theme-footer py-10 px-8 mt-8 border-t">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-[20px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>CleanIQ</span>
              <p className="text-[13px] mt-1 theme-muted">© 2025 CleanIQ. Purifying spaces, professionally.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
