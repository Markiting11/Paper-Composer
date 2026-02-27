
import React from 'react';
import { User, AppState } from '../types';

interface HeaderProps {
  onReset: () => void;
  user: User | null;
  onLogout: () => void;
  onOpenAdmin: () => void;
  currentState: AppState;
}

const Header: React.FC<HeaderProps> = ({ onReset, user, onLogout, onOpenAdmin, currentState }) => {
  return (
    <header className="no-print bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={onReset}
        >
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
            <img src="logo.png" alt="AS" className="w-full h-full object-cover" onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-white font-black text-xl">AS</span>';
            }} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
              ANWAR ALI SEHAR
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase mt-1">
              Paper Composer AI
            </span>
          </div>
        </div>
        
        <nav className="flex items-center gap-4 md:gap-8">
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <button 
                  onClick={onOpenAdmin}
                  className={`text-sm font-bold px-4 py-2 rounded-xl transition-all ${currentState === AppState.ADMIN_PANEL ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Admin Panel
                </button>
              )}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-black text-slate-900 leading-none truncate max-w-[120px]">
                    {user.email.split('@')[0]}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    {user.role}
                  </span>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
               <span className="text-xs font-bold text-slate-400">Secure System</span>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
