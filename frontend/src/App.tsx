import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { TutorChat } from './components/TutorChat';
import { Dashboard } from './pages/Dashboard';
import { BasicsPage } from './pages/BasicsPage';
import { IntermediatePage } from './pages/IntermediatePage';
import { AdvancedPage } from './pages/AdvancedPage';
import { SandboxPage } from './pages/SandboxPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BrainCircuit, Heart, ExternalLink } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-slate-100 selection:bg-violet-600 selection:text-white">
      {/* Sticky Top Navigation */}
      <Navbar />

      {/* Global Socratic Tutor Chat Drawer */}
      <TutorChat />

      {/* Main Page Routing */}
      <main className="flex-1 pb-12">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/curriculum/basics" element={<BasicsPage />} />
          <Route path="/curriculum/intermediate" element={<IntermediatePage />} />
          <Route path="/curriculum/advanced" element={<AdvancedPage />} />
          <Route path="/sandbox" element={<SandboxPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#06080F]/90 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-violet-600/20 flex items-center justify-center text-violet-400">
              <BrainCircuit className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-300">PromptMentor</span>
            <span>— AI Prompt Engineering Tutor</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <Link to="/curriculum/basics" className="hover:text-slate-200 transition-colors">Basics</Link>
            <Link to="/curriculum/intermediate" className="hover:text-slate-200 transition-colors">Intermediate</Link>
            <Link to="/curriculum/advanced" className="hover:text-slate-200 transition-colors">Advanced</Link>
            <Link to="/sandbox" className="hover:text-slate-200 transition-colors">Practice Sandbox</Link>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span>Built with OpenRouter & React</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
