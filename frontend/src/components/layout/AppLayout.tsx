import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  FolderKanban,
  Library,
  FileText,
  Settings,
  Sparkles,
  LogOut,
  PlusCircle,
  Menu,
  X,
  Search,
  Cpu,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/app', label: 'Dashboard', icon: Compass, end: true },
    { to: '/app/projects', label: 'Research Projects', icon: FolderKanban },
    { to: '/app/library', label: 'Global Library', icon: Library },
    { to: '/app/reports', label: 'Saved Reports', icon: FileText },
    { to: '/app/settings/profile', label: 'Preferences', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#111726] border-b border-[#1f293d]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
            R
          </div>
          <span className="font-bold tracking-tight text-white">ResearchSphere</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        ${mobileMenuOpen ? 'block' : 'hidden'} md:block
        w-full md:w-64 bg-[#0d121d] border-r border-[#192233] flex flex-col z-30
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#192233] flex items-center justify-between">
          <NavLink to="/app" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 flex items-center justify-center font-extrabold text-white shadow-lg shadow-cyan-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white">ResearchSphere</div>
              <div className="text-[10px] text-cyan-400 font-mono tracking-wider font-semibold">AI KNOWLEDGE OS</div>
            </div>
          </NavLink>
        </div>

        {/* Quick Action */}
        <div className="px-4 py-3">
          <button
            onClick={() => {
              navigate('/app/projects/new');
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
          >
            <PlusCircle size={15} />
            <span>New Research Project</span>
          </button>
        </div>

        {/* Main Nav Items */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors
                  ${active
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151c2c]'}
                `}
              >
                <Icon size={16} className={active ? 'text-cyan-400' : 'text-slate-400'} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* System Status Indicators */}
        <div className="p-3 mx-3 my-2 bg-[#121826] border border-[#1e273b] rounded-lg text-[11px] text-slate-400 space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-semibold text-[10px] uppercase tracking-wider">
            <span className="flex items-center space-x-1.5">
              <Cpu size={12} className="text-cyan-400" />
              <span>Engine Status</span>
            </span>
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online</span>
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between">
            <span>Model:</span>
            <span className="font-mono text-cyan-300">Gemini 2.5 Flash</span>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between">
            <span>Scholarly Search:</span>
            <span className="font-mono text-emerald-400">OpenAlex + Crossref</span>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-[#192233] flex items-center justify-between bg-[#0b0f17]">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-200 truncate">{user?.displayName || 'Researcher'}</div>
              <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-[#1a2336] rounded-md transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
