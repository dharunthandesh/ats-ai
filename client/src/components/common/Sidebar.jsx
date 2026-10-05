import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  GitPullRequest,
  Users,
  Calendar,
  BarChart3,
  ShieldCheck,
  Sparkles,
  LogOut,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from './Badge';

export const Sidebar = () => {
  const { user, logout, switchDemoUser, isAdmin, isRecruiter } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Requisitions', path: '/jobs', icon: Briefcase },
    { name: 'Candidates', path: '/candidates', icon: Users },
    { name: 'Interviews', path: '/interviews', icon: Calendar },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  if (isAdmin) {
    navItems.push({ name: 'User Management', path: '/settings/users', icon: ShieldCheck });
  }

  const roleBadgeVariants = {
    ADMIN: { label: 'Admin', variant: 'purple' },
    HR_ADMIN: { label: 'HR Administrator', variant: 'purple' },
    RECRUITER: { label: 'Recruiter', variant: 'indigo' },
    INTERVIEWER: { label: 'Tech Interviewer', variant: 'blue' },
  };

  const currentRoleInfo = roleBadgeVariants[user?.role] || {
    label: user?.role || 'Staff',
    variant: 'slate',
  };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen glass-panel border-r border-slate-800/80 sticky top-0 z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
            Talent<span className="text-indigo-400">Pulse</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">
              AI
            </span>
          </h1>
          <p className="text-xs text-slate-400">Recruitment & ATS</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Demo Fast Role Switcher */}
        <div className="pt-6 mt-6 border-t border-slate-800/80">
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            Switch Demo Role
          </div>
          <div className="space-y-1">
            <button
              onClick={() => switchDemoUser('admin@talentpulse.ai')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                user?.role === 'HR_ADMIN'
                  ? 'bg-purple-950/60 text-purple-300 border border-purple-800/50'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <span>HR Admin</span>
              {user?.role === 'HR_ADMIN' && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
            </button>
            <button
              onClick={() => switchDemoUser('recruiter@talentpulse.ai')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                user?.role === 'RECRUITER'
                  ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/50'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <span>Recruiter</span>
              {user?.role === 'RECRUITER' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
            </button>
            <button
              onClick={() => switchDemoUser('interviewer@talentpulse.ai')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                user?.role === 'INTERVIEWER'
                  ? 'bg-blue-950/60 text-blue-300 border border-blue-800/50'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <span>Tech Interviewer</span>
              {user?.role === 'INTERVIEWER' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* User Footer Card */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center font-bold text-sm border border-indigo-700/50">
              {user?.name?.[0] || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-100 truncate">{user?.name || 'User'}</p>
            <Badge variant={currentRoleInfo.variant} size="xs" className="mt-0.5">
              {currentRoleInfo.label}
            </Badge>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
