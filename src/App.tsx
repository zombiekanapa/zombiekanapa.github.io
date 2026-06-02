import { useState, useMemo } from 'react';
import { MapComponent } from './components/MapComponent';
import { RssNewsWidget } from './components/RssNewsWidget';
import { evacuationSpots } from './data/evacuationSpots';
import { safetyProtocols } from './data/protocols';
import { EvacuationSpot, SpotType } from './types';
import { 
  Navigation, 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  PlusCircle, 
  Info,
  Flame,
  Radio,
  X,
  Volume2,
  ChevronDown,
  ChevronUp,
  Download,
  BookOpen,
  Users,
  Heart,
  Wifi,
  WifiOff,
  Map as MapIcon,
  CheckCircle,
  Smartphone
} from 'lucide-react';

export default function App() {
  const [spots, setSpots] = useState<EvacuationSpot[]>(evacuationSpots);
  const [selectedSpot, setSelectedSpot] = useState<EvacuationSpot | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [travelMode, setTravelMode] = useState<'WALKING' | 'DRIVING'>('WALKING');
  const [activeRouteInfo, setActiveRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  // Tabs layout navigation
  const [activeTab, setActiveTab] = useState<'MAP' | 'PROTOCOLS' | 'CITIZENS'>('MAP');

  // Search and Filter States for Shelters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<SpotType | 'ALL'>('ALL');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [minCapacity, setMinCapacity] = useState(0);

  // Interactive System States
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  
  // Interactive community state: spotId -> upvote count
  const [communityUpvotes, setCommunityUpvotes] = useState<Record<string, number>>({
    'spot-16': 43,
    'spot-17': 19,
    'spot-28': 8,
    'spot-29': 12,
    'spot-30': 31
  });

  // Expandable Protocols States
  const [expandedProtocolId, setExpandedProtocolId] = useState<string | null>('prot-siren');
  const [searchProtocolQuery, setSearchProtocolQuery] = useState('');

  // Proposal Form States
  const [propLat, setPropLat] = useState('53.4285');
  const [propLng, setPropLng] = useState('14.5528');
  const [propName, setPropName] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propType, setPropType] = useState<SpotType>('shelter');
  const [propCapacity, setPropCapacity] = useState('500');
  const [propDetails, setPropDetails] = useState('');

  // Live Tactical Feed Log list
  const [feedLogs, setFeedLogs] = useState<string[]>([
    "SZT-12: System obrony cywilnej Szczecin gotowy. Wgrano 30 punktów bazowych.",
    "Bateria GPS: Wykrywanie satelitarne w toku. Trasy wyznaczane są na żywo.",
    "Informacja: Kliknięcie i najechanie szpilki mapy automatycznie rysuje bezpieczną trasę."
  ]);

  // Sythesise real-time audible tactical alert using Web Audio API
  const playSirenSynthesizer = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // Multi-oscillator synthesis for a convincing tactical sweep sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      // Sweep modulation
      osc1.frequency.setValueAtTime(400, ctx.currentTime);
      osc1.frequency.linearRampToValueAtTime(700, ctx.currentTime + 1.2);
      osc1.frequency.linearRampToValueAtTime(400, ctx.currentTime + 2.4);

      osc2.frequency.setValueAtTime(410, ctx.currentTime);
      osc2.frequency.linearRampToValueAtTime(710, ctx.currentTime + 1.2);
      osc2.frequency.linearRampToValueAtTime(410, ctx.currentTime + 2.4);

      // Fast volume pulse
      gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2.4);
      gainNode.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 3.0);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();

      osc1.stop(ctx.currentTime + 3.0);
      osc2.stop(ctx.currentTime + 3.0);
    } catch (e) {
      console.warn("Dostęp do dźwięku zablokowany przez przeglądarkę:", e);
    }
  };

  // Handle Geolocation Detection from Map component
  const handleUserLocationDetected = (loc: { lat: number; lng: number }) => {
    setUserLocation(loc);
    logEvent(`Namierzono sygnał GPS użytkownika: [${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}].`);
  };

  // Helper log event generator
  const logEvent = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setFeedLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 7)]);
  };

  // Triggering test and emergency simulations
  const handleTriggerScenario = (scenarioId: string) => {
    playSirenSynthesizer();
    
    if (currentScenario === scenarioId) {
      setCurrentScenario(null);
      setIsAlertActive(false);
      logEvent("Odwołano stan ćwiczebny. System powraca do czuwania nominalnego.");
      return;
    }

    setCurrentScenario(scenarioId);
    setIsAlertActive(true);

    if (scenarioId === 'SIREN') {
      logEvent("🚨 ALARM CYWILNY: Ogłoszono próbne syreny alarmowe dla Szczecina! Schron pl. Grunwaldzki zrzuca rygiel magnetyczny.");
    } else if (scenarioId === 'FIRE') {
      logEvent("🔥 INCYDENT TERMOCZNY: Symulacja awarii dymowej w pobliżu al. Wyzwolenia. Sprawdź warunki drogi do Galaxy/Hanza.");
    } else if (scenarioId === 'DISTRIBUTION') {
      logEvent("🥖 STREFA RZĄDOWA: Aktywowano punkt wydawania zapasów medycznych (jodek potasu) oraz wody pilnej w Kaskadzie.");
    }
  };

  // Handle clicking map to request adding a shelter with prefilled address
  const handleMapClickToAdd = (coords: { lat: number; lng: number }, address?: string) => {
    setPropLat(coords.lat.toFixed(5));
    setPropLng(coords.lng.toFixed(5));
    if (address) {
      setPropAddress(address);
    } else {
      setPropAddress('');
    }
    setShowProposalModal(true);
    setActiveTab('CITIZENS'); // Switch tab to show proposal form
    logEvent(`Wybrano lokację na mapie: [${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}]${address ? ` (Adres: ${address})` : ''}.`);
  };

  // Submit Newly Proposed shelter
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propName || !propAddress) {
      alert("Wprowadź prawidłową nazwę oraz zbliżony adres.");
      return;
    }

    const uniqueId = `custom-spot-${Date.now()}`;
    const newSpot: EvacuationSpot = {
      id: uniqueId,
      name: propName,
      address: propAddress,
      lat: parseFloat(propLat),
      lng: parseFloat(propLng),
      type: propType,
      capacity: parseInt(propCapacity) || 400,
      availability: 'Weryfikacja społecznościowa w toku',
      verified: false,
      details: propDetails || 'Schronienie zgłoszone przez mieszkańca Szczecina w systemie Ewakuacja.'
    };

    // Add upvote
    setCommunityUpvotes(prev => ({
      ...prev,
      [uniqueId]: 1
    }));

    setSpots(prev => [newSpot, ...prev]);
    setSelectedSpot(newSpot);
    setShowProposalModal(false);
    setActiveTab('MAP'); // Switch back to map to see it

    // Reset inputs
    setPropName('');
    setPropAddress('');
    setPropDetails('');

    logEvent(`Dodano punkt społecznościowy "${newSpot.name}" [Głosy: 1].`);
  };

  // Upvote community spot
  const handleUpvoteSpot = (spotId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setCommunityUpvotes(prev => ({
      ...prev,
      [spotId]: (prev[spotId] || 0) + 1
    }));
    logEvent(`Mieszkaniec poparł schronienie ID [${spotId.slice(-4)}]. Poziom wiarygodności wzrósł.`);
  };

  // Auto locate closest shelter
  const handleFindNearest = () => {
    if (!userLocation) {
      alert("Kliknij ikonę lokalizacji na mapie lub zezwól systemowi na odczyt z czujnika GPS.");
      return;
    }

    let nearestSpot: EvacuationSpot | null = null;
    let minDistance = Infinity;

    spots.forEach(spot => {
      const dLat = spot.lat - userLocation.lat;
      const dLng = spot.lng - userLocation.lng;
      const dist = dLat * dLat + dLng * dLng;
      if (dist < minDistance) {
        minDistance = dist;
        nearestSpot = spot;
      }
    });

    if (nearestSpot) {
      setSelectedSpot(nearestSpot);
      setActiveTab('MAP');
      logEvent(`Szybki algorytm: Najbliższe schronienie to "${(nearestSpot as EvacuationSpot).name}" (${(Math.sqrt(minDistance) * 111).toFixed(2)} km).`);
    }
  };

  // Toggle offline mode simulator
  const handleToggleOffline = () => {
    const isNowOffline = !offlineMode;
    setOfflineMode(isNowOffline);
    if (isNowOffline) {
      logEvent("⚠️ TRYB OFFLINE AKTYWNY: Odcięto połączenie z centralnym serwerem. Korzystasz z lokalnego bufora pamięci.");
    } else {
      logEvent("🌐 TRYB SIECIOWY: Połączenie z systemami rządowymi Szczecin przywrócone.");
    }
  };

  // Triggering offline CSV metadata database export
  const handleDownloadDatabase = () => {
    const header = "ID;Nazwa;Adres;Szerokość;Długość;Typ;Pojemność;Zweryfikowany\n";
    const rows = spots.map(s => 
      `"${s.id}";"${s.name}";"${s.address}";${s.lat};${s.lng};"${s.type}";${s.capacity};"${s.verified ? 'TAK' : 'NIE'}"`
    ).join("\n");
    
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Szczecin_Schrony_Baza_Offline_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logEvent("Pobrano plik CSV ze współrzędnymi schronów Szczecina do użytku offline.");
  };

  // Filter evaluation logic
  const filteredSpots = useMemo(() => {
    return spots.filter(spot => {
      const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            spot.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            spot.details.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === 'ALL' || spot.type === selectedType;
      const matchesVerified = !onlyVerified || spot.verified;
      const matchesCapacity = spot.capacity >= minCapacity;

      return matchesSearch && matchesType && matchesVerified && matchesCapacity;
    });
  }, [spots, searchQuery, selectedType, onlyVerified, minCapacity]);

  // Protocols query evaluation
  const filteredProtocols = useMemo(() => {
    return safetyProtocols.filter(p => 
      p.title.toLowerCase().includes(searchProtocolQuery.toLowerCase()) ||
      p.shortDesc.toLowerCase().includes(searchProtocolQuery.toLowerCase()) ||
      p.steps.some(step => step.toLowerCase().includes(searchProtocolQuery.toLowerCase()))
    );
  }, [searchProtocolQuery]);

  // Statistics calculation
  const totalCount = spots.length;
  const verifiedCount = spots.filter(s => s.verified).length;
  const communityCount = spots.filter(s => !s.verified).length;
  const verifiedPercentage = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;
  const activeFiltersCapacityTotal = filteredSpots.reduce((sum, s) => sum + s.capacity, 0);

  return (
    <div className={`flex flex-col lg:flex-row h-screen w-full bg-[#030306] text-zinc-100 font-sans overflow-hidden scanlines transition-all duration-500
      ${isAlertActive ? 'ring-4 ring-red-600 ring-inset' : ''}`}
    >
      
      {/* LEFT TACTICAL HUD PANEL */}
      <aside className="w-full lg:w-[420px] flex flex-col bg-[#07070d] border-b lg:border-b-0 lg:border-r border-[#00FF00]/10 shrink-0 z-10 overflow-hidden relative">
        
        {/* UPPER TACTICAL PANEL HEADER */}
        <div className="p-4 border-b border-[#00FF00]/15 bg-black/90 sticky top-0 z-20">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isAlertActive ? 'bg-red-500 animate-ping' : 'bg-[#00FF00] animate-pulse'}`} />
              <h1 className="text-sm font-black tracking-widest text-[#00FF00] font-mono uppercase">SZCZECIN DEFENSE HUD</h1>
            </div>
            
            {/* OFFLINE STATUS CHIP */}
            <button 
              onClick={handleToggleOffline}
              title="Przełącz tryb Offline/Online"
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border transition-all
                ${offlineMode 
                  ? 'bg-amber-950/40 border-amber-500 text-amber-400' 
                  : 'bg-zinc-900 border-[#00FF00]/30 text-[#00FF00]'
                }`}
            >
              {offlineMode ? (
                <>
                  <WifiOff size={10} />
                  <span>OFFLINE</span>
                </>
              ) : (
                <>
                  <Wifi size={10} className="animate-pulse" />
                  <span>LIVE</span>
                </>
              )}
            </button>
          </div>
          
          <div className="text-[20px] font-black uppercase text-white tracking-tighter leading-tight font-mono">
            SZCZECIN TAKTYCZNY
          </div>
          <p className="text-[10px] text-zinc-400 font-mono mt-0.5 tracking-wider uppercase">
            Platforma Ratunkowa & Protokoły Obrony Cywilnej
          </p>
        </div>

        {/* TACTICAL TAB MENU */}
        <div className="grid grid-cols-3 border-b border-[#00FF00]/15 bg-zinc-950 font-mono text-[10px] text-zinc-400 font-bold">
          
          <button 
            onClick={() => setActiveTab('MAP')}
            className={`flex flex-col items-center gap-1 py-3 border-r border-[#00FF00]/10 transition-all uppercase
              ${activeTab === 'MAP' 
                ? 'text-[#00FF00] bg-[#00FF00]/5 border-b-2 border-b-[#00FF00]' 
                : 'hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
          >
            <MapIcon size={14} />
            <span>Schrony ({spots.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('PROTOCOLS')}
            className={`flex flex-col items-center gap-1 py-3 border-r border-[#00FF00]/10 transition-all uppercase
              ${activeTab === 'PROTOCOLS' 
                ? 'text-[#00FF00] bg-[#00FF00]/5 border-b-2 border-b-[#00FF00]' 
                : 'hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
          >
            <BookOpen size={14} />
            <span>Protokoły ({safetyProtocols.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('CITIZENS')}
            className={`flex flex-col items-center gap-1 py-3 transition-all uppercase
              ${activeTab === 'CITIZENS' 
                ? 'text-[#00FF00] bg-[#00FF00]/5 border-b-2 border-b-[#00FF00]' 
                : 'hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
          >
            <Users size={14} />
            <span>Społeczność</span>
          </button>
        </div>

        {/* SIMULATION CONTROLS */}
        <div className="px-4 py-3 bg-zinc-950/80 border-b border-[#00FF00]/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-[#00FF05] uppercase tracking-widest flex items-center gap-1">
              <Radio size={10} className={isAlertActive ? 'text-red-500 animate-spin' : ''} />
              Stan Symulacyjny Szczecina
            </span>
            {isAlertActive && (
              <span className="text-[8px] bg-red-950 text-red-500 font-bold px-1.5 py-0.5 rounded border border-red-800 uppercase animate-pulse">
                ĆWICZENIA AKTYWNE
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button 
              onClick={() => handleTriggerScenario('SIREN')}
              className={`flex flex-col items-center justify-center p-1.5 rounded text-center border transition-all text-[8px] font-mono uppercase font-bold
                ${currentScenario === 'SIREN' 
                  ? 'bg-red-950 border-red-500 text-red-200' 
                  : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-950 hover:text-white'
                }`}
            >
              <Volume2 size={12} className={currentScenario === 'SIREN' ? 'animate-bounce text-red-400' : 'text-zinc-400'} />
              <span className="mt-1">Syreny OC</span>
            </button>

            <button 
              onClick={() => handleTriggerScenario('FIRE')}
              className={`flex flex-col items-center justify-center p-1.5 rounded text-center border transition-all text-[8px] font-mono uppercase font-bold
                ${currentScenario === 'FIRE' 
                  ? 'bg-orange-950 border-orange-500 text-orange-200' 
                  : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-950 hover:text-white'
                }`}
            >
              <Flame size={12} className={currentScenario === 'FIRE' ? 'animate-pulse text-orange-400' : 'text-zinc-400'} />
              <span className="mt-1">Pożar / Blok</span>
            </button>

            <button 
              onClick={() => handleTriggerScenario('DISTRIBUTION')}
              className={`flex flex-col items-center justify-center p-1.5 rounded text-center border transition-all text-[8px] font-mono uppercase font-bold
                ${currentScenario === 'DISTRIBUTION' 
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-200' 
                  : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-950 hover:text-white'
                }`}
            >
              <Sparkles size={12} className={currentScenario === 'DISTRIBUTION' ? 'text-emerald-400' : 'text-zinc-400'} />
              <span className="mt-1">Punkt Lekars.</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENT: MAP LIST AND FILTERS */}
        {activeTab === 'MAP' && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            
            {/* FILTER HUD */}
            <div className="p-4 border-b border-[#00FF00]/10 bg-[#0c0c16]/30 space-y-3 shrink-0">
              
              {/* PRIMARY SEARCH FILTER */}
              <div className="relative">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Wyszukaj lokalizacji kryzysowej..."
                  className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 pl-9 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#00FF00] transition-colors"
                />
                <Search className="absolute left-3 top-2.5 text-zinc-500" size={13} />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-zinc-400 hover:text-white">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* CHIP FILTER ROW */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono uppercase text-zinc-400 tracking-widest flex items-center gap-1">
                  <SlidersHorizontal size={9} /> Filtr kategorii schronienia
                </label>
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'ALL', label: 'Wszystkie' },
                    { id: 'shelter', label: 'Schrony' },
                    { id: 'undergroundParking', label: 'Parkingi' },
                    { id: 'tunnel', label: 'Tunele' },
                    { id: 'basement', label: 'Piwnice' },
                    { id: 'fortress', label: 'Bunkry/Forty' }
                  ].map(chip => (
                    <button
                      key={chip.id}
                      onClick={() => setSelectedType(chip.id as SpotType | 'ALL')}
                      className={`text-[9px] font-mono uppercase px-2 py-1 rounded transition-colors border
                        ${selectedType === chip.id 
                          ? 'bg-[#00FF00] text-black border-[#00FF00] font-bold'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CHECKBOX & SLIDER CONTROLS */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input 
                      type="checkbox"
                      checked={onlyVerified}
                      onChange={(e) => setOnlyVerified(e.target.checked)}
                      className="rounded border-zinc-800 text-[#00FF00] focus:ring-0 cursor-pointer"
                    />
                    <span>Tylko zweryfikowane przez OC</span>
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Punkty: <strong className="text-white font-bold">{filteredSpots.length}</strong>
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                    <span>Minimalna ładowność ludzi:</span>
                    <span className="text-[#00FF00] font-bold">{minCapacity} osób</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="2000"
                    step="100"
                    value={minCapacity}
                    onChange={(e) => setMinCapacity(parseInt(e.target.value))}
                    className="w-full accent-[#00FF00] h-1 bg-zinc-900 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

            </div>

            {/* BUTTON DOCK */}
            <div className="p-3 bg-zinc-950 border-b border-[#00FF00]/10 flex gap-2 shrink-0">
              <button 
                onClick={handleFindNearest}
                className="flex-1 flex items-center justify-center gap-2 bg-[#00FF00] hover:bg-[#00df00] text-black text-xs font-mono font-black py-2 rounded uppercase"
              >
                <Navigation size={12} />
                <span>Znajdź Najbliższy</span>
              </button>

              <button 
                onClick={handleDownloadDatabase}
                className="flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 hover:text-[#00FF00] text-xs font-mono px-3 py-2 rounded"
                title="Pobierz dane offline Szczecina (MCN)"
              >
                <Download size={12} />
                <span>Baza CSV</span>
              </button>
            </div>

            {/* SITES CONTAINER */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#00FF00]/5">
              
              {/* CURRENT STATS HEADER */}
              <div className="px-4 py-2 bg-black/40 text-[9px] font-mono text-zinc-500 flex justify-between uppercase">
                <span>Pojemność Przestrzeni: {activeFiltersCapacityTotal.toLocaleString()} osób</span>
                <span>Zweryfikowane: {verifiedPercentage}%</span>
              </div>

              {filteredSpots.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 font-mono text-xs">
                  <Info className="mx-auto text-zinc-600 mb-2" size={24} />
                  Brak schronień spełniających filtry. zmienić suwak pojemności.
                </div>
              ) : (
                filteredSpots.map((spot) => {
                  const isSelected = selectedSpot?.id === spot.id;
                  const upvotes = communityUpvotes[spot.id] || 0;
                  return (
                    <div 
                      key={spot.id}
                      onClick={() => {
                        setSelectedSpot(spot);
                        logEvent(`Wybrano schronienie: ${spot.name}`);
                      }}
                      className={`p-4 flex flex-col gap-1 cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? 'bg-[#00FF00]/5 border-l-4 border-l-[#00FF00]' 
                          : 'hover:bg-zinc-900/60'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-[13px] font-black uppercase text-white font-mono leading-tight tracking-tight">
                            {spot.name}
                          </h3>
                          <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                            {spot.address}
                          </div>
                        </div>

                        {spot.verified ? (
                          <span className="text-[8px] font-black px-1.5 py-0.5 bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 rounded uppercase tracking-wider shrink-0 font-mono">
                            Zatwierdzony
                          </span>
                        ) : (
                          <span className="text-[8px] font-black px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded uppercase tracking-wider shrink-0 font-mono">
                            Społeczny
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-zinc-400 tracking-wide mt-1 line-clamp-2 leading-relaxed">
                        {spot.details}
                      </p>

                      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 mt-2">
                        <div className="flex items-center gap-3">
                          <span>Kraj. Pojemność: <strong className="text-zinc-200">{spot.capacity} os.</strong></span>
                          
                          {/* UPVOTE CHIP IF COMMUNITY SPOT */}
                          {!spot.verified && (
                            <button
                              onClick={(e) => handleUpvoteSpot(spot.id, e)}
                              className="flex items-center gap-1 px-1.5 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-amber-500 rounded border border-zinc-800 transition-colors"
                              title="Zgłoś jako wiarygodny"
                            >
                              <Heart size={8} className="fill-amber-500" />
                              <span>{upvotes} poparć</span>
                            </button>
                          )}
                        </div>
                        <span className="text-[#00FF00] uppercase font-bold text-[8px]">{spot.type}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* TAB CONTENT: PROTOCOLS DATABASE */}
        {activeTab === 'PROTOCOLS' && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            
            {/* PROTOCOLS SEARCH PANEL */}
            <div className="p-4 border-b border-[#00FF00]/10 bg-zinc-950/50 shrink-0">
              <label className="block text-[9px] font-mono text-[#00FF00] uppercase tracking-wider mb-2">
                Biblioteka Protokołów Ratunkowych Szczecin
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={searchProtocolQuery}
                  onChange={(e) => setSearchProtocolQuery(e.target.value)}
                  placeholder="Wyszukaj np. syreny, jodek, staza..."
                  className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-1.5 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#00FF00] transition-colors"
                />
                <Search className="absolute left-3 top-2 text-zinc-500" size={12} />
                {searchProtocolQuery && (
                  <button onClick={() => setSearchProtocolQuery('')} className="absolute right-3 top-2 text-zinc-400 hover:text-white">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* PROTOCOLS EXPLANATORY CARDS */}
            <div className="flex-1 divide-y divide-[#00FF00]/10 overflow-y-auto">
              {filteredProtocols.map(proto => {
                const isExpanded = expandedProtocolId === proto.id;
                return (
                  <div key={proto.id} className="p-4 bg-black/10 hover:bg-zinc-950/20 transition-all">
                    
                    <button 
                      onClick={() => setExpandedProtocolId(isExpanded ? null : proto.id)}
                      className="w-full text-left flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[8px] font-mono px-1 py-0.5 rounded uppercase font-bold
                            ${proto.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-900/60' : 'bg-amber-950 text-amber-500 border border-amber-900/60'}`}
                          >
                            {proto.severity}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-mono uppercase">{proto.category}</span>
                        </div>
                        <h4 className="text-sm font-black text-white hover:text-[#00FF00] uppercase font-mono tracking-tight transition-colors">
                          {proto.title}
                        </h4>
                      </div>
                      
                      <div className="text-zinc-500 shrink-0 mt-1">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                      {proto.shortDesc}
                    </p>

                    {/* EXPANDED EXTRA CONTENT */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-[#00FF00]/10 space-y-4 animate-in fade-in slide-in-from-top-1">
                        
                        {/* STEP CHECKLIST */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-mono font-black text-[#00FF00] uppercase tracking-wider block">
                            Sekwencja Postępowania (KROKI):
                          </span>
                          {proto.steps.map((step, idx) => (
                            <div key={idx} className="flex gap-2 text-[11px] leading-relaxed text-zinc-300">
                              <span className="text-[#00FF00] font-mono shrink-0 select-none">[{idx+1}]</span>
                              <p>{step}</p>
                            </div>
                          ))}
                        </div>

                        {/* EQUIPMENT DETAILED */}
                        <div className="space-y-1 bg-zinc-950/80 p-2.5 rounded border border-zinc-900">
                          <span className="text-[9px] font-mono font-black text-[#00FF00] uppercase tracking-widest block mb-1">
                            Sugerowany ekwipunek (Ewakuacja):
                          </span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {proto.equipmentNeeded.map((eq, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[9.5px] text-zinc-400 font-mono">
                                <CheckCircle size={8} className="text-[#00FF00] shrink-0" />
                                <span className="truncate" title={eq}>{eq}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* AMATEUR EMERGENCIES FREQS */}
                        {proto.frequencies && proto.frequencies.length > 0 && (
                          <div className="text-[10px] font-mono border border-dashed border-amber-900/60 bg-amber-950/10 p-2.5 rounded">
                            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block mb-1">
                              📻 Nasłuch kryzysowy (Szczecin):
                            </span>
                            {proto.frequencies.map((freq, idx) => (
                              <div key={idx} className="text-zinc-300">
                                • {freq}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* LOCAL INFO ACCORDION FOOT */}
                        {proto.localInfo && (
                          <div className="text-[10.5px] italic text-zinc-400 p-2 bg-black/40 border-l border-[#00FF00] rounded">
                            {proto.localInfo}
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* RETRO CORONARY MANUAL ADVICE BLOCK */}
            <div className="p-4 bg-zinc-950 border-t border-[#00FF00]/10 text-center text-xs font-mono shrink-0">
              <span className="text-amber-500 font-bold block mb-1">⚠️ CYWILNY TELEFON RATUNKOWY: 112 / 998</span>
              <span className="text-zinc-500 text-[9px] block">Rekomendowane: Wydrukuj tę bazę przed podróżą po za granicę sieci.</span>
            </div>

          </div>
        )}

        {/* TAB CONTENT: CITIZEN PLATFORM */}
        {activeTab === 'CITIZENS' && (
          <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
            
            <div className="bg-zinc-950 p-4 border border-[#00FF00]/10 rounded">
              <h4 className="text-xs font-black uppercase text-white font-mono flex items-center gap-1.5 mb-2">
                <Users size={14} className="text-[#00FF00]" /> Społeczny Audyt Bezpieczeństwa
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                Współczesna obrona cywilna Szczecina polega na współpracy. Nie wszystkie schrony ujęte są w rządowej bazie. Zgłaszaj bezpieczne piwnice kamienic, stabilne korytarze techniczne, schrony Luftschutz oraz prywatne wzmocnione schronienia.
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono">
                <div className="bg-zinc-900 p-2 rounded">
                  <span className="text-zinc-500 block">Schrony Rządowe</span>
                  <strong className="text-white text-md font-bold">{verifiedCount}</strong>
                </div>
                <div className="bg-zinc-900 p-2 rounded">
                  <span className="text-zinc-500 block">Punkty Społeczne</span>
                  <strong className="text-[#00FF00] text-md font-bold">{communityCount}</strong>
                </div>
              </div>
            </div>

            {/* CITIZEN SPOT REGISTER FORM Trigger */}
            <div className="bg-gradient-to-r from-zinc-950 to-[#0e0e1a] p-4 rounded border border-zinc-800 space-y-3">
              <h5 className="text-[11px] font-bold text-white uppercase font-mono flex items-center gap-1.5">
                <PlusCircle size={12} className="text-[#00FF00]" /> Zgłoś Schron Społeczny
              </h5>
              
              <p className="text-[10px] text-zinc-400">
                Możesz wskazać lokalizację na dwa sposoby:
              </p>

              <ol className="text-[10px] space-y-1.5 text-zinc-400 list-decimal pl-4">
                <li>Kliknij w dowolne wolne miejsce na mapie za nami, aby pobrać koordynaty w ułamku sekundy.</li>
                <li>Wprowadź i zatwierdź współrzędne w poniższym panelu formy bezpośredniej.</li>
              </ol>

              <button 
                onClick={() => {
                  setPropLat('53.4285');
                  setPropLng('14.5528');
                  setShowProposalModal(true);
                }}
                className="w-full bg-zinc-900 hover:bg-[#00FF00] hover:text-black text-white text-[10px] font-mono font-bold py-2 rounded transition-all uppercase"
              >
                Otwórz formularz bezpośredni
              </button>
            </div>

            {/* ACCREDIDATION ADVICE */}
            <div className="p-3.5 bg-zinc-950 rounded border border-amber-950/50 flex gap-2">
              <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                <strong className="text-amber-500 uppercase">UWAGA CZUJNOŚĆ CYWILNA:</strong> Każdy punkt społeczny jest poddawany weryfikacji. Na mapie oznaczony jest kolorem <span className="text-amber-500">bursztynowym</span>. Popieraj rzetelne zgłoszenia w Twojej okolicy, aby system naddawał im priorytety.
              </div>
            </div>

          </div>
        )}

        {/* PERSISTENT REAL-TIME CONSOLE IN LOWER END */}
        <div className="p-4 bg-zinc-950 border-t border-[#00FF00]/15 mt-auto bg-black/90 sticky bottom-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider font-mono flex items-center gap-1">
              <Radio size={10} className="animate-pulse text-[#00FF00]" /> Logi Węzła Ostrzegania - Szczecin
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00] animate-ping" />
          </div>
          <div className="h-[96px] overflow-y-auto space-y-1 font-mono text-[9px] text-zinc-400 scrollbar-thin scrollbar-thumb-zinc-850">
            {feedLogs.map((log, index) => (
              <p key={index} className={index === 0 ? 'text-[#00FF00] bg-zinc-900/40 p-1 rounded font-bold' : 'opacity-75 p-0.5'}>
                {log}
              </p>
            ))}
          </div>
        </div>

      </aside>

      {/* RIGHT SIDE MAP VIEWPORT SECTION */}
      <section className="flex-1 h-full min-h-[400px] flex flex-col relative z-0">
        
        {/* LIVE SZCZECIN RSS / LOCAL NEWS BAR */}
        <RssNewsWidget 
          onLogEvent={logEvent}
          isAlertActive={isAlertActive}
          onTriggerAlert={() => handleTriggerScenario('SIREN')}
        />

        {/* MAP & OVERLAYS VIEWPORT WRAPPER */}
        <div className="flex-1 w-full h-full relative">

          {/* UPPER STATUS STRIP FOR VISUAL DESIGN POLISH */}
          <header className="absolute top-4 left-4 right-4 lg:left-auto lg:right-6 bg-black/90 p-3 rounded border border-[#00FF00]/15 shadow-[0_4px_25px_rgba(0,0,0,0.65)] z-20 flex items-center justify-between max-w-sm pointer-events-auto">
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute inset-0 bg-red-400 animate-ping rounded-full h-2 w-2 opacity-50"></span>
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
              </div>
              <div className="text-[10px] font-mono uppercase font-black text-white leading-none">
                MCN-SYS: <span className="text-[#00FF00]">AKTYWNY</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">{new Date().toISOString().slice(0, 10)} szczecin-tactical</span>
          </header>

          {/* ACTIVE SELECTOR DETAILS PANEL ON OVERLAY MAP */}
          {selectedSpot && (
            <div className="absolute top-16 left-4 right-4 lg:right-auto lg:w-[460px] bg-[#07070d]/95 border-2 border-[#00FF00]/30 p-5 rounded shadow-[0_4px_35px_rgba(0,0,0,0.9)] z-20 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[8px] font-mono tracking-widest text-[#00FF00] uppercase block mb-1">
                    ODCYFROWANO PARAMETRY PUNKTY SCHRONIENIA
                  </span>
                  <h2 className="text-base font-black text-white uppercase font-mono leading-tight tracking-tight">
                    {selectedSpot.name}
                  </h2>
                </div>
                <button 
                  onClick={() => {
                    setSelectedSpot(null);
                    setActiveRouteInfo(null);
                  }}
                  className="p-1 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded border border-transparent hover:border-zinc-800 transition-all cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* ROUTING INFO BOX */}
              {userLocation ? (
                <div className="mt-4 p-3 bg-zinc-950 border border-zinc-850 rounded space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-mono text-[11px]">Środek Transportu Ewakuacji:</span>
                    <div className="flex gap-1.5 font-mono text-[9px] font-bold">
                      <button 
                        onClick={() => setTravelMode('WALKING')}
                        className={`uppercase px-2 py-1 rounded border transition-colors cursor-pointer
                          ${travelMode === 'WALKING' 
                            ? 'bg-[#00FF00] text-black border-[#00FF00]' 
                            : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800'
                          }`}
                      >
                        Pieszo
                      </button>
                      <button 
                        onClick={() => setTravelMode('DRIVING')}
                        className={`uppercase px-2 py-1 rounded border transition-colors cursor-pointer
                          ${travelMode === 'DRIVING' 
                            ? 'bg-[#00FF00] text-black border-[#00FF00]' 
                            : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800'
                          }`}
                      >
                        Pojazd
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-zinc-900">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Dystans ewakuacji:</span>
                      <p className="text-base font-black text-white font-mono">{activeRouteInfo?.distance || 'Kalkulowanie...'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Przewidywany czas:</span>
                      <p className="text-base font-black text-[#00FF00] font-mono">{activeRouteInfo?.duration || 'Kalkulowanie...'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-zinc-950 border border-dashed border-amber-950 rounded flex items-start gap-2.5">
                  <Info size={14} className="text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-[10px] text-zinc-400 leading-normal font-mono">
                    Zezwól na lokalizację GPS w swojej przeglądarce, aby wytyczyć natychmiastową optymalną bezpieczną trasę do schronienia **{selectedSpot.name}**.
                  </p>
                </div>
              )}

              {/* SCHRONIA METADATA SPECS */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono bg-zinc-900/30 p-2.5 rounded border border-zinc-900">
                <div>
                  <span className="text-zinc-500">Maks. pojemność ludzi:</span>
                  <p className="text-white font-bold">{selectedSpot.capacity} osób</p>
                </div>
                <div>
                  <span className="text-zinc-500">Typ ochrony:</span>
                  <p className="text-[#00FF00] py-0.5 font-bold uppercase">{selectedSpot.type}</p>
                </div>
                <div className="col-span-2 pt-1 border-t border-zinc-900">
                  <span className="text-zinc-500">Komunikat o dostępie:</span>
                  <p className="text-zinc-300 leading-normal">{selectedSpot.availability || 'Otwarty 24/7 po zgłoszeniu alarmu.'}</p>
                </div>
              </div>

              <p className="text-[11px] text-zinc-300 mt-3 leading-relaxed bg-[#00FF00]/5 p-2.5 border-l-2 border-[#00FF00] select-none italic">
                {selectedSpot.details}
              </p>

              <div className="mt-4 pt-3.5 border-t border-zinc-900 flex items-center justify-between text-[10.5px] text-zinc-500 font-mono">
                <span>Koordynaty: <strong className="text-zinc-300">{selectedSpot.lat.toFixed(5)}, {selectedSpot.lng.toFixed(5)}</strong></span>
                <button 
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(`${selectedSpot.lat}, ${selectedSpot.lng}`);
                      alert("Skopiowano współrzędne schronu do schowka.");
                    }
                  }}
                  className="text-[#00FF00] hover:underline font-bold"
                >
                  Kopiuj Współrzędne
                </button>
              </div>
            </div>
          )}

          {/* CLICK ADVICE HELP HUD */}
          <div className="absolute bottom-6 left-4 right-4 lg:right-auto z-10 max-w-sm bg-black/90 border border-[#00FF00]/20 p-3 rounded shadow-[0_4px_25px_rgba(0,0,0,0.7)] backdrop-blur pointer-events-none">
            <p className="text-[10px] text-zinc-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone size={11} className="text-[#00FF00] animate-pulse" /> Wskazówka mobilna:
            </p>
            <p className="text-[10px] text-zinc-400 mt-1 leading-normal font-mono">
              Kliknij lewym przyciskiem myszy w dowolną strefę Szczecina na mapie, aby natychmiast zgłosić i współdzielić współrzędne schronienia.
            </p>
          </div>

          {/* INTERACTIVE MAP CONTAINER */}
          <MapComponent 
            spots={filteredSpots}
            selectedSpot={selectedSpot}
            onSelectSpot={(spot) => {
              setSelectedSpot(spot);
              if (!spot) setActiveRouteInfo(null);
            }}
            userLocation={userLocation}
            onUserLocationDetected={handleUserLocationDetected}
            travelMode={travelMode}
            activeRouteInfo={activeRouteInfo}
            onRouteComputed={(info) => setActiveRouteInfo(info)}
            onMapClickToAdd={handleMapClickToAdd}
          />

        </div>
      </section>

      {/* PROPOSAL REGISTRATION MODAL FORM */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#07070d] border-2 border-[#00FF00]/30 rounded w-full max-w-md p-6 shadow-[0_0_60px_rgba(0,0,0,0.95)]">
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-850">
              <h3 className="text-sm font-black uppercase text-white font-mono flex items-center gap-2">
                <PlusCircle size={16} className="text-[#00FF00]" /> Zgłoś Schronienie Cywilne
              </h3>
              <button 
                onClick={() => setShowProposalModal(false)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-1">
                  Współrzędne (Ustalane automatycznie z mapy)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    disabled 
                    value={`Lat: ${propLat}`}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-1.5 text-zinc-500"
                  />
                  <input 
                    type="text" 
                    disabled 
                    value={`Lng: ${propLng}`}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-1.5 text-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-1">
                  Nazwa Schronu / Część budynku *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="np. Podziemna piwnica kamienicy nr 8"
                  value={propName}
                  onChange={(e) => setPropName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00FF00] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-1">
                  Dokładny lub orientacyjny Adres *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="np. ul. Rayskiego 15, Szczecin"
                  value={propAddress}
                  onChange={(e) => setPropAddress(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00FF00] text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-1">
                    Typ Struktury ochronnej
                  </label>
                  <select 
                    value={propType}
                    onChange={(e) => setPropType(e.target.value as SpotType)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#00FF00] text-xs font-mono"
                  >
                    <option value="shelter">Schron obrony cywilnej</option>
                    <option value="undergroundParking">Parking podziemny (-1/-2)</option>
                    <option value="tunnel">Korytarz techniczny / Tunel</option>
                    <option value="basement">Zabezpieczona piwnica</option>
                    <option value="fortress">Fortyfikacja militarna / Bunkier</option>
                    <option value="other">Inny bezpieczny punkt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-1">
                    Pojemność osób (estymacja)
                  </label>
                  <input 
                    type="number" 
                    placeholder="350"
                    value={propCapacity}
                    onChange={(e) => setPropCapacity(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#00FF00] text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-1">
                  Instrukcje wejściowe (Klucze, wejście do piwnicy...)
                </label>
                <textarea 
                  placeholder="np. Klucz spoczywa u dozorcy budynku, drzwi wzmocnione stalowymi sztabami."
                  rows={2.5}
                  value={propDetails}
                  onChange={(e) => setPropDetails(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00FF00] text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowProposalModal(false)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-bold py-2 rounded uppercase font-mono text-[10px]"
                >
                  Anuluj
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#00FF00] hover:bg-[#00e300] text-black font-black py-2 rounded tracking-wider uppercase font-mono text-[10px]"
                >
                  Opublikuj Punkt
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
