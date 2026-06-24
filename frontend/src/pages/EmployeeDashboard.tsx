import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { fetchEmployeeDashboard } from '../api/quiz';
import type { DashboardLeaderboardEntry, DashboardTrainingRecord } from '../api/dashboard';
import { useTranslation } from '../i18n/useTranslation';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'daily' | 'weekly'>('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [streakDays, setStreakDays] = useState(0);
  const [daysUntilBadge, setDaysUntilBadge] = useState(15);
  const [trainingHistory, setTrainingHistory] = useState<DashboardTrainingRecord[]>([]);
  const [leaderboard, setLeaderboard] = useState<DashboardLeaderboardEntry[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchEmployeeDashboard(user.id, leaderboardPeriod);
        setStreakDays(data.streakDays);
        setDaysUntilBadge(data.daysUntilBadge);
        setTrainingHistory(data.trainingHistory);
        setLeaderboard(data.leaderboard);
      } catch {
        setTrainingHistory([]);
        setLeaderboard([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user?.id, leaderboardPeriod]);

  const circumference = 2 * Math.PI * 78;
  const strokeDashoffset = circumference - ((streakDays / 15) * circumference);
  const firstName = user?.fullName?.split(' ')[0] || 'there';

  return (
    <div className="theme-page overflow-x-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <Sidebar />

      <main className="lg:ml-72 min-h-screen">
        <header className="theme-header-bar h-20 flex items-center justify-between px-8 sticky top-0 z-40 border-b">
          <h1 className="text-[24px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Dashboard Overview
          </h1>
          <div className="flex items-center gap-6">
            <div className="relative">
              <button className="w-10 h-10 flex items-center justify-center rounded-full transition-colors theme-text-secondary"
                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-nav)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-[var(--bg-page)]"
                style={{ background: '#ba1a1a' }} />
            </div>
            <div className="flex items-center gap-3 pl-6 border-l" style={{ borderColor: 'var(--border)' }}>
              <div className="text-right hidden sm:block">
                <p className="text-[14px] font-bold theme-text-primary">{user?.fullName}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider theme-muted">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[16px]"
                style={{ background: '#172a1e' }}>
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1200px] mx-auto space-y-12">
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 rounded-xl p-10 text-white relative overflow-hidden flex flex-col justify-between min-h-[300px]"
              style={{ background: 'linear-gradient(135deg, #172a1e 0%, #2d4033 100%)', boxShadow: '0 20px 40px rgba(23,42,30,0.15)' }}>
              <div className="relative z-10">
                <span className="font-bold text-[12px] uppercase tracking-[0.2em] mb-4 block" style={{ color: '#b6ccba' }}>
                  Welcome back, {firstName}
                </span>
                <h2 className="text-[36px] font-bold leading-tight mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Master the Art of<br />Professional Cleaning.
                </h2>
                <p className="text-[16px]" style={{ color: 'rgba(182,204,186,0.8)' }}>
                  Keep up your training to stay ahead of the team leaderboard.
                </p>
              </div>
              <div className="relative z-10 flex flex-wrap gap-4 mt-8">
                <button onClick={() => navigate('/employee/courses')}
                  className="font-bold py-3 px-7 rounded-xl transition-all duration-300 flex items-center gap-2"
                  style={{ background: '#d2e8d6', color: '#172a1e' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#ffffff'}
                  onMouseLeave={e => e.currentTarget.style.background = '#d2e8d6'}>
                  <span className="material-symbols-outlined">play_circle</span>
                  {t('dashboard.resumeLearning')}
                </button>
                <button onClick={() => navigate('/employee/quiz')}
                  className="font-bold py-3 px-7 rounded-xl border transition-all duration-300 flex items-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                  <span className="material-symbols-outlined">sports_esports</span>
                  {t('dashboard.joinLiveQuiz')}
                </button>
              </div>
              <div className="absolute right-[-5%] bottom-[-10%] opacity-[0.07] pointer-events-none">
                <span className="material-symbols-outlined text-[300px]">eco</span>
              </div>
            </div>

            <div className="theme-card bg-white rounded-xl p-8 border flex flex-col items-center justify-center text-center"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderColor: 'var(--border-subtle)' }}>
              <div className="relative w-44 h-44 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 176 176">
                  <circle cx="88" cy="88" r="78" fill="transparent" stroke="var(--ring-track)" strokeWidth="10" />
                  <circle cx="88" cy="88" r="78" fill="transparent" stroke="var(--ring-progress)"
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[48px] font-bold leading-none theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {streakDays}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest theme-muted">Days Streak</span>
                </div>
              </div>
              <h3 className="text-[20px] font-bold mb-1 theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Service Milestone
              </h3>
              <p className="text-[14px] theme-text-secondary">
                {daysUntilBadge === 0
                  ? 'Achievement badge unlocked!'
                  : `${daysUntilBadge} day${daysUntilBadge !== 1 ? 's' : ''} until your next Achievement Badge`}
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[24px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Training History
              </h3>
              <button onClick={() => navigate('/employee/quiz')}
                className="text-[14px] font-bold hover:underline theme-text-primary">
                {t('dashboard.viewAll')}
              </button>
            </div>
            <div className="theme-card bg-white rounded-xl border p-6 md:p-8"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderColor: 'var(--border-subtle)' }}>
              {isLoading ? (
                <p className="text-center py-8 theme-muted">Loading training history...</p>
              ) : trainingHistory.length === 0 ? (
                <p className="text-center py-8 theme-muted">{t('dashboard.noHistory')}</p>
              ) : trainingHistory.map((record, index) => (
                <div key={record.id} className="relative flex gap-6 pb-8"
                  style={{
                    paddingLeft: '52px',
                    borderLeft: index < trainingHistory.length - 1 ? '2px solid var(--border)' : '2px solid transparent',
                    marginLeft: '20px',
                  }}>
                  <div className={`absolute -left-[21px] top-0 w-10 h-10 rounded-full theme-icon-circle ${record.passed ? 'theme-icon-circle--success' : 'theme-icon-circle--error'}`}>
                    <span className="material-symbols-outlined text-[20px]">
                      {record.passed ? 'check_circle' : 'error_outline'}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                    <div>
                      <h4 className="text-[16px] font-bold theme-text-primary">{record.quizName}</h4>
                      <p className="text-[12px] font-bold uppercase tracking-wide mt-1 theme-muted">
                        {record.date} • {record.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="block text-[24px] font-bold leading-none"
                          style={{ color: record.passed ? 'var(--text-primary)' : '#ba1a1a' }}>
                          {record.score}%
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider theme-muted">Score</span>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[12px] font-bold theme-badge ${record.passed ? 'theme-badge--passed' : 'theme-badge--failed'}`}>
                        {record.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h3 className="text-[24px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Company Leaderboard
                </h3>
                <p className="text-[12px] font-bold uppercase tracking-wide mt-1 theme-muted">Top 5 Employees</p>
              </div>
              <div className="theme-segmented">
                {(['daily', 'weekly'] as const).map(period => (
                  <button key={period} onClick={() => setLeaderboardPeriod(period)}
                    className={`theme-segmented__tab ${leaderboardPeriod === period ? 'theme-segmented__tab--active' : ''}`}>
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="theme-card bg-white rounded-xl border overflow-hidden"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderColor: 'var(--border-subtle)' }}>
              {isLoading ? (
                <p className="text-center py-12 theme-muted">Loading leaderboard...</p>
              ) : leaderboard.length === 0 ? (
                <p className="text-center py-12 theme-muted">{t('dashboard.noLeaderboard')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="theme-panel">
                        {['Rank', 'Employee', 'Score', 'Tier'].map(h => (
                          <th key={h} className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider theme-muted">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map(entry => (
                        <tr key={`${entry.rank}-${entry.name}`}
                          style={{
                            background: entry.isCurrentUser ? 'rgba(23,42,30,0.04)' : 'transparent',
                            borderLeft: entry.isCurrentUser ? '4px solid #172a1e' : '4px solid transparent',
                            borderBottom: '1px solid var(--border-subtle)',
                          }}>
                          <td className="px-8 py-5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${!entry.isCurrentUser && entry.rank === 1 ? 'theme-rank-first' : ''}`}
                              style={{
                                background: entry.isCurrentUser ? '#172a1e' : entry.rank === 1 ? undefined : 'var(--bg-panel)',
                                color: entry.isCurrentUser ? '#ffffff' : entry.rank === 1 ? undefined : 'var(--text-secondary)',
                              }}>
                              {entry.rank}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[14px]"
                                style={{
                                  background: entry.isCurrentUser ? '#172a1e' : 'var(--bg-panel)',
                                  color: entry.isCurrentUser ? '#ffffff' : 'var(--text-secondary)',
                                }}>
                                {entry.isCurrentUser ? user?.fullName?.charAt(0).toUpperCase() : entry.name.charAt(0)}
                              </div>
                              <span className="font-bold text-[14px] theme-text-primary">
                                {entry.isCurrentUser ? `${user?.fullName} (You)` : entry.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5 font-bold theme-text-primary">
                            {entry.points.toLocaleString()} pts
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold theme-badge ${
                              entry.tier === 'DIAMOND' ? 'theme-badge--tier-diamond'
                                : entry.tier === 'PLATINUM' ? 'theme-badge--tier-platinum'
                                : 'theme-badge--tier-gold'
                            }`}>
                              {entry.tier}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="theme-footer py-10 px-8 mt-12 border-t">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-[20px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>CleanIQ</span>
              <p className="text-[13px] mt-1 theme-muted">© 2025 CleanIQ. Purifying spaces, professionally.</p>
            </div>
            <div className="flex gap-8">
              {['Privacy Policy', 'Terms of Service', 'Support'].map(link => (
                <a key={link} href="#" className="text-[12px] font-bold transition-colors theme-muted hover:theme-text-primary">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
