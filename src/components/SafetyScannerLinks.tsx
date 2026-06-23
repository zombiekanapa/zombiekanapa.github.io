export default function SafetyScannerLinks() {
  const links = [
    {
      url: 'https://safetyscan.lovable.app/',
      title: 'SafetyScan (Lovable.app)',
      desc: 'Hosted Safety Scanner app (Agent A) — built with a web agent and cloud inference.'
    },
    {
      url: 'https://share.gemini.google/cXHVxb1hfeXQ',
      title: 'Gemini Shared Scanner',
      desc: 'Gemini share link (Agent B) — interactive GEM created with Gemini.'
    }
  ];

  return (
    <div className="ml-3 hidden md:flex items-center gap-2">
      {links.map(l => (
        <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-amber-300">
          {l.title}
        </a>
      ))}
    </div>
  );
}
