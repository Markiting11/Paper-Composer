
import React from 'react';

interface HeaderProps {
  onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="no-print bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={onReset}
        >
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
            {/* Logo placeholder - assuming logo.png is the provided branding */}
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
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Documentation</a>
          <a href="#" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Premium Templates</a>
          <button 
            onClick={onReset}
            className="text-sm font-bold bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            Create New Paper
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
