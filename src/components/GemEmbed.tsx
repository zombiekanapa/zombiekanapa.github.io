import React, { useState } from 'react';

const gemUrl = "https://share.gemini.google/MLd2FEmbdpj5";

export default function GemEmbed() {
  const [showEmbed, setShowEmbed] = useState(false);

  return (
    <div className="ml-3 flex items-center gap-2">
      <button
        onClick={() => window.open(gemUrl, '_blank')}
        className="bg-amber-600 hover:bg-amber-500 text-black px-2 py-1 rounded text-[11px] font-bold"
      >
        Open GEM
      </button>

      <button
        onClick={() => setShowEmbed(prev => !prev)}
        className={`bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-[11px] text-zinc-200 hover:bg-zinc-800`}
      >
        {showEmbed ? 'Hide Embed' : 'Embed GEM'}
      </button>

      {showEmbed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[90%] h-[80%] bg-zinc-900 border border-zinc-800 rounded overflow-hidden">
            <div className="flex items-center justify-between p-2 bg-zinc-800 border-b border-zinc-700">
              <div className="text-sm font-bold text-white">Gemini GEM</div>
              <div className="flex items-center gap-2">
                <a href={gemUrl} target="_blank" rel="noreferrer" className="text-xs text-amber-400">Open in new tab</a>
                <button onClick={() => setShowEmbed(false)} className="bg-red-700 text-white px-2 py-1 rounded text-xs">Close</button>
              </div>
            </div>
            <iframe src={gemUrl} title="Gemini GEM" className="w-full h-full" sandbox="allow-forms allow-same-origin allow-scripts" />
          </div>
        </div>
      )}
    </div>
  );
}
