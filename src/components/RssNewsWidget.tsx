import { useState, useEffect } from 'react';
import { RssArticle } from '../types';
import { szczecinRssNews } from '../data/rssNews';
import { 
  Radio, 
  Tv, 
  Rss, 
  Play, 
  Pause, 
  RefreshCw, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft,
  BookOpen
} from 'lucide-react';

interface RssNewsWidgetProps {
  onLogEvent: (msg: string) => void;
  isAlertActive: boolean;
  onTriggerAlert: () => void;
}

export function RssNewsWidget({ onLogEvent, isAlertActive, onTriggerAlert }: RssNewsWidgetProps) {
  const [articles, setArticles] = useState<RssArticle[]>(szczecinRssNews);
  const [selectedSource, setSelectedSource] = useState<'ALL' | 'RADIO' | 'TVP' | 'EMERGENCY'>('ALL');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // Filtered list based on selected tab source
  const filteredArticles = articles.filter(art => {
    if (selectedSource === 'ALL') return true;
    if (selectedSource === 'RADIO') return art.source === 'Polskie Radio Szczecin';
    if (selectedSource === 'TVP') return art.source === 'TVP3 Szczecin';
    if (selectedSource === 'EMERGENCY') return art.isCritical || art.source === 'Zarządzanie Kryzysowe';
    return true;
  });

  const activeArticle = filteredArticles[activeIndex % (filteredArticles.length || 1)] || null;

  // Auto alternation timer for ticker scrolling
  useEffect(() => {
    if (!isAutoPlaying || filteredArticles.length < 2 || isExpanding) return;

    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % filteredArticles.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [isAutoPlaying, filteredArticles.length, isExpanding]);

  // Adjust active index if filter reduces the selection list length
  useEffect(() => {
    setActiveIndex(0);
  }, [selectedSource]);

  // Handle simulated feed polling update
  const handlePollRss = () => {
    if (isPolling) return;
    setIsPolling(true);
    onLogEvent("📡 Nawiązywanie połączenia z kanałami RSS: Polskie Radio Szczecin & TVP Szczecin...");
    
    // Play a retro click/beep synthesizer effect using Web Audio
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audio = new AudioCtx();
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audio.currentTime); // Beep frequency
        osc.frequency.exponentialRampToValueAtTime(1760, audio.currentTime + 0.15);
        gain.gain.setValueAtTime(0.02, audio.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, audio.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start();
        osc.stop(audio.currentTime + 0.2);
      }
    } catch (e) {}

    setTimeout(() => {
      setIsPolling(false);
      // Simulate creating a random local crisis-related RSS alert to show high interactivity
      const simulatedUpdates = [
        {
          id: `rss-sim-${Date.now()}`,
          source: 'Zarządzanie Kryzysowe' as const,
          title: '🌧️ Ostrzeżenie meteorologiczne stopnia 1.',
          content: 'Prognozowane są intensywne opady deszczu nad Szczecinem. Szacowany opad to 25 mm/h. Drogi dopływowe do schronu pod placem Solidarności pod stałym nadzorem technicznym.',
          time: 'Teraz',
          rssUrl: 'szczecin.uw.gov.pl/rss/pogoda',
          category: 'PILNE' as const,
          isCritical: true,
        },
        {
          id: `rss-sim-${Date.now()}`,
          source: 'Polskie Radio Szczecin' as const,
          title: '📻 Informator drogowy: Udrożnienie ul. Wojska Polskiego',
          content: 'Koniec prac przy stacji benzynowej w rejonie al. Wojska Polskiego. Wszystkie drogi dojazdowe w kierunku podziemnego parkingu kina są przejezdne bez opóźnień.',
          time: 'Teraz',
          rssUrl: 'radioszczecin.pl/rss/drogi',
          category: 'RADIO-RSS' as const,
          isCritical: false,
        },
        {
          id: `rss-sim-${Date.now()}`,
          source: 'TVP3 Szczecin' as const,
          title: '📺 Aktualizacja stanu bezpieczeństwa Pomorzan',
          content: 'Komenda Miejska Policji w Szczecinie we współpracy z obroną cywilną zakończyła prewencyjną instalację drogowskazów do schronów podziemnych. Uczniowie szkół przeszli próbny alarm OC.',
          time: 'Teraz',
          rssUrl: 'szczecin.tvp.pl/rss/aktualnosci',
          category: 'TVP-INFO' as const,
          isCritical: false,
        }
      ];

      // Insert one random simulated update at the start
      const randomNew = simulatedUpdates[Math.floor(Math.random() * simulatedUpdates.length)];
      
      setArticles(prev => {
        // Prevent adding multiple of same simulated id
        if (prev.some(p => p.title === randomNew.title)) return prev;
        return [randomNew, ...prev];
      });

      onLogEvent(`✅ Odświeżono kanały RSS. Pobrano pomyślnie nowy artykuł: "${randomNew.title}"`);
    }, 1200);
  };

  const handleNext = () => {
    if (filteredArticles.length === 0) return;
    setActiveIndex(prev => (prev + 1) % filteredArticles.length);
  };

  const handlePrev = () => {
    if (filteredArticles.length === 0) return;
    setActiveIndex(prev => (prev - 1 + filteredArticles.length) % filteredArticles.length);
  };

  return (
    <div className="bg-[#07070d] border-b border-[#00FF00]/15 relative z-15 p-3 flex flex-col gap-2 shrink-0 select-none">
      
      {/* Top row: Module header, RSS feed selectors and Manual Polling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#00FF00]/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center p-1 bg-[#00FF00]/10 text-[#00FF00] rounded">
            <Rss size={13} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black font-mono tracking-widest text-[#00FF00] uppercase block">
              DETEKTOR RSS - SZCZECIN LIVE
            </span>
            <span className="text-[8px] text-zinc-500 font-mono tracking-tighter uppercase block">
              Zintegrowany odczyt: Polskie Radio & TVP3 Szczecin
            </span>
          </div>
        </div>

        {/* FEED SELECTION CHIPS */}
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'ALL', label: 'Wszystkie RSS', icon: Rss },
            { id: 'RADIO', label: 'Polskie Radio', icon: Radio },
            { id: 'TVP', label: 'TVP3 Szczecin', icon: Tv },
            { id: 'EMERGENCY', label: 'Alerty OC', icon: AlertTriangle }
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = selectedSource === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedSource(tab.id as any)}
                className={`flex items-center gap-1 text-[8.5px] font-mono px-2 py-0.5 rounded uppercase border transition-all cursor-pointer
                  ${isSel 
                    ? 'bg-[#00FF00] text-black border-[#00FF00] font-bold' 
                    : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white hover:border-zinc-800'
                  }`}
              >
                <Icon size={9} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* POLL BTN */}
          <button
            onClick={handlePollRss}
            disabled={isPolling}
            title="Kliknij, aby odpytać żywy serwer RSS"
            className="flex items-center gap-1 text-[8.5px] font-mono bg-zinc-900 text-[#00FF00] hover:bg-[#00FF00]/10 px-2 py-0.5 rounded border border-zinc-800 transition-all cursor-pointer disabled:opacity-50 ml-1.5"
          >
            <RefreshCw size={9} className={isPolling ? 'animate-spin' : ''} />
            <span>{isPolling ? 'POBIERANIE...' : 'ODŚWIEŻ'}</span>
          </button>
        </div>
      </div>

      {/* Main widget contents */}
      {filteredArticles.length === 0 ? (
        <div className="py-2 text-center text-zinc-600 font-mono text-[10px]">
          Brak najnowszych wpisów RSS dla tej kategorii prasy w Szczecinie.
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          
          {/* Headline Display row with carousel controls */}
          <div className="flex items-center justify-between gap-3 bg-black/40 p-1.5 rounded border border-[#00FF00]/5 hover:border-[#00FF00]/15 transition-all">
            
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              
              {/* Category tags */}
              <span className={`text-[7.5px] font-mono font-bold px-1.5 py-0.5 rounded uppercase shrink-0 tracking-wide
                ${activeArticle?.isCritical
                  ? 'bg-red-950 text-red-500 border border-red-900 animate-pulse'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}
              >
                {activeArticle?.category || 'RSS'}
              </span>

              {/* Source Tag */}
              <span className="text-[8px] font-mono font-bold text-zinc-400 shrink-0 select-none bg-zinc-950 px-1 py-0.5 rounded">
                {activeArticle?.source === 'Polskie Radio Szczecin' ? '🎙️ Radio Szczecin' : activeArticle?.source === 'TVP3 Szczecin' ? '📺 TVP3 Szczecin' : '🛡️ Centrala OC'}
              </span>

              {/* Ticker marquee / headline */}
              <div className="text-[11px] font-black text-white hover:text-[#00FF00] cursor-pointer transition-colors truncate font-mono tracking-tight"
                onClick={() => setIsExpanding(!isExpanding)}
                title="Kliknij, aby odczytać pełną depeszę"
              >
                {activeArticle?.title}
              </div>
            </div>

            {/* Time Stamp & Controls */}
            <div className="flex items-center gap-2 shrink-0 border-l border-zinc-800 pl-2">
              <span className="text-[9px] font-mono text-zinc-500">{activeArticle?.time}</span>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  className="p-1 hover:text-[#00FF00] text-zinc-400 hover:bg-zinc-900 rounded transition-colors"
                  title="Poprzednia depesza"
                >
                  <ChevronLeft size={11} />
                </button>
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`p-1 rounded transition-colors ${isAutoPlaying ? 'text-[#00FF00]' : 'text-zinc-500 hover:text-white'}`}
                  title={isAutoPlaying ? "Wstrzymaj autokaruzelę" : "Rozpocznij autokaruzelę"}
                >
                  {isAutoPlaying ? <Pause size={10} /> : <Play size={10} />}
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 hover:text-[#00FF00] text-zinc-400 hover:bg-zinc-900 rounded transition-colors"
                  title="Następna depesza"
                >
                  <ChevronRight size={11} />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive expanded view showcasing full article parsed payload */}
          {isExpanding && activeArticle && (
            <div className="p-3 bg-zinc-950 rounded border border-[#00FF00]/15 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
                <span className="flex items-center gap-1">
                  <BookOpen size={9} />
                  Payload ID: <strong className="text-zinc-300 font-normal">{activeArticle.id}</strong>
                </span>
                <span>RSS feed URL: <a href={`https://${activeArticle.rssUrl}`} target="_blank" rel="noreferrer" className="text-[#00FF00] hover:underline">{activeArticle.rssUrl}</a></span>
              </div>

              <p className="text-[11px] font-mono leading-relaxed text-zinc-300">
                {activeArticle.content}
              </p>

              {/* Special Action Alert Integration Trigger */}
              {activeArticle.isCritical && (
                <div className="flex items-center justify-between p-2 rounded bg-amber-950/20 border border-amber-900/40">
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                    <span className="text-[9.5px] font-mono text-zinc-400 leading-normal">
                      Ten wpis ma status krytyczny. Możesz aktywować próbę obrony cywilnej, aby ostrzec resztę dzielnic Szczecina.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onTriggerAlert();
                      onLogEvent(`🚀 Uruchomiono alarm powiązany z depeszą: ${activeArticle.title}`);
                    }}
                    className={`text-[9px] font-mono font-bold px-2 py-1 rounded transition-colors uppercase cursor-pointer shrink-0 ml-1
                      ${isAlertActive 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-amber-600/20 hover:bg-[#00FF00] text-amber-400 hover:text-black border border-amber-800'
                      }`}
                  >
                    {isAlertActive ? 'WYŁĄCZ SYRENY' : 'URUCHOM ALARM OC'}
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-zinc-900 pt-1.5 text-[9px] font-mono">
                <span className="text-zinc-500 font-bold">Autoprzewijanie: <span className={isAutoPlaying ? 'text-[#00FF00]' : 'text-zinc-400'}>{isAutoPlaying ? 'AKTYWNE' : 'WSTRZYMANE'}</span></span>
                <button
                  onClick={() => setIsExpanding(false)}
                  className="text-zinc-400 hover:text-white hover:underline transition-colors"
                >
                  Zwiń podgląd RSS [X]
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
