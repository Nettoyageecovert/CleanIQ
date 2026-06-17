import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-[#faf9f5] min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <Sidebar />

      <main className="lg:ml-72 min-h-screen flex flex-col">

        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 sticky top-0 z-40 border-b border-[#e1e4e0]/30"
          style={{ background: 'rgba(250,249,245,0.8)', backdropFilter: 'blur(20px)' }}>
          <h1 className="text-[24px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
            Settings
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

        {/* Body */}
        <div className="flex-grow max-w-[1200px] mx-auto w-full px-8 py-10">
          <div className="mb-8">
            <h2 className="text-[32px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
              Settings
            </h2>
            <p className="text-[16px] mt-1" style={{ color: '#434843' }}>
              Manage your account preferences and professional status.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-6">

            {/* Profile Card */}
            <section className="col-span-12 lg:col-span-8 bg-white rounded-xl p-8 border border-[#e1e4e0]/40 flex flex-col md:flex-row items-center gap-8 transition-all duration-300"
              style={{ boxShadow: '0 8px 30px rgba(45,64,51,0.06)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-full flex items-center justify-center text-white text-[48px] font-bold border-4"
                  style={{ background: '#172a1e', borderColor: '#d2e8d6' }}>
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: '#172a1e' }}>
                  <span className="material-symbols-outlined text-[16px]" style={{ color: '#ffffff' }}>verified</span>
                </div>
              </div>
              <div className="flex-grow text-center md:text-left">
                <h3 className="text-[24px] font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
                  {user?.fullName}
                </h3>
                <p className="text-[14px] mb-3" style={{ color: '#737873' }}>{user?.email}</p>
               
              </div>
              <div className="shrink-0">
                <button className="px-6 py-2 rounded-lg text-[14px] font-bold border transition-all"
                  style={{ borderColor: '#705a49', color: '#705a49' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(112,90,73,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  Edit Profile
                </button>
              </div>
            </section>

            

            {/* Account Settings */}
            <section className="col-span-12 md:col-span-6 bg-white rounded-xl p-8 border border-[#e1e4e0]/40 transition-all duration-300"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-[22px]" style={{ color: '#705a49' }}>manage_accounts</span>
                <h4 className="text-[20px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
                  Account Settings
                </h4>
              </div>
              <ul className="space-y-2">
                {[
                  { icon: 'mail', label: 'Email Notifications', sublabel: 'Manage quiz and training alerts' },
                  { icon: 'lock', label: 'Change Password', sublabel: 'Update your login credentials' },
                  { icon: 'person', label: 'Edit Profile Info', sublabel: 'Update your name and details' },
                  
                ].map(item => (
                  <li key={item.label}>
                    <button className="w-full flex items-center justify-between p-4 rounded-xl transition-colors text-left group"
                      onMouseEnter={e => e.currentTarget.style.background = '#f4f4f0'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-[20px]" style={{ color: '#434843' }}>{item.icon}</span>
                        <div>
                          <p className="text-[14px] font-medium" style={{ color: '#1b1c1a' }}>{item.label}</p>
                          <p className="text-[12px]" style={{ color: '#737873' }}>{item.sublabel}</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1"
                        style={{ color: '#737873' }}>chevron_right</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* Preferences */}
            <section className="col-span-12 md:col-span-6 bg-white rounded-xl p-8 border border-[#e1e4e0]/40 transition-all duration-300"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-[22px]" style={{ color: '#705a49' }}>palette</span>
                <h4 className="text-[20px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
                  Preferences
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#f4f4f0' }}>
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[20px]" style={{ color: '#434843' }}>
                      {darkMode ? 'dark_mode' : 'light_mode'}
                    </span>
                    <div>
                      <p className="text-[14px] font-medium" style={{ color: '#1b1c1a' }}>Dark Mode</p>
                      <p className="text-[12px]" style={{ color: '#737873' }}>Adjust the app's visual theme</p>
                    </div>
                  </div>
                  <button onClick={() => setDarkMode(v => !v)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    style={{ background: darkMode ? '#172a1e' : '#c3c8c1' }}>
                    <span className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                      style={{ transform: darkMode ? 'translateX(24px)' : 'translateX(4px)' }} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#f4f4f0' }}>
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[20px]" style={{ color: '#434843' }}>notifications</span>
                    <div>
                      <p className="text-[14px] font-medium" style={{ color: '#1b1c1a' }}>Email Notifications</p>
                      <p className="text-[12px]" style={{ color: '#737873' }}>Quiz reminders and results</p>
                    </div>
                  </div>
                  <button onClick={() => setEmailNotifications(v => !v)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    style={{ background: emailNotifications ? '#172a1e' : '#c3c8c1' }}>
                    <span className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                      style={{ transform: emailNotifications ? 'translateX(24px)' : 'translateX(4px)' }} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#f4f4f0' }}>
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[20px]" style={{ color: '#434843' }}>language</span>
                    <div>
                      <p className="text-[14px] font-medium" style={{ color: '#1b1c1a' }}>Language</p>
                      <p className="text-[12px]" style={{ color: '#737873' }}>English (Default)</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[20px]" style={{ color: '#737873' }}>chevron_right</span>
                </div>
              </div>
            </section>

            
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto py-8 px-8 bg-white border-t border-[#e1e4e0]/30">
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