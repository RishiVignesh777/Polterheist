import React, { useState } from 'react';
import { GODOT_SCRIPTS, GODOT_NODE_HIERARCHIES, ART_AND_LIGHTING_GUIDE } from '../data/godotScripts';
import { Copy, Check, FileCode, Layers, Sun, Shield, Terminal, ArrowRight, BookOpen, Download } from 'lucide-react';

export const GodotGuide: React.FC = () => {
  const [selectedScriptId, setSelectedScriptId] = useState<string>('ghost_player');
  const [activeTab, setActiveTab] = useState<'scripts' | 'hierarchies' | 'lighting' | 'physics'>('scripts');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentScript = GODOT_SCRIPTS.find((s) => s.id === selectedScriptId) || GODOT_SCRIPTS[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadGD = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#070b19] border border-cyan-950/60 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Header & Sub-Navigation */}
      <div className="px-5 py-3.5 bg-[#0a1128]/95 border-b border-cyan-900/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono tracking-wide">
              Godot 4 &amp; GDScript Implementation Guide
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Complete Production Architecture for "Polterheist"
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('scripts')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'scripts'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            GDScripts
          </button>
          <button
            onClick={() => setActiveTab('hierarchies')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'hierarchies'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Node Trees
          </button>
          <button
            onClick={() => setActiveTab('lighting')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'lighting'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            Glow &amp; Lighting
          </button>
          <button
            onClick={() => setActiveTab('physics')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'physics'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Physics Layers
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* TAB 1: GDSCRIPTS */}
        {activeTab === 'scripts' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Script Selector Sidebar */}
            <div className="w-64 border-r border-cyan-950/60 bg-[#060a16] p-3 flex flex-col gap-2 overflow-y-auto">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-bold px-2 py-1">
                Core Scripts ({GODOT_SCRIPTS.length})
              </span>
              {GODOT_SCRIPTS.map((script) => (
                <button
                  key={script.id}
                  onClick={() => setSelectedScriptId(script.id)}
                  className={`text-left p-2.5 rounded-lg border font-mono text-xs transition-all flex flex-col gap-1 ${
                    selectedScriptId === script.id
                      ? 'bg-cyan-950/50 border-cyan-500/70 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{script.filename}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">
                      {script.nodeType.split(' ')[0]}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 line-clamp-1">{script.title}</span>
                </button>
              ))}

              <div className="mt-auto p-3 rounded-lg bg-cyan-950/30 border border-cyan-900/40 text-[11px] text-cyan-300/80 font-mono leading-relaxed">
                💡 <strong>Godot 4 Tip:</strong> All scripts use typed GDScript for engine speed, autocompletion, and zero runtime overhead.
              </div>
            </div>

            {/* Right Script Display */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#050811]">
              {/* Script Bar */}
              <div className="px-5 py-3 bg-[#080d1e] border-b border-cyan-950/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white font-mono">{currentScript.filename}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/60 text-cyan-300 font-mono">
                      Extends {currentScript.nodeType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{currentScript.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadGD(currentScript.filename, currentScript.code)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-500 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Download .gd file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .gd
                  </button>

                  <button
                    onClick={() => handleCopy(currentScript.code, currentScript.id)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-mono font-bold text-white flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                  >
                    {copiedId === currentScript.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Setup Notes Accordion */}
              <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800/70 text-xs font-mono text-slate-300">
                <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] block mb-1">
                  Editor Setup Checklist:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                  {currentScript.setupNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>

              {/* Code Viewer */}
              <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 leading-relaxed bg-[#050811]">
                <pre className="whitespace-pre">
                  <code>{currentScript.code}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXACT NODE HIERARCHIES */}
        {activeTab === 'hierarchies' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#050811]">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  Exact Godot 4 Scene &amp; Node Tree Architectures
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Create these scene files in your <code className="text-cyan-300">res://scenes/</code> directory.
                </p>
              </div>

              {/* MainLevel */}
              <div className="rounded-xl border border-cyan-950/80 bg-[#080d1e] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#0a1128] border-b border-cyan-950 flex items-center justify-between">
                  <span className="font-bold text-sm text-cyan-300 font-mono">1. MainLevel.tscn (Node2D)</span>
                  <button
                    onClick={() => handleCopy(GODOT_NODE_HIERARCHIES.MainLevel.join('\n'), 'main-level')}
                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedId === 'main-level' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Tree
                  </button>
                </div>
                <div className="p-4 font-mono text-xs text-slate-300 bg-[#04060d] space-y-1">
                  {GODOT_NODE_HIERARCHIES.MainLevel.map((line, i) => (
                    <div key={i} className="hover:text-cyan-300 transition-colors">
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* GhostPlayer & Possessable Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GhostPlayer */}
                <div className="rounded-xl border border-cyan-950/80 bg-[#080d1e] overflow-hidden">
                  <div className="px-4 py-2 bg-[#0a1128] border-b border-cyan-950 flex items-center justify-between">
                    <span className="font-bold text-xs text-cyan-300 font-mono">2. GhostPlayer.tscn</span>
                    <button
                      onClick={() => handleCopy(GODOT_NODE_HIERARCHIES.GhostPlayer.join('\n'), 'ghost-tree')}
                      className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedId === 'ghost-tree' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="p-3 font-mono text-xs text-slate-300 bg-[#04060d] space-y-1">
                    {GODOT_NODE_HIERARCHIES.GhostPlayer.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>

                {/* PossessableObject */}
                <div className="rounded-xl border border-cyan-950/80 bg-[#080d1e] overflow-hidden">
                  <div className="px-4 py-2 bg-[#0a1128] border-b border-cyan-950 flex items-center justify-between">
                    <span className="font-bold text-xs text-cyan-300 font-mono">3. PossessableObject.tscn</span>
                    <button
                      onClick={() => handleCopy(GODOT_NODE_HIERARCHIES.PossessableObject.join('\n'), 'possess-tree')}
                      className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedId === 'possess-tree' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="p-3 font-mono text-xs text-slate-300 bg-[#04060d] space-y-1">
                    {GODOT_NODE_HIERARCHIES.PossessableObject.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>

                {/* GuardNPC */}
                <div className="rounded-xl border border-cyan-950/80 bg-[#080d1e] overflow-hidden">
                  <div className="px-4 py-2 bg-[#0a1128] border-b border-cyan-950 flex items-center justify-between">
                    <span className="font-bold text-xs text-cyan-300 font-mono">4. GuardNPC.tscn</span>
                    <button
                      onClick={() => handleCopy(GODOT_NODE_HIERARCHIES.GuardNPC.join('\n'), 'guard-tree')}
                      className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedId === 'guard-tree' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="p-3 font-mono text-xs text-slate-300 bg-[#04060d] space-y-1">
                    {GODOT_NODE_HIERARCHIES.GuardNPC.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>

                {/* UI/PanicMeter */}
                <div className="rounded-xl border border-cyan-950/80 bg-[#080d1e] overflow-hidden">
                  <div className="px-4 py-2 bg-[#0a1128] border-b border-cyan-950 flex items-center justify-between">
                    <span className="font-bold text-xs text-cyan-300 font-mono">5. PanicMeterUI.tscn (CanvasLayer)</span>
                    <button
                      onClick={() => handleCopy(GODOT_NODE_HIERARCHIES.PanicMeterUI.join('\n'), 'panic-tree')}
                      className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedId === 'panic-tree' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="p-3 font-mono text-xs text-slate-300 bg-[#04060d] space-y-1">
                    {GODOT_NODE_HIERARCHIES.PanicMeterUI.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GLOW & LIGHTING */}
        {activeTab === 'lighting' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#050811]">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-400" />
                  Godot 4 Visual Aesthetics: WorldEnvironment &amp; 2D Lighting
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  How to configure moody dark backgrounds (#0a1128), neon cyan glow (#00f3ff), and dynamic flashlight shadows.
                </p>
              </div>

              {/* WorldEnvironment Card */}
              <div className="rounded-xl border border-cyan-950/80 bg-[#080d1e] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-cyan-950/60 pb-3">
                  <h4 className="font-bold text-white font-mono text-sm flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]" />
                    {ART_AND_LIGHTING_GUIDE.worldEnvironment.title}
                  </h4>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-[#0a1128] border border-cyan-900 text-cyan-300">
                      Clear: {ART_AND_LIGHTING_GUIDE.worldEnvironment.backgroundColor}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500 text-cyan-300">
                      Glow: {ART_AND_LIGHTING_GUIDE.worldEnvironment.glowColor}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono text-slate-300">
                  {ART_AND_LIGHTING_GUIDE.worldEnvironment.steps.map((st, i) => (
                    <div key={i} className="leading-relaxed">
                      {st}
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 font-mono text-xs text-cyan-200">
                  <strong>The HDR Secret in Godot 4:</strong> In Godot 4, standard RGB goes from 0.0 to 1.0. If you set a Sprite's modulate to <code className="text-white">Color(0.0, 3.5, 4.0, 1.0)</code>, its values exceed 1.0. When WorldEnvironment has Glow enabled with <code className="text-white">hdr_threshold = 1.0</code>, Godot automatically blooms only those high-energy pixels into a radiant supernatural aura!
                </div>
              </div>

              {/* PointLight2D Card */}
              <div className="rounded-xl border border-cyan-950/80 bg-[#080d1e] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-cyan-950/60 pb-3">
                  <h4 className="font-bold text-white font-mono text-sm flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#fff3a0] shadow-[0_0_10px_#fff3a0]" />
                    {ART_AND_LIGHTING_GUIDE.pointLight2D.title}
                  </h4>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/60 text-amber-300">
                    Flashlight: {ART_AND_LIGHTING_GUIDE.pointLight2D.flashlightColor}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono text-slate-300">
                  {ART_AND_LIGHTING_GUIDE.pointLight2D.steps.map((st, i) => (
                    <div key={i} className="leading-relaxed">
                      {st}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PHYSICS LAYERS */}
        {activeTab === 'physics' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#050811]">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  Project Settings &gt; Layer Names &gt; 2D Physics Matrix
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Correct layer and collision mask separation prevents ghosts from blocking physical objects and ensures accurate flashlight vision queries.
                </p>
              </div>

              <div className="rounded-xl border border-cyan-950/80 bg-[#080d1e] overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#0a1128] border-b border-cyan-950 text-cyan-300 uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Layer #</th>
                      <th className="p-3">Layer Name</th>
                      <th className="p-3">Collision Mask (What it interacts with)</th>
                      <th className="p-3">Engine Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-cyan-400">Layer 1</td>
                      <td className="p-3 font-semibold text-white">World_Walls</td>
                      <td className="p-3 text-slate-400">All physical bodies</td>
                      <td className="p-3">Boundary collision for mansion walls and pillars.</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-cyan-400">Layer 2</td>
                      <td className="p-3 font-semibold text-white">Ghost_Player</td>
                      <td className="p-3 text-slate-400">Layer 1 (Walls)</td>
                      <td className="p-3">Intangible spirit. Phases freely through objects and guards.</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-cyan-400">Layer 3</td>
                      <td className="p-3 font-semibold text-white">Possessables</td>
                      <td className="p-3 text-slate-400">Layer 1 (Walls), Layer 3 (Objects), Layer 4 (Guards)</td>
                      <td className="p-3">RigidBody2D props. Launches and impacts guards.</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-cyan-400">Layer 4</td>
                      <td className="p-3 font-semibold text-white">Guards</td>
                      <td className="p-3 text-slate-400">Layer 1 (Walls), Layer 3 (Possessables)</td>
                      <td className="p-3">Security patrolling NPCs. Susceptible to physical knockouts.</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-cyan-400">Layer 5</td>
                      <td className="p-3 font-semibold text-white">Vision_Detection</td>
                      <td className="p-3 text-slate-400">Layer 3 (Possessables)</td>
                      <td className="p-3">Area2D polygon vision cone scanning for high-velocity bodies.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Autoload Setup Card */}
              <div className="rounded-xl border border-indigo-950/80 bg-indigo-950/20 p-5 space-y-3">
                <h4 className="font-bold text-white font-mono text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  Autoload Singleton Registration (GameManager)
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-xs font-mono text-slate-300">
                  <li>In the top Godot menu, navigate to <strong>Project &gt; Project Settings...</strong></li>
                  <li>Switch to the <strong>Globals</strong> or <strong>Autoload</strong> tab.</li>
                  <li>Click the file browser icon next to <strong>Path</strong> and select <code className="text-cyan-300">res://scripts/game_manager.gd</code>.</li>
                  <li>Set <strong>Node Name</strong> to <code className="text-white">GameManager</code>.</li>
                  <li>Click <strong>Add</strong>. It will now be globally available in all scripts as <code className="text-cyan-300">GameManager</code>!</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
