import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Copy, Check, RefreshCw, Terminal, Cpu } from 'lucide-react';
import { ChatMessage } from '../types';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'intro-1',
    role: 'assistant',
    content: `Greetings, Game Architect! I am your **Godot 4 & GDScript Co-Pilot** for **"Polterheist"**.

I can help you:
- Write & optimize custom GDScript 2.0 physics mechanics (\`RigidBody2D\`, \`apply_central_impulse\`, \`CharacterBody2D\`).
- Architect complex vision cone detection with \`Area2D\` convex polygons or raycasting.
- Design custom shaders for ethereal bloom, ghostly distortion, and flashlight volumetric cones.
- Structure sound pipelines, particle cascades, and level loading.

How can I assist your Godot 4 development today?`,
    timestamp: Date.now(),
    modelUsed: 'gemini-3.5-flash',
  },
];

const QUICK_PROMPTS = [
  'How to implement telekinesis pull on RigidBody2D?',
  'Explain apply_central_force vs apply_central_impulse',
  'Write a Custom 2D Flashlight Occlusion Shader',
  'How to add footstep sounds to GuardNPC when walking?',
];

export const GeminiCopilot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputValue).trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Format history for server API
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}: Failed to get response`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'No response generated.',
        timestamp: Date.now(),
        modelUsed: selectedModel,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      console.error('Chat error:', err);
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Error communicating with Gemini:** ${errMsg}\n\nPlease check your server connection or try a different model.`,
        timestamp: Date.now(),
        modelUsed: selectedModel,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#070b19] border border-cyan-950/60 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Header with Model Selector */}
      <div className="px-5 py-3.5 bg-[#0a1128]/95 border-b border-cyan-900/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono tracking-wide flex items-center gap-2">
              Gemini Godot 4 Co-Pilot
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-400">
                AI Architect
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">Multi-turn GDScript &amp; 2D Physics Specialist</p>
          </div>
        </div>

        {/* Model Selector Affordance */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 text-[11px] hidden sm:inline">Model:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 text-xs focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
          >
            <option value="gemini-3.5-flash">gemini-3.5-flash (General Tasks)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Tasks)</option>
            <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Tasks)</option>
            <option value="gemini-3.8-flash">gemini-3.8-flash (Standard)</option>
          </select>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#050811]">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                  isUser
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-cyan-950 border-cyan-500/60 text-cyan-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-xl px-4 py-3 text-xs leading-relaxed font-mono ${
                  isUser
                    ? 'bg-cyan-900/40 border border-cyan-700/60 text-cyan-100 max-w-xl'
                    : 'bg-[#0a1128] border border-cyan-950/80 text-slate-200 w-full shadow-lg'
                }`}
              >
                {/* Header for model badge */}
                {!isUser && msg.modelUsed && (
                  <div className="flex items-center justify-between text-[10px] text-cyan-500/80 mb-2 border-b border-cyan-950 pb-1">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      {msg.modelUsed}
                    </span>
                    <button
                      onClick={() => handleCopyCode(msg.content, index)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      title="Copy response"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Body Content with simple markdown styling */}
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-2xl mr-auto">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/60 text-cyan-400 flex items-center justify-center shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="rounded-xl px-4 py-3 bg-[#0a1128] border border-cyan-950/80 text-cyan-300 font-mono text-xs flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Architecting GDScript logic via {selectedModel}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-[#060a16] border-t border-cyan-950/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Terminal className="w-3 h-3 text-cyan-500" />
          Quick Ask:
        </span>
        {QUICK_PROMPTS.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(qp)}
            disabled={isLoading}
            className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 hover:border-cyan-500 hover:text-cyan-300 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#080d1e] border-t border-cyan-900/40 flex items-end gap-2">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask for custom Godot 4 scripts, shaders, vision math, or physics optimization... (Enter to send)"
          rows={2}
          className="flex-1 px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-700/80 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 resize-none placeholder:text-slate-500"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputValue.trim()}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </div>
    </div>
  );
};
