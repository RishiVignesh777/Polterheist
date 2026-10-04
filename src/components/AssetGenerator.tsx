import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Download, RefreshCw, Sliders, Maximize2, ExternalLink } from 'lucide-react';
import { GeneratedAsset } from '../types';

const ASSET_PRESETS = [
  {
    title: 'Neon Ghost Sprite Sheet',
    prompt: 'Top-down 2D game sprite of a supernatural glowing ethereal ghost phantom, emitting radiant neon cyan #00f3ff light, dark moody background #0a1128, clean silhouette, stylized pixel/vector game art, multiple floating animation frames',
    size: '1K' as const,
    aspectRatio: '1:1',
  },
  {
    title: 'Victorian Mansion Gallery',
    prompt: 'Spooky dark Victorian mansion hallway with marble pillars, vintage paintings with eyes, dark navy midnight atmosphere #0a1128, subtle volumetric fog, 2D top-down game level tileset concept',
    size: '2K' as const,
    aspectRatio: '16:9',
  },
  {
    title: 'Security Guard with Flashlight',
    prompt: 'Top-down 2D game character concept of a museum security guard holding a warm yellow flashlight casting a sharp luminous light beam in dark museum, stealth game aesthetic, clean vector sprite style',
    size: '1K' as const,
    aspectRatio: '1:1',
  },
  {
    title: 'Possessable Victorian Props',
    prompt: 'Set of 2D game prop sprites: ornate ceramic vase, heavy oak treasure crate, grandfather clock, antique suit of armor, glowing with faint poltergeist cyan aura, game asset pack transparent background look',
    size: '4K' as const,
    aspectRatio: '1:1',
  },
];

export const AssetGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(ASSET_PRESETS[0].prompt);
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<GeneratedAsset | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageSize,
          aspectRatio,
          model: 'gemini-3-pro-image-preview',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}: Failed to generate image`);
      }

      const data = await res.json();

      const newAsset: GeneratedAsset = {
        id: `asset-${Date.now()}`,
        prompt,
        imageUrl: data.imageUrl,
        modelUsed: data.modelUsed || 'gemini-3-pro-image-preview',
        imageSize: data.imageSize || imageSize,
        aspectRatio: data.aspectRatio || aspectRatio,
        createdAt: Date.now(),
      };

      setAssets((prev) => [newAsset, ...prev]);
      setSelectedAsset(newAsset);
    } catch (err: unknown) {
      console.error('Image gen error:', err);
      const msg = err instanceof Error ? err.message : 'Unknown generation error';
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (asset: GeneratedAsset) => {
    const link = document.createElement('a');
    link.href = asset.imageUrl;
    link.download = `polterheist-asset-${asset.imageSize}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-[#070b19] border border-cyan-950/60 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="px-5 py-3.5 bg-[#0a1128]/95 border-b border-cyan-900/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono tracking-wide flex items-center gap-2">
              Gemini High-Resolution Game Asset Generator
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-400">
                gemini-3-pro-image-preview
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Generate 2D sprites, concept environments, and textures at 1K, 2K, and 4K resolution
            </p>
          </div>
        </div>
      </div>

      {/* Main Generator Workspace */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Left Controls & Preset Bar */}
        <div className="w-full md:w-96 border-b md:border-b-0 md:border-r border-cyan-950/60 bg-[#060a16] p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Presets */}
          <div>
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-bold block mb-2">
              Polterheist Asset Presets:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {ASSET_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(preset.prompt);
                    setImageSize(preset.size);
                    setAspectRatio(preset.aspectRatio);
                  }}
                  className="p-2 text-left rounded-lg bg-slate-900/70 border border-slate-800 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-300 font-mono text-[11px] transition-all cursor-pointer"
                >
                  <div className="font-bold">{preset.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{preset.size} • {preset.aspectRatio}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Asset Prompt:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Describe your 2D game asset, sprite sheet, or level art..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Resolution Affordance (1K, 2K, 4K) & Aspect Ratio */}
          <div className="grid grid-cols-2 gap-3">
            {/* Image Size Affordance */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                <Sliders className="w-3 h-3 text-cyan-400" />
                Resolution:
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['1K', '2K', '4K'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setImageSize(sz)}
                    className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                      imageSize === sz
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Aspect Ratio:
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="1:1">1:1 Square (Sprites)</option>
                <option value="16:9">16:9 Landscape (Backgrounds)</option>
                <option value="4:3">4:3 Standard</option>
                <option value="9:16">9:16 Portrait</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Rendering in {imageSize}...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                Generate Asset ({imageSize})
              </>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono">
              ⚠️ {error}
            </div>
          )}

          {/* Model info note */}
          <div className="mt-auto text-[10px] font-mono text-slate-500 leading-normal">
            Uses <span className="text-cyan-400">gemini-3-pro-image-preview</span> with automatic 1K, 2K, and 4K resolution render pipeline.
          </div>
        </div>

        {/* Right Preview Gallery */}
        <div className="flex-1 flex flex-col p-5 bg-[#050811] overflow-y-auto">
          {selectedAsset ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative group max-w-xl max-h-[70vh] rounded-xl overflow-hidden border border-cyan-900/60 bg-slate-950 shadow-2xl flex items-center justify-center">
                <img
                  src={selectedAsset.imageUrl}
                  alt={selectedAsset.prompt}
                  className="max-h-[60vh] max-w-full object-contain"
                />

                {/* Overlay actions */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4 flex items-center justify-between">
                  <div className="font-mono text-xs text-slate-200 line-clamp-1 max-w-md">
                    <span className="text-cyan-400 font-bold mr-2">[{selectedAsset.imageSize}]</span>
                    {selectedAsset.prompt}
                  </div>
                  <button
                    onClick={() => handleDownload(selectedAsset)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ml-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PNG
                  </button>
                </div>
              </div>

              {/* Asset thumbnails bar */}
              {assets.length > 1 && (
                <div className="flex items-center gap-2 mt-4 overflow-x-auto max-w-xl pb-2">
                  {assets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border shrink-0 transition-all ${
                        selectedAsset.id === asset.id
                          ? 'border-cyan-400 ring-2 ring-cyan-500/50 scale-105'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={asset.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-cyan-950/80 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-mono font-bold text-white text-base mb-1">No Assets Generated Yet</h3>
              <p className="font-mono text-xs text-slate-400 max-w-sm">
                Select a Polterheist preset or enter a custom prompt with 1K, 2K, or 4K resolution, then click Generate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
