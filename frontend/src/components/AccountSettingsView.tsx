import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { changePassword, updateProfile } from '../api/auth';
import { LANGUAGE_OPTIONS, type Language } from '../utils/userPrefs';
import { useTranslation } from '../i18n/useTranslation';

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message as string;
  }
  return fallback;
}

interface AccountSettingsViewProps {
  variant: 'employee' | 'employer';
}

export default function AccountSettingsView({ variant }: AccountSettingsViewProps) {
  const { user, updateUser, logout } = useAuth();
  const { prefs, setDarkMode, setEmailNotifications, setLanguage } = usePreferences();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const [editName, setEditName] = useState(user?.fullName ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [toast, setToast] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const isEmployer = variant === 'employer';
  const accountLabel = isEmployer ? 'Admin Account' : 'Employee Account';
  const activeDesc = isEmployer ? 'Admin account in good standing' : 'Training account in good standing';
  const logoutPath = isEmployer ? '/admin/login' : '/login';

  useEffect(() => {
    setEditName(user?.fullName ?? '');
  }, [user?.fullName]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 3500);
  };

  const handleLogout = () => {
    logout();
    navigate(logoutPath);
  };

  const handleSaveProfile = async () => {
    const trimmed = editName.trim();
    if (trimmed.length < 2) {
      setProfileError('Name must be at least 2 characters.');
      return;
    }

    setProfileSaving(true);
    setProfileError('');
    try {
      const { user: updatedUser } = await updateProfile(trimmed);
      updateUser(updatedUser);
      setShowEditProfile(false);
      showToast('Profile updated successfully.');
    } catch (error) {
      setProfileError(getErrorMessage(error, 'Failed to update profile.'));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8 || !/(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      setPasswordError('New password must be at least 8 characters with letters and numbers.');
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully.');
    } catch (error) {
      setPasswordError(getErrorMessage(error, 'Failed to change password.'));
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLanguageSelect = (language: Language) => {
    setLanguage(language);
    setShowLanguagePicker(false);
    const label = language === 'fr' ? t('language.fr') : t('language.en');
    showToast(`${t('settings.languageUpdated')} ${label}.`);
  };

  const selectedLanguageLabel = prefs.language === 'fr' ? t('language.fr') : t('language.en');

  const accountActions = [
    { icon: 'person', label: 'Edit Profile Info', sublabel: 'Update your display name', action: () => { setProfileError(''); setShowEditProfile(true); } },
    { icon: 'lock', label: 'Change Password', sublabel: 'Update your login password', action: () => { setPasswordError(''); setShowChangePassword(true); } },
    ...(isEmployer ? [] : [{
      icon: 'monitoring',
      label: 'View Analytics',
      sublabel: 'See your training performance',
      action: () => navigate('/employee/analytics'),
    }]),
  ];

  return (
    <>
      <header className="theme-header-bar theme-header h-20 flex items-center justify-between px-8 sticky top-0 z-40 border-b">
        <h1 className="text-[24px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {t('settings.title')}
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-4 border-l" style={{ borderColor: 'var(--border)' }}>
            <div className="text-right hidden sm:block">
              <p className="text-[14px] font-bold theme-text-primary">{user?.fullName}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider theme-muted">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: '#172a1e' }}>
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-grow max-w-[1200px] mx-auto w-full px-8 py-10">
        <div className="mb-8">
          <h2 className="text-[32px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Account Settings
          </h2>
          <p className="text-[16px] mt-1 theme-text-secondary">
            Manage your profile, preferences, and account security.
          </p>
          {toast && (
            <p className="text-[14px] mt-3 font-medium px-4 py-2 rounded-lg inline-block"
              style={{ background: '#d2e8d6', color: '#172a1e' }}>
              {toast}
            </p>
          )}
        </div>

        <div className="grid grid-cols-12 gap-6">
          <section className="theme-card col-span-12 lg:col-span-8 rounded-xl p-8 border flex flex-col md:flex-row items-center gap-8"
            style={{ boxShadow: '0 8px 30px rgba(45,64,51,0.06)', borderColor: 'var(--border-subtle)' }}>
            <div className="relative shrink-0">
              <div className="w-32 h-32 rounded-full flex items-center justify-center text-white text-[48px] font-bold border-4"
                style={{ background: '#172a1e', borderColor: '#d2e8d6' }}>
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-[24px] font-bold mb-2 theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {user?.fullName}
              </h3>
              <p className="text-[14px] mb-1 theme-muted">{user?.email}</p>
              <p className="text-[12px] font-bold uppercase tracking-wider theme-text-secondary">{accountLabel}</p>
            </div>
            <div className="shrink-0">
              <button onClick={() => { setProfileError(''); setShowEditProfile(true); }}
                className="px-6 py-2 rounded-lg text-[14px] font-bold border transition-all"
                style={{ borderColor: '#705a49', color: '#705a49' }}>
                Edit Profile
              </button>
            </div>
          </section>

          <section className="theme-card col-span-12 lg:col-span-4 rounded-xl p-8 border"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderColor: 'var(--border-subtle)' }}>
            <h4 className="text-[16px] font-bold mb-4 theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Account Status
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--accent-green)' }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: '#172a1e' }}>shield</span>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: '#172a1e' }}>Active</p>
                  <p className="text-[11px] theme-text-secondary">{activeDesc}</p>
                </div>
              </div>
              <div className="theme-panel flex items-center gap-3 p-3 rounded-xl">
                <span className="material-symbols-outlined text-[20px] theme-text-secondary">notifications</span>
                <div>
                  <p className="text-[13px] font-bold theme-text-primary">Email alerts</p>
                  <p className="text-[11px] theme-muted">
                    {prefs.emailNotifications ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="theme-card col-span-12 md:col-span-6 rounded-xl p-8 border"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-[22px]" style={{ color: '#705a49' }}>manage_accounts</span>
              <h4 className="text-[20px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>Account</h4>
            </div>
            <ul className="space-y-2">
              {accountActions.map(item => (
                <li key={item.label}>
                  <button onClick={item.action}
                    className="w-full flex items-center justify-between p-4 rounded-xl transition-colors text-left"
                    style={{ background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-panel)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-[20px] theme-text-secondary">{item.icon}</span>
                      <div>
                        <p className="text-[14px] font-medium theme-text-primary">{item.label}</p>
                        <p className="text-[12px] theme-muted">{item.sublabel}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[20px] theme-muted">chevron_right</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="theme-card col-span-12 md:col-span-6 rounded-xl p-8 border"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-[22px]" style={{ color: '#705a49' }}>palette</span>
              <h4 className="text-[20px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>{t('settings.preferences')}</h4>
            </div>
            <div className="space-y-3">
              <div className="theme-panel flex items-center justify-between p-4 rounded-xl">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-[20px] theme-text-secondary">
                    {prefs.darkMode ? 'dark_mode' : 'light_mode'}
                  </span>
                  <div>
                    <p className="text-[14px] font-medium theme-text-primary">{t('settings.darkMode')}</p>
                    <p className="text-[12px] theme-muted">
                      {prefs.darkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setDarkMode(!prefs.darkMode)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  style={{ background: prefs.darkMode ? '#172a1e' : '#c3c8c1' }}>
                  <span className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                    style={{ transform: prefs.darkMode ? 'translateX(24px)' : 'translateX(4px)' }} />
                </button>
              </div>

              <div className="theme-panel flex items-center justify-between p-4 rounded-xl">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-[20px] theme-text-secondary">notifications</span>
                  <div>
                    <p className="text-[14px] font-medium theme-text-primary">Email Notifications</p>
                    <p className="text-[12px] theme-muted">
                      {prefs.emailNotifications ? 'Quiz reminders and results on' : 'Email alerts turned off'}
                    </p>
                  </div>
                </div>
                <button onClick={() => {
                  const next = !prefs.emailNotifications;
                  setEmailNotifications(next);
                  showToast(next ? 'Email notifications enabled.' : 'Email notifications disabled.');
                }}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  style={{ background: prefs.emailNotifications ? '#172a1e' : '#c3c8c1' }}>
                  <span className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                    style={{ transform: prefs.emailNotifications ? 'translateX(24px)' : 'translateX(4px)' }} />
                </button>
              </div>

              <button onClick={() => setShowLanguagePicker(true)}
                className="theme-panel w-full flex items-center justify-between p-4 rounded-xl text-left transition-colors"
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-nav)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-panel)'; }}>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-[20px] theme-text-secondary">language</span>
                  <div>
                    <p className="text-[14px] font-medium theme-text-primary">{t('settings.language')}</p>
                    <p className="text-[12px] theme-muted">{selectedLanguageLabel}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[20px] theme-muted">chevron_right</span>
              </button>
            </div>
          </section>

          <section className="theme-card col-span-12 rounded-xl p-8 border"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderColor: 'rgba(255, 218, 214, 0.6)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-[18px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#ba1a1a' }}>
                  Sign Out
                </h4>
                <p className="text-[14px] mt-1 theme-text-secondary">
                  End your session on this device.
                </p>
              </div>
              <button onClick={() => setShowLogoutConfirm(true)}
                className="px-6 py-2.5 rounded-lg text-[14px] font-bold transition-all shrink-0"
                style={{ background: '#ffdad6', color: '#ba1a1a' }}>
                Log Out
              </button>
            </div>
          </section>
        </div>
      </div>

      <footer className="theme-footer theme-card mt-auto py-8 px-8 border-t">
        <div className="max-w-[1200px] mx-auto">
          <span className="text-[20px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>CleanIQ</span>
        </div>
      </footer>

      {showEditProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: 'rgba(27,28,26,0.5)' }}
          onClick={() => setShowEditProfile(false)}>
          <div className="theme-card w-full max-w-md rounded-2xl p-8"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-[22px] font-bold mb-6 theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>Edit Profile</h3>
            {profileError && (
              <p className="text-[14px] mb-4 px-3 py-2 rounded-lg" style={{ background: '#ffdad6', color: '#ba1a1a' }}>
                {profileError}
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider block mb-2 theme-text-secondary">Full Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                  className="theme-input w-full px-4 py-3 rounded-xl text-[15px] border outline-none" />
              </div>
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider block mb-2 theme-text-secondary">Email</label>
                <input type="email" value={user?.email ?? ''} disabled
                  className="w-full px-4 py-3 rounded-xl text-[15px] border outline-none opacity-60 cursor-not-allowed theme-panel" />
                <p className="text-[12px] mt-1 theme-muted">Email cannot be changed here.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowEditProfile(false)} disabled={profileSaving}
                className="flex-1 py-3 rounded-xl text-[14px] font-bold border theme-text-secondary"
                style={{ borderColor: 'var(--border)' }}>
                Cancel
              </button>
              <button onClick={handleSaveProfile} disabled={profileSaving}
                className="flex-1 py-3 rounded-xl text-[14px] font-bold disabled:opacity-60"
                style={{ background: '#172a1e', color: '#ffffff' }}>
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangePassword && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: 'rgba(27,28,26,0.5)' }}
          onClick={() => setShowChangePassword(false)}>
          <div className="theme-card w-full max-w-md rounded-2xl p-8"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-[22px] font-bold mb-2 theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>Change Password</h3>
            <p className="text-[14px] mb-6 theme-muted">
              Enter your current password, then choose a new one.
            </p>
            {passwordError && (
              <p className="text-[14px] mb-4 px-3 py-2 rounded-lg" style={{ background: '#ffdad6', color: '#ba1a1a' }}>
                {passwordError}
              </p>
            )}
            <div className="space-y-4">
              {[
                { label: 'Current Password', value: currentPassword, setter: setCurrentPassword },
                { label: 'New Password', value: newPassword, setter: setNewPassword },
                { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword },
              ].map(field => (
                <div key={field.label}>
                  <label className="text-[12px] font-bold uppercase tracking-wider block mb-2 theme-text-secondary">{field.label}</label>
                  <input type="password" value={field.value}
                    onChange={e => field.setter(e.target.value)}
                    className="theme-input w-full px-4 py-3 rounded-xl text-[15px] border outline-none" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowChangePassword(false)} disabled={passwordSaving}
                className="flex-1 py-3 rounded-xl text-[14px] font-bold border theme-text-secondary"
                style={{ borderColor: 'var(--border)' }}>
                Cancel
              </button>
              <button onClick={handleChangePassword} disabled={passwordSaving}
                className="flex-1 py-3 rounded-xl text-[14px] font-bold disabled:opacity-60"
                style={{ background: '#172a1e', color: '#ffffff' }}>
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLanguagePicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: 'rgba(27,28,26,0.5)' }}
          onClick={() => setShowLanguagePicker(false)}>
          <div className="theme-card w-full max-w-sm rounded-2xl p-8"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-[20px] font-bold mb-6 theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>{t('settings.selectLanguage')}</h3>
            <div className="space-y-2">
              {LANGUAGE_OPTIONS.map(option => (
                <button key={option.value} onClick={() => handleLanguageSelect(option.value)}
                  className="w-full flex items-center justify-between p-4 rounded-xl text-left transition-colors"
                  style={{
                    background: prefs.language === option.value ? 'var(--accent-green)' : 'transparent',
                    border: prefs.language === option.value ? '1px solid #b6ccba' : '1px solid var(--border)',
                    color: prefs.language === option.value ? '#172a1e' : 'var(--text-body)',
                  }}>
                  <span className="text-[15px] font-medium">{option.value === 'fr' ? t('language.fr') : t('language.en')}</span>
                  {prefs.language === option.value && (
                    <span className="material-symbols-outlined text-[20px]" style={{ color: '#172a1e' }}>check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: 'rgba(27,28,26,0.5)' }}
          onClick={() => setShowLogoutConfirm(false)}>
          <div className="theme-card w-full max-w-sm rounded-2xl p-8 text-center"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <span className="material-symbols-outlined text-[48px] mb-4 block" style={{ color: '#ba1a1a' }}>logout</span>
            <h3 className="text-[20px] font-bold mb-2 theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>Log out?</h3>
            <p className="text-[14px] mb-6 theme-text-secondary">
              You will need to sign in again to access your dashboard.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-xl text-[14px] font-bold border theme-text-secondary"
                style={{ borderColor: 'var(--border)' }}>
                Cancel
              </button>
              <button onClick={handleLogout}
                className="flex-1 py-3 rounded-xl text-[14px] font-bold"
                style={{ background: '#ba1a1a', color: '#ffffff' }}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
