import { Home, Users, Calendar, User } from 'lucide-react';
import { useEffect } from 'react';

type Page = 'home' | 'doctors' | 'appointments' | 'profile';

interface BottomNavProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export default function BottomNav({ currentPage, onPageChange }: BottomNavProps) {
  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const customEvent = event as CustomEvent<Page>;
      onPageChange(customEvent.detail);
    };

    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate', handleNavigate as EventListener);
  }, [onPageChange]);

  const navItems = [
    { id: 'home' as Page, icon: Home, label: 'Home' },
    { id: 'doctors' as Page, icon: Users, label: 'Doctors' },
    { id: 'appointments' as Page, icon: Calendar, label: 'Appointments' },
    { id: 'profile' as Page, icon: User, label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="container mx-auto px-2">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

