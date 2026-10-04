import React, { useState } from 'react';
import { PlayableSimulation } from './components/PlayableSimulation';
import { GodotGuide } from './components/GodotGuide';
import { GeminiCopilot } from './components/GeminiCopilot';
import { AssetGenerator } from './components/AssetGenerator';
import { Ghost, Gamepad2, Code2, Bot, Sparkles, Terminal, ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'guide' | 'copilot' | 'assets'>('simulator');

  return (
    <div className="flex flex-col h-screen w-screen bg-[#050811] text-slate-100 overflow-hidden select-none">
      {/* Top Application Bar */}
      <header className="h-14 bg-[#0a1128] border-b border-cyan-900/50 px-5 flex items-center justify-between shrink-0 shadow-lg z-30">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.35)]">
            <Ghost className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono font-black text-sm tracking-widest text-white uppercase flex items-center gap-1.5">
                POLTERHEIST
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Godot 4
                </span>
              </h1>
            </div>
            <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
              2D Physics Stealth Architecture &amp; Interactive Simulator
            </p>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-cyan-950">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Play Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>GDScript &amp; Node Trees</span>
          </button>

          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'copilot'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Gemini AI Co-Pilot</span>
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'assets'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Asset Generator (1K-4K)</span>
          </button>
        </nav>

        {/* Engine Specs Badge */}
        <div className="hidden lg:flex items-center gap-2.5 font-mono text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300">Target: Godot 4.x (GDScript)</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Viewport */}
      <main className="flex-1 p-3 overflow-hidden">
        {activeTab === 'simulator' && <PlayableSimulation />}
        {activeTab === 'guide' && <GodotGuide />}
        {activeTab === 'copilot' && <GeminiCopilot />}
        {activeTab === 'assets' && <AssetGenerator />}
      </main>
    </div>
  );
}
