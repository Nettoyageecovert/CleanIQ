import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'completed' | 'in-progress' | 'not-started';
  required?: boolean;
  color: string;
  icon: string;
}

const mockCourses: Course[] = [
  {
    id: '1', title: 'Safety Protocols 101',
    description: 'Essential guidelines for chemical handling and occupational hazard prevention in residential spaces.',
    progress: 85, status: 'in-progress', required: true, color: '#d2e8d6', icon: 'health_and_safety',
  },
  {
    id: '2', title: 'Eco-Friendly Disposal',
    description: 'Advanced techniques for waste management and sustainable product lifecycle in professional cleaning.',
    progress: 32, status: 'in-progress', color: '#dae8be', icon: 'recycling',
  },
  {
    id: '3', title: 'Textile Care Mastery',
    description: 'Specialized knowledge on treating delicate fabrics and high-end upholstery using botanical solutions.',
    progress: 0, status: 'not-started', color: '#efeeea', icon: 'dry_cleaning',
  },
  {
    id: '4', title: 'Botanical Chemistry',
    description: 'Understanding the molecular power of plant-based surfactants in deep cleaning applications.',
    progress: 15, status: 'in-progress', color: '#f8dac5', icon: 'science',
  },
  {
    id: '5', title: 'Floor Care Excellence',
    description: 'Master the art of restoring and maintaining all types of flooring from hardwood to marble.',
    progress: 100, status: 'completed', color: '#b6ccba', icon: 'floor',
  },
];

type FilterType = 'all' | 'in-progress' | 'completed';
type SortType = 'recent' | 'title' | 'progress';

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const featuredCourse = mockCourses[0];
  const overallProgress = Math.round(mockCourses.reduce((sum, c) => sum + c.progress, 0) / mockCourses.length);

  const filteredCourses = mockCourses
    .filter(c => {
      if (filter === 'in-progress') return c.status === 'in-progress';
      if (filter === 'completed') return c.status === 'completed';
      return true;
    })
    .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      if (sort === 'progress') return b.progress - a.progress;
      return 0;
    });

  const getStatusLabel = (course: Course) => {
    if (course.status === 'completed') return 'Completed';
    if (course.status === 'not-started') return 'Not Started';
    return `${course.progress}% Complete`;
  };

  const getProgressColor = (course: Course) => {
    if (course.status === 'completed') return '#172a1e';
    if (course.status === 'not-started') return '#c3c8c1';
    return '#705a49';
  };

  return (
    <div className="theme-page min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <Sidebar />

      <main className="lg:ml-72 min-h-screen flex flex-col">
        <header className="theme-header-bar h-20 flex items-center justify-between px-8 sticky top-0 z-40 border-b">
          <h1 className="text-[24px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
            My Courses
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]" style={{ color: '#737873' }}>search</span>
              <input
                className="pl-10 pr-4 py-2 rounded-full text-[14px] border w-64 outline-none transition-all"
                style={{ background: '#efeeea', borderColor: 'transparent', color: '#1b1c1a' }}
                placeholder="Search training..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={e => { e.target.style.borderColor = '#4f6355'; e.target.style.background = '#ffffff'; }}
                onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#efeeea'; }}
              />
            </div>
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
        <section className="px-8 pt-6 pb-10">
          <div className="relative w-full h-[320px] rounded-[24px] overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #172a1e 0%, #2d4033 60%, #344022 100%)' }}>
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-10" style={{ background: '#d2e8d6' }} />
            <div className="absolute inset-0 flex flex-col justify-center px-12">
              <div className="max-w-xl">
                <span className="inline-block px-4 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider mb-4"
                  style={{ background: '#dae8be', color: '#1f2a0e' }}>
                  Currently Learning
                </span>
                <h2 className="text-[36px] font-bold leading-tight mb-3 text-white"
                  style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {featuredCourse.title}
                </h2>
                <p className="text-[15px] mb-6" style={{ color: 'rgba(182,204,186,0.85)' }}>
                  {featuredCourse.description}
                </p>
                <div className="flex items-center gap-4">
                  <button className="px-6 py-3 rounded-full font-bold text-[14px] flex items-center gap-2 transition-all"
                    style={{ background: '#d2e8d6', color: '#172a1e' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ffffff'}
                    onMouseLeave={e => e.currentTarget.style.background = '#d2e8d6'}>
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                    Resume Learning
                  </button>
                  <button className="px-6 py-3 rounded-full font-bold text-[14px] border transition-all"
                    style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                    Join Live Game
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute bottom-6 right-6 p-4 rounded-2xl w-56"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Overall Progress</span>
                <span className="text-[14px] font-bold text-white">{overallProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <div className="h-full rounded-full" style={{ width: `${overallProgress}%`, background: '#d2e8d6' }} />
              </div>
            </div>
          </div>
        </section>
        <section className="px-8 pb-12 max-w-[1200px] mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="theme-filter-tabs">
              {([['all', 'All Courses'], ['in-progress', 'In Progress'], ['completed', 'Completed']] as const).map(([val, label]) => (
                <button key={val} onClick={() => setFilter(val)}
                  className={`theme-filter-tabs__tab ${filter === val ? 'theme-filter-tabs__tab--active' : ''}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] theme-muted">Sort by:</span>
              <select className="text-[14px] font-bold border-none bg-transparent outline-none cursor-pointer theme-text-primary"
                value={sort} onChange={e => setSort(e.target.value as SortType)}>
                <option value="recent">Recently Accessed</option>
                <option value="title">Title A–Z</option>
                <option value="progress">Progress</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <div key={course.id}
                className="bg-white rounded-[20px] overflow-hidden border border-[#e1e4e0]/60 flex flex-col cursor-pointer transition-all duration-300"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(45,64,51,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}>
                <div className="h-44 relative flex items-center justify-center theme-course-hero" style={{ background: course.color }}>
                  <span className="material-symbols-outlined text-[72px]">
                    {course.icon}
                  </span>
                  {course.required && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-[12px] font-bold"
                      style={{ background: '#172a1e', color: '#ffffff' }}>
                      Required
                    </div>
                  )}
                  {course.status === 'completed' && (
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: '#172a1e' }}>
                      <span className="material-symbols-outlined text-[18px]" style={{ color: '#d2e8d6' }}>check</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-[18px] font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
                    {course.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed flex-1 mb-4" style={{ color: '#434843' }}>
                    {course.description}
                  </p>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[12px] font-medium" style={{ color: '#737873' }}>{getStatusLabel(course)}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: '#efeeea' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${course.progress}%`, background: getProgressColor(course) }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
          </div>
        </section>
        <footer className="theme-footer py-10 px-8 mt-auto border-t">
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