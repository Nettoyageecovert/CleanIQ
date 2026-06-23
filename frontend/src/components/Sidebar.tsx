import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: 'dashboard', icon: 'grid_view', label: 'Dashboard', path: '/employee/dashboard' },
  { id: 'courses', icon: 'local_library', label: 'My Courses', path: '/employee/courses' },
  { id: 'quiz', icon: 'fact_check', label: 'Quiz Center', path: '/employee/quiz' },
  { id: 'analytics', icon: 'monitoring', label: 'Analytics', path: '/employee/analytics' },
  { id: 'settings', icon: 'settings', label: 'Settings', path: '/employee/settings' },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="theme-sidebar hidden lg:flex flex-col h-screen fixed left-0 top-0 py-8 border-r w-72 z-50">
      <div className="px-8 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ background: '#172a1e' }}>
            <span className="material-symbols-outlined text-[20px]" style={{ color: '#ffffff' }}>cleaning_services</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-none text-[20px] theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>CleanIQ</span>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1 theme-muted">Academy</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.id} onClick={() => navigate(item.path)}
              className="w-full rounded-xl px-4 py-3 flex items-center gap-4 transition-all duration-200 text-left"
              style={{
                background: isActive ? '#2d4033' : 'transparent',
                color: isActive ? '#d2e8d6' : 'var(--text-secondary)',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--hover-nav)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
              <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              <span className="text-[14px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 space-y-1">
        <button onClick={handleLogout}
          className="w-full rounded-xl px-4 py-3 flex items-center gap-4 transition-all text-left"
          style={{ color: '#ba1a1a' }}
          onMouseEnter={e => e.currentTarget.style.background = '#ffdad6'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <span className="material-symbols-outlined text-2xl">logout</span>
          <span className="text-[14px] font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}
