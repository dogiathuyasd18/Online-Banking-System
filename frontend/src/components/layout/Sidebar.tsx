import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Send, 
  History, 
  User, 
  CreditCard, 
  LogOut, 
  LayoutDashboard
} from 'lucide-react';
import { cn } from '../../utils';

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Transfer', icon: Send, path: '/transfer' },
    { name: 'History', icon: History, path: '/history' },
    { name: 'Cards', icon: CreditCard, path: '/cards' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2 text-primary">
          <BarChart3 className="h-8 w-8" />
          <span className="text-xl font-black tracking-tight text-slate-800">
            ModernBank
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all hover:bg-slate-50',
              location.pathname === item.path
                ? 'bg-primary-light text-primary'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <item.icon className={cn(
              'h-5 w-5',
              location.pathname === item.path ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'
            )} />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger transition-all hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
