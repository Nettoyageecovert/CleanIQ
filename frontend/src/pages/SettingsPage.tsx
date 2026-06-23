import Sidebar from '../components/Sidebar';
import AccountSettingsView from '../components/AccountSettingsView';

export default function SettingsPage() {
  return (
    <div className="theme-page min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <Sidebar />

      <main className="lg:ml-72 min-h-screen flex flex-col">
        <AccountSettingsView variant="employee" />
      </main>
    </div>
  );
}
