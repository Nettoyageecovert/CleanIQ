import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { fetchAttemptsByUser, fetchQuizzes, type Quiz, type QuizAttempt } from '../api/quiz';
import { formatQuizDate, getCategoryStyle } from '../utils/quizDisplay';

interface QuizRecord {
  id: string;
  quizId: string;
  title: string;
  category: string;
  dateLabel: string;
  score: number;
  passed: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
}

function buildQuizRecord(quiz: Quiz, attempt?: QuizAttempt): QuizRecord {
  const style = getCategoryStyle(quiz.category);
  return {
    id: attempt?.id ?? quiz.id,
    quizId: quiz.id,
    title: quiz.title,
    category: quiz.category,
    dateLabel: attempt ? formatQuizDate(attempt.completedAt) : formatQuizDate(quiz.createdAt),
    score: attempt?.score ?? 0,
    passed: attempt?.passed ?? false,
    ...style,
  };
}

export default function QuizCenterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'past' | 'upcoming'>('past');
  const [searchQuery, setSearchQuery] = useState('');
  const [pastQuizzes, setPastQuizzes] = useState<QuizRecord[]>([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<QuizRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!user?.id) return;

    const loadQuizzes = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const [quizzes, attempts] = await Promise.all([
          fetchQuizzes(),
          fetchAttemptsByUser(user.id),
        ]);

        const quizMap = new Map(quizzes.map(q => [q.id, q]));
        const completedQuizIds = new Set(attempts.map(a => a.quizId));

        const past = attempts
          .map(attempt => {
            const quiz = quizMap.get(attempt.quizId);
            if (!quiz) return null;
            return buildQuizRecord(quiz, attempt);
          })
          .filter((record): record is QuizRecord => record !== null)
          .sort((a, b) => {
            const attemptA = attempts.find(at => at.id === a.id);
            const attemptB = attempts.find(at => at.id === b.id);
            if (!attemptA || !attemptB) return 0;
            return new Date(attemptB.completedAt).getTime() - new Date(attemptA.completedAt).getTime();
          });

        const upcoming = quizzes
          .filter(q => !completedQuizIds.has(q.id))
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map(q => buildQuizRecord(q));

        setPastQuizzes(past);
        setUpcomingQuizzes(upcoming);
      } catch {
        setLoadError('Unable to load quizzes. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizzes();
  }, [user?.id]);

  const avgScore = useMemo(() => {
    if (pastQuizzes.length === 0) return 0;
    return Math.round(pastQuizzes.reduce((sum, q) => sum + q.score, 0) / pastQuizzes.length);
  }, [pastQuizzes]);

  const totalPassed = useMemo(
    () => pastQuizzes.filter(q => q.passed).length,
    [pastQuizzes]
  );

  const displayedQuizzes = (activeTab === 'past' ? pastQuizzes : upcomingQuizzes)
    .filter(q =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="theme-page min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <Sidebar />

      <main className="lg:ml-72 min-h-screen">
        <header className="theme-header-bar h-20 flex items-center justify-between px-8 sticky top-0 z-40 border-b">
          <h1 className="text-[24px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Quiz Center
          </h1>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
              style={{ color: '#434843' }}
              onMouseEnter={e => e.currentTarget.style.background = '#e9e8e4'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-[#e1e4e0]">
              <div className="text-right hidden sm:block">
                <p className="text-[14px] font-bold" style={{ color: '#1b1c1a' }}>{user?.fullName}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#737873' }}>{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: '#172a1e' }}>
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1200px] mx-auto px-8 py-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-[48px] font-bold leading-tight theme-text-primary"
                style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}>
                Quiz History
              </h2>
              <p className="text-[18px] mt-1 theme-text-secondary">
                Review your past assessments and track your training progress.
              </p>
            </div>
            <div className="flex gap-4 shrink-0">
              <div className="theme-stat-card px-5 py-4 rounded-xl border flex items-center gap-3">
                <div className="w-12 h-12 rounded-full theme-stat-icon theme-stat-icon--stars">
                  <span className="material-symbols-outlined text-[22px]">stars</span>
                </div>
                <div>
                  <p className="stat-label text-[12px] font-bold uppercase tracking-wider">Avg Score</p>
                  <p className="stat-value text-[24px] font-bold leading-none">{avgScore}%</p>
                </div>
              </div>
              <div className="theme-stat-card px-5 py-4 rounded-xl border flex items-center gap-3">
                <div className="w-12 h-12 rounded-full theme-stat-icon theme-stat-icon--pass">
                  <span className="material-symbols-outlined text-[22px]">task_alt</span>
                </div>
                <div>
                  <p className="stat-label text-[12px] font-bold uppercase tracking-wider">Total Passed</p>
                  <p className="stat-value text-[24px] font-bold leading-none">{totalPassed}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-b border-[#e1e4e0]/40">
            {(['past', 'upcoming'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-8 py-4 text-[14px] font-bold transition-all"
                style={{
                  color: activeTab === tab ? '#172a1e' : '#737873',
                  borderBottom: activeTab === tab ? '2px solid #172a1e' : '2px solid transparent',
                  marginBottom: '-1px',
                }}>
                {tab === 'past' ? 'Past Assessments' : 'Upcoming'}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px]"
                style={{ color: '#737873' }}>search</span>
              <input
                className="w-full pl-12 pr-4 py-3 rounded-xl text-[15px] border outline-none transition-all"
                style={{ background: '#ffffff', borderColor: '#e1e4e0', color: '#1b1c1a' }}
                placeholder="Search quizzes by title or category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={e => { e.target.style.borderColor = '#4f6355'; e.target.style.boxShadow = '0 0 0 3px rgba(79,99,85,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e1e4e0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <button className="px-5 flex items-center gap-2 rounded-xl border text-[14px] font-medium transition-colors"
              style={{ background: '#ffffff', borderColor: '#e1e4e0', color: '#434843' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f4f4f0'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}>
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
              Filter
            </button>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-16" style={{ color: '#737873' }}>
                <p className="text-[16px]">Loading quizzes...</p>
              </div>
            ) : loadError ? (
              <div className="text-center py-16" style={{ color: '#ba1a1a' }}>
                <p className="text-[16px]">{loadError}</p>
              </div>
            ) : displayedQuizzes.length === 0 ? (
              <div className="text-center py-16" style={{ color: '#737873' }}>
                <span className="material-symbols-outlined text-[48px] block mb-3">search_off</span>
                <p className="text-[16px]">
                  {activeTab === 'past'
                    ? 'No completed quizzes yet. Start one from the Upcoming tab.'
                    : 'No upcoming quizzes. Check back after your admin publishes new assessments.'}
                </p>
              </div>
            ) : displayedQuizzes.map(quiz => (
              <div key={quiz.id}
                className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-xl border transition-all duration-300 cursor-pointer"
                style={{ background: '#ffffff', borderColor: 'transparent', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#b6ccba'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(23,42,30,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}>

                <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: quiz.iconBg }}>
                  <span className="material-symbols-outlined text-[32px]" style={{ color: quiz.iconColor }}>
                    {quiz.icon}
                  </span>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-[18px] font-bold mb-1" style={{ color: '#172a1e' }}>{quiz.title}</h4>
                  <p className="text-[13px]" style={{ color: '#737873' }}>
                    {quiz.category} • {activeTab === 'past' ? `Completed ${quiz.dateLabel}` : `Assigned ${quiz.dateLabel}`}
                  </p>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  {activeTab === 'past' ? (
                    <>
                      <div className="text-right">
                        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#737873' }}>Score</p>
                        <p className="text-[24px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
                          {quiz.score}%
                        </p>
                      </div>
                      <div className="hidden md:block w-px h-10" style={{ background: '#e1e4e0' }} />
                      <button className="px-6 py-2 rounded-lg text-[14px] font-bold transition-all"
                        style={{ background: '#2d4033', color: '#d2e8d6' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#172a1e'}
                        onMouseLeave={e => e.currentTarget.style.background = '#2d4033'}
                        onClick={() => navigate(`/employee/quiz/review/${quiz.id}`)}>
                        Review
                      </button>
                    </>
                  ) : (
                    <button
                      className="px-6 py-2 rounded-lg text-[14px] font-bold transition-all"
                      style={{ background: '#172a1e', color: '#ffffff' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#2d4033'}
                      onMouseLeave={e => e.currentTarget.style.background = '#172a1e'}
                      onClick={() => navigate(`/employee/quiz/play/${quiz.quizId}`)}>
                      Start Quiz
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>


        </div>
        <footer className="theme-footer py-10 px-8 mt-8 border-t">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-[20px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>CleanIQ</span>
              <p className="text-[13px] mt-1" style={{ color: '#737873' }}>© 2025 CleanIQ. Purifying spaces, professionally.</p>
            </div>
            <div className="flex gap-8">
              {['Privacy Policy', 'Terms of Service', 'Support'].map(link => (
                <a key={link} href="#" className="text-[12px] font-bold transition-colors" style={{ color: '#737873' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#172a1e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#737873'}>
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
