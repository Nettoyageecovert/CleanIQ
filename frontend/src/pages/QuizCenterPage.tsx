import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

interface QuizRecord {
  id: string;
  title: string;
  category: string;
  completedDate: string;
  score: number;
  icon: string;
  iconBg: string;
  iconColor: string;
}

const mockQuizHistory: QuizRecord[] = [
  { id: '1', title: 'Eco-Friendly Solvents: Safety Protocols', category: 'Internal Certification', completedDate: 'Oct 24, 2024', score: 98, icon: 'eco', iconBg: '#dae8be', iconColor: '#3f4b2c' },
  { id: '2', title: 'Residential Sanitation Tier II', category: 'Annual Compliance', completedDate: 'Oct 12, 2024', score: 85, icon: 'home_health', iconBg: '#fbddc7', iconColor: '#574333' },
  { id: '3', title: 'Advanced Stewardship Ethics', category: 'Leadership Series', completedDate: 'Sep 30, 2024', score: 100, icon: 'workspace_premium', iconBg: '#d2e8d6', iconColor: '#384b3e' },
  { id: '4', title: 'Microbial Bio-Remediation Basics', category: 'Technical Skillset', completedDate: 'Sep 15, 2024', score: 92, icon: 'science', iconBg: '#e3e2df', iconColor: '#434843' },
];

const mockUpcoming: QuizRecord[] = [
  { id: '5', title: 'Chemical Storage Best Practices', category: 'Safety Module', completedDate: 'Due Dec 01, 2024', score: 0, icon: 'inventory_2', iconBg: '#f8dac5', iconColor: '#574333' },
  { id: '6', title: 'Floor Care & Surface Protection', category: 'Technical Skillset', completedDate: 'Due Dec 15, 2024', score: 0, icon: 'floor', iconBg: '#dae8be', iconColor: '#3f4b2c' },
];

export default function QuizCenterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'past' | 'upcoming'>('past');
  const [searchQuery, setSearchQuery] = useState('');

  const avgScore = Math.round(mockQuizHistory.reduce((s, q) => s + q.score, 0) / mockQuizHistory.length);
  const totalPassed = mockQuizHistory.filter(q => q.score >= 70).length;

  const displayedQuizzes = (activeTab === 'past' ? mockQuizHistory : mockUpcoming)
    .filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="bg-[#faf9f5] text-[#1b1c1a] min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <Sidebar />

      <main className="lg:ml-72 min-h-screen">

        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 sticky top-0 z-40 border-b border-[#e1e4e0]/30"
          style={{ background: 'rgba(250,249,245,0.8)', backdropFilter: 'blur(20px)' }}>
          <h1 className="text-[24px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
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

          {/* Page Title + Stats */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-[48px] font-bold leading-tight"
                style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e', letterSpacing: '-0.02em' }}>
                Quiz History
              </h2>
              <p className="text-[18px] mt-1" style={{ color: '#434843' }}>
                Review your past assessments and track your training progress.
              </p>
            </div>
            <div className="flex gap-4 shrink-0">
              <div className="px-5 py-4 rounded-xl border border-[#e1e4e0]/40 flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#2d4033' }}>
                  <span className="material-symbols-outlined text-[22px]" style={{ color: '#b6ccba' }}>stars</span>
                </div>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: '#737873' }}>Avg Score</p>
                  <p className="text-[24px] font-bold leading-none" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>{avgScore}%</p>
                </div>
              </div>
              <div className="px-5 py-4 rounded-xl border border-[#e1e4e0]/40 flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#f8dac5' }}>
                  <span className="material-symbols-outlined text-[22px]" style={{ color: '#574333' }}>task_alt</span>
                </div>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: '#737873' }}>Total Passed</p>
                  <p className="text-[24px] font-bold leading-none" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>{totalPassed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
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

          {/* Search + Filter */}
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

          {/* Quiz List */}
          <div className="space-y-3">
            {displayedQuizzes.length === 0 ? (
              <div className="text-center py-16" style={{ color: '#737873' }}>
                <span className="material-symbols-outlined text-[48px] block mb-3">search_off</span>
                <p className="text-[16px]">No quizzes found matching your search.</p>
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
                    {quiz.category} • {activeTab === 'past' ? `Completed ${quiz.completedDate}` : quiz.completedDate}
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
                        onClick={() => navigate('/employee/quiz/review')}>
                        Review
                      </button>
                    </>
                  ) : (
                    <button
                      className="px-6 py-2 rounded-lg text-[14px] font-bold transition-all"
                      style={{ background: '#172a1e', color: '#ffffff' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#2d4033'}
                      onMouseLeave={e => e.currentTarget.style.background = '#172a1e'}
                      onClick={() => navigate('/employee/quiz/play')}>
                      Start Quiz
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            <div className="lg:col-span-2 relative h-52 rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #172a1e 0%, #344022 100%)' }}>
              <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full opacity-10" style={{ background: '#d2e8d6' }} />
              <div className="absolute inset-0 flex flex-col justify-center px-10">
                <h5 className="text-[22px] font-bold text-white mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Mastered Your Current Path?
                </h5>
                <p className="text-[15px] mb-4 max-w-md" style={{ color: 'rgba(182,204,186,0.9)' }}>
                  Your consistent high scores place you in the top 5% of employees. Unlock senior certification modules today.
                </p>
                <a href="#" className="inline-flex items-center gap-2 font-bold text-[14px]" style={{ color: '#d2e8d6' }}>
                  View New Modules
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </a>
              </div>
            </div>
            <div className="rounded-2xl p-6 flex flex-col justify-between"
              style={{ background: '#efeeea', border: '1px solid rgba(195,200,193,0.3)' }}>
              <div>
                <span className="material-symbols-outlined text-[40px] mb-3 block" style={{ color: '#172a1e' }}>auto_awesome</span>
                <h5 className="text-[18px] font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
                  Learning Insight
                </h5>
                <p className="text-[14px] leading-relaxed" style={{ color: '#434843' }}>
                  You typically perform 12% better on quizzes taken before 10:00 AM. Keep up the morning routine!
                </p>
              </div>
              <button className="mt-4 text-[14px] font-bold flex items-center gap-2" style={{ color: '#172a1e' }}>
                Detailed Stats
                <span className="material-symbols-outlined text-[18px]">analytics</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-10 px-8 mt-8 bg-white border-t border-[#e1e4e0]/30">
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