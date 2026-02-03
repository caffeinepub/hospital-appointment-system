import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import DoctorsPage from './pages/DoctorsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ProfilePage from './pages/ProfilePage';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

type Page = 'home' | 'doctors' | 'appointments' | 'profile';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <SplashScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex flex-col h-screen bg-white">
        <main className="flex-1 overflow-y-auto pb-20">
          {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
          {currentPage === 'doctors' && <DoctorsPage onNavigate={setCurrentPage} />}
          {currentPage === 'appointments' && <AppointmentsPage />}
          {currentPage === 'profile' && <ProfilePage />}
        </main>

        <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
