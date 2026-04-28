import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, Search, Settings, ShieldCheck, UserCircle } from 'lucide-react';

interface TopbarProps {
  email: string;
}

export function Topbar({ email }: TopbarProps) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md">
      <div className="flex flex-1 items-center gap-4">
        <div className="hidden w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 md:flex">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="relative flex items-center gap-4">
        <button
          className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors"
          onClick={() => setShowNotifications((value) => !value)}
          aria-label="Notifications"
          aria-expanded={showNotifications}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger border-2 border-white" />
        </button>

        {showNotifications && (
          <div className="absolute right-28 top-12 z-20 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/60">
            <div className="px-3 py-2">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Notifications</p>
            </div>
            <div className="space-y-1">
              <div className="flex gap-3 rounded-lg px-3 py-3 hover:bg-slate-50">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Account activity is up to date</p>
                  <p className="text-xs font-medium text-slate-500">No pending banking alerts right now.</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg px-3 py-3 hover:bg-slate-50">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Security monitoring active</p>
                  <p className="text-xs font-medium text-slate-500">We will flag unusual account actions here.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors"
          onClick={() => navigate('/profile')}
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200 mx-2" />
        
        <button
          className="flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-slate-50"
          onClick={() => navigate('/profile')}
          aria-label="Open profile"
        >
          <div className="hidden text-right md:block">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account</p>
            <p className="text-sm font-semibold text-slate-700">{email}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary ring-2 ring-primary-light ring-offset-2">
            <UserCircle className="h-6 w-6" />
          </div>
        </button>
      </div>
    </header>
  );
}
