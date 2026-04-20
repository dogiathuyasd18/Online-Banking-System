import { Bell, Search, Settings, UserCircle } from 'lucide-react';

interface TopbarProps {
  email: string;
}

export function Topbar({ email }: TopbarProps) {
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

      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger border-2 border-white" />
        </button>
        <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors">
          <Settings className="h-5 w-5" />
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200 mx-2" />
        
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account</p>
            <p className="text-sm font-semibold text-slate-700">{email}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary ring-2 ring-primary-light ring-offset-2">
            <UserCircle className="h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
