import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmployerSidebar from '../components/EmployerSidebar';
import axios from 'axios';

interface Stats {
  publishedCourses: number;
  publishedQuizzes: number;
  totalEnrolled: number;
  avgScore: number;
  totalCourses: number;
  totalQuizzes: number;
}

interface Quiz {
  id: string;
  title: string;
  published: boolean;
  questionCount: number;
  avgScore: number;
  completedCount: number;
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  published: boolean;
  enrolledCount: number;
  createdAt: string;
}

const API = 'http://localhost:5000/api/dashboard';

export default function EmployerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'courses'>('quizzes');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [statsRes, quizzesRes, coursesRes] = await Promise.all([
          axios.get(`${API}/stats`),
          axios.get(`${API}/quizzes`),
          axios.get(`${API}/courses`),
        ]);
        setStats(statsRes.data);
        setQuizzes(quizzesRes.data);
        setCourses(coursesRes.data);
      } catch (err) {
        setError('Could not load dashboard data. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = [
    { label: 'Published Courses', value: stats?.publishedCourses ?? 0, sub: 'Available to employees', icon: 'menu_book', iconBg: '#dae8be', iconColor: '#1f2a0e' },
    { label: 'Published Quizzes', value: stats?.publishedQuizzes ?? 0, sub: 'Linked to training paths', icon: 'quiz', iconBg: '#f8dac5', iconColor: '#574333' },
    { label: 'Total Enrolled', value: stats?.totalEnrolled ?? 0, sub: 'Across all courses', icon: 'group', iconBg: '#d2e8d6', iconColor: '#172a1e' },
    { label: 'Avg Quiz Score', value: stats ? `${stats.avgScore}%` : '0%', sub: 'Across all assessments', icon: 'monitoring', iconBg: '#efeeea', iconColor: '#434843' },
  ];

  return (
    <div className="bg-[#faf9f5] min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <EmployerSidebar />

      <div className="lg:ml-72 flex flex-col min-h-screen">

        {/* Top Bar */}
        <header className="h-20 sticky top-0 z-40 flex items-center justify-between px-8 border-b border-[#e1e4e0]/30"
          style={{ background: 'rgba(250,249,245,0.9)', backdropFilter: 'blur(20px)' }}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737873' }}>
              Employer Console
            </p>
            <h1 className="text-[20px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
              Welcome, {user?.fullName}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
              style={{ color: '#434843' }}
              onMouseEnter={e => e.currentTarget.style.background = '#e9e8e4'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
              style={{ background: '#172a1e' }}>
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-10 max-w-[1200px] mx-auto w-full space-y-8">

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-3 px-5 py-4 rounded-xl"
              style={{ background: '#ffdad6', border: '1px solid #ffb4ab' }}>
              <span className="material-symbols-outlined text-[20px]" style={{ color: '#ba1a1a' }}>warning</span>
              <p className="text-[14px] font-medium" style={{ color: '#93000a' }}>{error}</p>
            </div>
          )}

          {/* Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden p-10"
            style={{ background: 'linear-gradient(135deg, #172a1e 0%, #2d4033 100%)', minHeight: '160px' }}>
            <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full opacity-10 pointer-events-none"
              style={{ background: '#d2e8d6' }} />
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#9eac85' }}>
              Admin Dashboard
            </p>
            <h2 className="text-[32px] font-bold text-white mb-2 max-w-lg"
              style={{ fontFamily: 'Manrope, sans-serif', lineHeight: '1.25' }}>
              Manage training content and monitor rollout from one place.
            </h2>
            <p className="text-[15px] max-w-md" style={{ color: 'rgba(182,204,186,0.85)' }}>
              Publish courses for employees and create quizzes linked to each course.
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map(card => (
              <div key={card.label}
                className="bg-white rounded-2xl p-5 border border-[#e1e4e0]/50 transition-all duration-200"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(23,42,30,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: card.iconBg }}>
                  <span className="material-symbols-outlined text-[20px]" style={{ color: card.iconColor }}>
                    {card.icon}
                  </span>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: '#737873' }}>
                  {card.label}
                </p>
                {loading ? (
                  <div className="h-8 w-16 rounded-lg animate-pulse" style={{ background: '#efeeea' }} />
                ) : (
                  <p className="text-[32px] font-bold leading-none"
                    style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
                    {card.value}
                  </p>
                )}
                <p className="text-[12px] mt-1" style={{ color: '#737873' }}>{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions + Tip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-[#e1e4e0]/50"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 className="text-[16px] font-bold mb-5"
                style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate('/employer/courses')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-bold transition-all"
                  style={{ background: '#172a1e', color: '#ffffff' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2d4033'}
                  onMouseLeave={e => e.currentTarget.style.background = '#172a1e'}>
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  Open Course Management
                </button>
                <button onClick={() => navigate('/employer/quiz-creator')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-bold border transition-all"
                  style={{ borderColor: '#172a1e', color: '#172a1e', background: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f4f4f0'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span className="material-symbols-outlined text-[18px]">quiz</span>
                  Build a Quiz
                </button>
                <button onClick={() => navigate('/employer/analytics')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-bold border transition-all"
                  style={{ borderColor: '#e1e4e0', color: '#434843', background: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f4f4f0'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span className="material-symbols-outlined text-[18px]">monitoring</span>
                  View Analytics
                </button>
              </div>
            </div>

            <div className="rounded-2xl p-6 flex flex-col gap-3" style={{ background: '#dae8be' }}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]"
                  style={{ color: '#1f2a0e', fontVariationSettings: "'FILL' 1" }}>
                  lightbulb
                </span>
                <h3 className="text-[14px] font-bold" style={{ color: '#1f2a0e' }}>Pro Tip</h3>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: '#3f4b2c' }}>
                When creating quizzes, set the <strong>Related Course</strong> to match a published course so employee progress updates automatically.
              </p>
            </div>
          </div>

          {/* Content Table */}
          <div className="bg-white rounded-2xl border border-[#e1e4e0]/50 overflow-hidden"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e1e4e0]/40">
              <div className="flex gap-1">
                {(['quizzes', 'courses'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className="px-5 py-2 rounded-lg text-[14px] font-bold transition-all"
                    style={{
                      background: activeTab === tab ? '#172a1e' : 'transparent',
                      color: activeTab === tab ? '#ffffff' : '#737873',
                    }}>
                    {tab === 'quizzes' ? `Quizzes (${quizzes.length})` : `Courses (${courses.length})`}
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate(activeTab === 'quizzes' ? '/employer/quiz-creator' : '/employer/courses')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all"
                style={{ background: '#f4f4f0', color: '#172a1e' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e9e8e4'}
                onMouseLeave={e => e.currentTarget.style.background = '#f4f4f0'}>
                <span className="material-symbols-outlined text-[16px]">add</span>
                {activeTab === 'quizzes' ? 'New Quiz' : 'New Course'}
              </button>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="p-8 space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: '#f4f4f0' }} />
                ))}
              </div>

            /* Empty — Quizzes */
            ) : activeTab === 'quizzes' && quizzes.length === 0 ? (
              <div className="py-20 text-center">
                <span className="material-symbols-outlined text-[48px] block mb-3" style={{ color: '#c3c8c1' }}>quiz</span>
                <p className="text-[16px] font-bold mb-1" style={{ color: '#1b1c1a' }}>No quizzes yet</p>
                <p className="text-[14px] mb-5" style={{ color: '#737873' }}>Create your first quiz to get started</p>
                <button onClick={() => navigate('/employer/quiz-creator')}
                  className="px-6 py-3 rounded-xl text-[14px] font-bold"
                  style={{ background: '#172a1e', color: '#ffffff' }}>
                  Build a Quiz
                </button>
              </div>

            /* Empty — Courses */
            ) : activeTab === 'courses' && courses.length === 0 ? (
              <div className="py-20 text-center">
                <span className="material-symbols-outlined text-[48px] block mb-3" style={{ color: '#c3c8c1' }}>menu_book</span>
                <p className="text-[16px] font-bold mb-1" style={{ color: '#1b1c1a' }}>No courses yet</p>
                <p className="text-[14px] mb-5" style={{ color: '#737873' }}>Create your first course to get started</p>
                <button onClick={() => navigate('/employer/courses')}
                  className="px-6 py-3 rounded-xl text-[14px] font-bold"
                  style={{ background: '#172a1e', color: '#ffffff' }}>
                  Create a Course
                </button>
              </div>

            /* Quizzes Table */
            ) : activeTab === 'quizzes' ? (
              <div>
                <div className="grid px-6 py-3 text-[11px] font-bold uppercase tracking-wider border-b border-[#e1e4e0]/40"
                  style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', color: '#737873' }}>
                  <span>Quiz Title</span>
                  <span>Questions</span>
                  <span>Completed</span>
                  <span>Avg Score</span>
                  <span>Status</span>
                </div>
                {quizzes.map(quiz => (
                  <div key={quiz.id}
                    className="grid px-6 py-4 border-b border-[#e1e4e0]/30 items-center last:border-0 transition-all"
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#faf9f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: '#f4f4f0' }}>
                        <span className="material-symbols-outlined text-[16px]" style={{ color: '#434843' }}>quiz</span>
                      </div>
                      <span className="text-[14px] font-medium" style={{ color: '#1b1c1a' }}>{quiz.title}</span>
                    </div>
                    <span className="text-[14px]" style={{ color: '#434843' }}>{quiz.questionCount} Qs</span>
                    <span className="text-[14px]" style={{ color: '#434843' }}>{quiz.completedCount}</span>
                    <span className="text-[14px] font-bold"
                      style={{ color: quiz.avgScore >= 80 ? '#172a1e' : quiz.avgScore >= 60 ? '#f4a261' : quiz.avgScore > 0 ? '#ba1a1a' : '#737873' }}>
                      {quiz.avgScore > 0 ? `${quiz.avgScore}%` : '—'}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold w-fit"
                      style={{ background: quiz.published ? '#d2e8d6' : '#efeeea', color: quiz.published ? '#172a1e' : '#737873' }}>
                      {quiz.published ? '● Published' : '○ Draft'}
                    </span>
                  </div>
                ))}
              </div>

            /* Courses Table */
            ) : (
              <div>
                <div className="grid px-6 py-3 text-[11px] font-bold uppercase tracking-wider border-b border-[#e1e4e0]/40"
                  style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', color: '#737873' }}>
                  <span>Course Title</span>
                  <span>Category</span>
                  <span>Difficulty</span>
                  <span>Enrolled</span>
                  <span>Status</span>
                </div>
                {courses.map(course => (
                  <div key={course.id}
                    className="grid px-6 py-4 border-b border-[#e1e4e0]/30 items-center last:border-0 transition-all"
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#faf9f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: '#f4f4f0' }}>
                        <span className="material-symbols-outlined text-[16px]" style={{ color: '#434843' }}>menu_book</span>
                      </div>
                      <span className="text-[14px] font-medium" style={{ color: '#1b1c1a' }}>{course.title}</span>
                    </div>
                    <span className="text-[14px]" style={{ color: '#434843' }}>{course.category}</span>
                    <span className="text-[14px]" style={{ color: '#434843' }}>{course.difficulty}</span>
                    <span className="text-[14px]" style={{ color: '#434843' }}>{course.enrolledCount}</span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold w-fit"
                      style={{ background: course.published ? '#d2e8d6' : '#efeeea', color: course.published ? '#172a1e' : '#737873' }}>
                      {course.published ? '● Published' : '○ Draft'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-8 py-8 px-8 bg-white border-t border-[#e1e4e0]/30">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]" style={{ color: '#172a1e' }}>cleaning_services</span>
              <span className="text-[16px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>CleanIQ</span>
            </div>
            <p className="text-[12px]" style={{ color: '#737873' }}>© 2025 CleanIQ. Purifying spaces, professionally.</p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Help Center'].map(link => (
                <a key={link} href="#" className="text-[12px] font-medium transition-colors" style={{ color: '#737873' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#172a1e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#737873'}>
                  {link}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}