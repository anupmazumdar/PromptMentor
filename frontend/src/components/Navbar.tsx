import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { LevelBadge } from './LevelBadge';
import { NetworkStatusBadge } from './NetworkStatusBadge';
import {
  BrainCircuit,
  Terminal,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Bot
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { progress, openTutor } = useProgress();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isInterUnlocked = progress?.tiers?.intermediate?.unlocked ?? false;
  const isAdvUnlocked = progress?.tiers?.advanced?.unlocked ?? false;

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#080C14]/90 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group min-h-[44px] py-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[1px] shadow-glow-violet group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-[#080C14] rounded-[11px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-violet-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight gradient-text">PromptMentor</span>
              <span className="text-[10px] text-slate-400 font-mono -mt-1 tracking-wider uppercase">AI Prompt Tutor</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/dashboard"
              className={`min-h-[44px] inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/dashboard') || isActive('/')
                  ? 'bg-slate-800/80 text-violet-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/curriculum/basics"
              className={`min-h-[44px] inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-medium transition-colors gap-1.5 ${
                isActive('/curriculum/basics')
                  ? 'bg-slate-800/80 text-emerald-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Basics
            </Link>

            <Link
              to="/curriculum/intermediate"
              className={`min-h-[44px] inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-medium transition-colors gap-1.5 ${
                isActive('/curriculum/intermediate')
                  ? 'bg-slate-800/80 text-cyan-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Intermediate
              {!isInterUnlocked && <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">LOCKED</span>}
            </Link>

            <Link
              to="/curriculum/advanced"
              className={`min-h-[44px] inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-medium transition-colors gap-1.5 ${
                isActive('/curriculum/advanced')
                  ? 'bg-slate-800/80 text-violet-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Advanced
              {!isAdvUnlocked && <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">LOCKED</span>}
            </Link>

            <Link
              to="/sandbox"
              className={`min-h-[44px] inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-medium transition-colors gap-1.5 ${
                isActive('/sandbox')
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Terminal className="w-4 h-4 text-violet-400" />
              Sandbox
            </Link>
          </nav>

          {/* Action Area, Connectivity Badge & Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Real-time Network / Offline Status Badge */}
            <NetworkStatusBadge />

            {/* Ask AI Tutor Button */}
            <button
              onClick={() => openTutor()}
              className="min-h-[44px] inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600/20 to-cyan-600/20 hover:from-violet-600/30 hover:to-cyan-600/30 text-slate-100 border border-violet-500/40 hover:border-violet-400 shadow-[0_0_15px_-4px_rgba(139,92,246,0.3)] transition-all"
            >
              <Bot className="w-4 h-4 mr-1.5 text-violet-400" />
              Ask Tutor
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-medium text-slate-200">{user.name || user.email.split('@')[0]}</span>
                  <LevelBadge level={user.currentLevel || 'BASICS'} size="sm" showIcon={false} />
                </div>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  aria-label="Log out"
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <Link
                  to="/login"
                  className="min-h-[44px] inline-flex items-center px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="min-h-[44px] inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-glow-violet transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Bar: Connectivity Badge + Tutor + Hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            <NetworkStatusBadge />
            <button
              onClick={() => openTutor()}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30"
              aria-label="Open AI Tutor"
            >
              <Bot className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer with min 44x44px touch targets */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#080C14]/98 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="min-h-[44px] flex items-center px-3.5 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800/80"
          >
            Dashboard
          </Link>
          <Link
            to="/curriculum/basics"
            onClick={() => setMobileMenuOpen(false)}
            className="min-h-[44px] flex items-center px-3.5 py-2.5 rounded-xl text-base font-medium text-emerald-400 hover:bg-slate-800/80"
          >
            Tier 1: Basics
          </Link>
          <Link
            to="/curriculum/intermediate"
            onClick={() => setMobileMenuOpen(false)}
            className="min-h-[44px] flex items-center px-3.5 py-2.5 rounded-xl text-base font-medium text-cyan-400 hover:bg-slate-800/80"
          >
            Tier 2: Intermediate
          </Link>
          <Link
            to="/curriculum/advanced"
            onClick={() => setMobileMenuOpen(false)}
            className="min-h-[44px] flex items-center px-3.5 py-2.5 rounded-xl text-base font-medium text-violet-400 hover:bg-slate-800/80"
          >
            Tier 3: Advanced
          </Link>
          <Link
            to="/sandbox"
            onClick={() => setMobileMenuOpen(false)}
            className="min-h-[44px] flex items-center px-3.5 py-2.5 rounded-xl text-base font-medium text-violet-300 hover:bg-slate-800/80"
          >
            Practice Sandbox
          </Link>
          <div className="pt-4 border-t border-slate-800/80">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="min-h-[44px] w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-medium bg-slate-800 text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-medium bg-violet-600 text-white"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
