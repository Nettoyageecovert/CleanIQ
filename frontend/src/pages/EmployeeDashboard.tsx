import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

interface TrainingRecord {
  id: string;
  quizName: string;
  date: string;
  category: string;
  score: number;
  passed: boolean;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  tier: string;
  isCurrentUser?: boolean;
}

const mockTrainingHistory: TrainingRecord[] = [
  { id: '1', quizName: 'Advanced Safety Protocol', date: 'Oct 24, 2024', category: 'Compliance Module', score: 95, passed: true },
  { id: '2', quizName: 'Chemical Handling Basics', date: 'Oct 15, 2024', category: 'Foundation Course', score: 88, passed: true },
  { id: '3', quizName: 'Eco-Friendly Disposal Standards', date: 'Oct 02, 2024', category: 'Environmental Policy', score: 62, passed: false },
];

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Maya Chen', points: 12450, tier: 'DIAMOND' },
  { rank: 2, name: 'You', points: 11820, tier: 'DIAMOND', isCurrentUser: true },
  { rank: 3, name: 'Liam Sterling', points: 11200, tier: 'PLATINUM' },
  { rank: 4, name: 'Sarah Mbeki', points: 10800, tier: 'PLATINUM' },
  { rank: 5, name: 'James Okafor', points: 9500, tier: 'GOLD' },
];

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'daily' | 'weekly'>('weekly');

  const streakDays = 12;
  const circumference = 2 * Math.PI * 78;
  const strokeDashoffset = circumference - ((streakDays / 15) * circumference);
  const firstName = user?.fullName?.split(' ')[0] || 'there';

  return (
    <div className="bg-[#f8f9f7] text-[#1b1c1a] min-h-screen overflow-x-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <Sidebar />

      <main className="lg:ml-72 min-h-screen">

        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 sticky top-0 z-40 border-b border-[#e1e4e0]/30"
          style={{ background: 'rgba(248,249,247,0.8)', backdropFilter: 'blur(20px)' }}>
          <h1 className="text-[24px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
            Dashboard Overview
          </h1>
          <div className="flex items-center gap-6">
            <div className="relative">
              <button className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                style={{ color: '#434843' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e9e8e4'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-[#f8f9f7]"
                style={{ background: '#ba1a1a' }} />
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-[#e1e4e0]">
              <div className="text-right hidden sm:block">
                <p className="text-[14px] font-bold" style={{ color: '#1b1c1a' }}>{user?.fullName}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#737873' }}>{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[16px]"
                style={{ background: '#172a1e' }}>
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="p-8 max-w-[1200px] mx-auto space-y-12">

          {/* Hero Section */}
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
                <button className="font-bold py-3 px-7 rounded-xl transition-all duration-300 flex items-center gap-2"
                  style={{ background: '#d2e8d6', color: '#172a1e' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#ffffff'}
                  onMouseLeave={e => e.currentTarget.style.background = '#d2e8d6'}>
                  <span className="material-symbols-outlined">play_circle</span>
                  Resume Learning
                </button>
                <button className="font-bold py-3 px-7 rounded-xl border transition-all duration-300 flex items-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                  <span className="material-symbols-outlined">sports_esports</span>
                  Join Live Game
                </button>
              </div>
              <div className="absolute right-[-5%] bottom-[-10%] opacity-[0.07] pointer-events-none">
                <span className="material-symbols-outlined text-[300px]">eco</span>
              </div>
            </div>

            {/* Streak Card */}
            <div className="bg-white rounded-xl p-8 border border-[#e1e4e0]/40 flex flex-col items-center justify-center text-center"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="relative w-44 h-44 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 176 176">
                  <circle cx="88" cy="88" r="78" fill="transparent" stroke="#f4f4f0" strokeWidth="10" />
                  <circle cx="88" cy="88" r="78" fill="transparent" stroke="#172a1e"
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[48px] font-bold leading-none" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
                    {streakDays}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737873' }}>Days Streak</span>
                </div>
              </div>
              <h3 className="text-[20px] font-bold mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
                Service Milestone
              </h3>
              <p className="text-[14px]" style={{ color: '#434843' }}>3 days until your next Achievement Badge</p>
            </div>
          </section>

          {/* Training History */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[24px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
                Training History
              </h3>
              <button className="text-[14px] font-bold hover:underline" style={{ color: '#172a1e' }}>View All</button>
            </div>
            <div className="bg-white rounded-xl border border-[#e1e4e0]/40 p-6 md:p-8"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {mockTrainingHistory.map((record, index) => (
                <div key={record.id} className="relative flex gap-6 pb-8"
                  style={{
                    paddingLeft: '52px',
                    borderLeft: index < mockTrainingHistory.length - 1 ? '2px solid #e1e4e0' : '2px solid transparent',
                    marginLeft: '20px',
                  }}>
                  <div className="absolute -left-[21px] top-0 w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: record.passed ? '#d2e8d6' : '#ffdad6' }}>
                    <span className="material-symbols-outlined text-[20px]"
                      style={{ color: record.passed ? '#172a1e' : '#ba1a1a' }}>
                      {record.passed ? 'check_circle' : 'error_outline'}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                    <div>
                      <h4 className="text-[16px] font-bold" style={{ color: '#172a1e' }}>{record.quizName}</h4>
                      <p className="text-[12px] font-bold uppercase tracking-wide mt-1" style={{ color: '#737873' }}>
                        {record.date} • {record.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="block text-[24px] font-bold leading-none"
                          style={{ color: record.passed ? '#172a1e' : '#ba1a1a' }}>
                          {record.score}%
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#737873' }}>Score</span>
                      </div>
                      <span className="px-4 py-1.5 rounded-full text-[12px] font-bold"
                        style={{ background: record.passed ? '#2d4033' : '#ba1a1a', color: record.passed ? '#d2e8d6' : '#ffffff' }}>
                        {record.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Leaderboard */}
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h3 className="text-[24px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
                  Company Leaderboard
                </h3>
                <p className="text-[12px] font-bold uppercase tracking-wide mt-1" style={{ color: '#737873' }}>Top 5 Employees</p>
              </div>
              <div className="inline-flex bg-white p-1 rounded-xl border border-[#e1e4e0]/40">
                {(['daily', 'weekly'] as const).map(period => (
                  <button key={period} onClick={() => setLeaderboardPeriod(period)}
                    className="px-6 py-2 text-[14px] font-bold rounded-lg transition-all"
                    style={{
                      background: leaderboardPeriod === period ? '#172a1e' : 'transparent',
                      color: leaderboardPeriod === period ? '#ffffff' : '#434843',
                    }}>
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#e1e4e0]/40 overflow-hidden"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ background: 'rgba(244,244,240,0.5)' }}>
                      {['Rank', 'Employee', 'Score', 'Tier'].map(h => (
                        <th key={h} className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider" style={{ color: '#737873' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockLeaderboard.map(entry => (
                      <tr key={entry.rank}
                        style={{
                          background: entry.isCurrentUser ? 'rgba(23,42,30,0.04)' : 'transparent',
                          borderLeft: entry.isCurrentUser ? '4px solid #172a1e' : '4px solid transparent',
                          borderBottom: '1px solid rgba(225,228,224,0.3)',
                        }}>
                        <td className="px-8 py-5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                            style={{
                              background: entry.isCurrentUser ? '#172a1e' : entry.rank === 1 ? '#fbddc7' : '#efeeea',
                              color: entry.isCurrentUser ? '#ffffff' : entry.rank === 1 ? '#28180b' : '#434843',
                            }}>
                            {entry.rank}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[14px]"
                              style={{
                                background: entry.isCurrentUser ? '#172a1e' : '#efeeea',
                                color: entry.isCurrentUser ? '#ffffff' : '#434843',
                              }}>
                              {entry.isCurrentUser ? user?.fullName?.charAt(0).toUpperCase() : entry.name.charAt(0)}
                            </div>
                            <span className="font-bold text-[14px]" style={{ color: entry.isCurrentUser ? '#172a1e' : '#1b1c1a' }}>
                              {entry.isCurrentUser ? `${user?.fullName} (You)` : entry.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 font-bold" style={{ color: '#172a1e' }}>
                          {entry.points.toLocaleString()} pts
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-4 py-1.5 rounded-full text-[11px] font-bold"
                            style={{
                              background: entry.tier === 'DIAMOND' ? '#dae8be' : entry.tier === 'PLATINUM' ? '#e3e2df' : '#fbddc7',
                              color: entry.tier === 'DIAMOND' ? '#1f2a0e' : entry.tier === 'PLATINUM' ? '#434843' : '#28180b',
                            }}>
                            {entry.tier}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="py-10 px-8 mt-12 bg-white border-t border-[#e1e4e0]/30">
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