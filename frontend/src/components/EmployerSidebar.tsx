import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/employer/dashboard' },
  { icon: 'menu_book', label: 'Course Management', path: '/employer/courses' },
  { icon: 'quiz', label: 'Quiz Creator', path: '/employer/quiz-creator' },
  { icon: 'monitoring', label: 'Analytics', path: '/employer/analytics' },
];

export default function EmployerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isSettingsActive = location.pathname === '/employer/settings';

  return (
    <aside className="theme-sidebar theme-sidebar-employer fixed left-0 top-0 h-full w-72 flex flex-col z-50 overflow-y-auto border-r"
      style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <div className="px-6 pt-6 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#172a1e' }}>
            <span className="material-symbols-outlined text-[22px]" style={{ color: '#d2e8d6' }}>cleaning_services</span>
          </div>
          <div>
            <h2 className="text-[18px] font-bold leading-none theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
              CleanIQ
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-wider mt-0.5 theme-muted">Admin Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200"
              style={{
                background: isActive ? '#172a1e' : 'transparent',
                color: isActive ? '#d2e8d6' : 'var(--text-secondary)',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--hover-nav-employer)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
              <span className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span className="text-[14px] font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#d2e8d6' }} />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mx-6 my-4 border-t" style={{ borderColor: 'var(--border)' }} />

      <div className="px-3 pb-6 space-y-1">
        <button onClick={() => navigate('/employer/settings')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
          style={{
            background: isSettingsActive ? '#172a1e' : 'transparent',
            color: isSettingsActive ? '#d2e8d6' : 'var(--text-secondary)',
          }}
          onMouseEnter={e => { if (!isSettingsActive) e.currentTarget.style.background = 'var(--hover-nav-employer)'; }}
          onMouseLeave={e => { if (!isSettingsActive) e.currentTarget.style.background = 'transparent'; }}>
          <span className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: isSettingsActive ? "'FILL' 1" : "'FILL' 0" }}>
            settings
          </span>
          <span className="text-[14px] font-medium">Settings</span>
        </button>

        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
          style={{ color: '#ba1a1a' }}
          onMouseEnter={e => e.currentTarget.style.background = '#ffdad6'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <span className="material-symbols-outlined text-[22px]">logout</span>
          <span className="text-[14px] font-medium">Log out</span>
        </button>

        <div className="theme-panel flex items-center gap-3 px-4 py-3 mt-2 rounded-xl">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0"
            style={{ background: '#172a1e', color: '#d2e8d6' }}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold truncate theme-text-primary">{user?.fullName}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider theme-muted">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
