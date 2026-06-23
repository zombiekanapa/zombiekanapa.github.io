import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  FileText, 
  Volume2, 
  Radio, 
  Layers, 
  BookOpen, 
  Upload, 
  Play, 
  Loader2, 
  Copy, 
  Check, 
  MapPin, 
  Clock, 
  RefreshCw, 
  Database,
  Sliders,
  ChevronRight,
  Info
} from 'lucide-react';

// API Configuration - Environment replaces this placeholder at runtime
const apiKey = ""; 

export default function App() {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [image, setImage] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertLogs, setAlertLogs] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("Fenrir");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [customApiKey, setCustomApiKey] = useState("");
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [showGemEmbed, setShowGemEmbed] = useState(false);
  const gemUrl = "https://share.gemini.google/MLd2FEmbdpj5";

  // File drag & drop states
  const [isDragging, setIsDragging] = useState(false);

  // Preloaded Civil Defense Protocols Database
  const protocolsDatabase = [
    {
      id: "CBRN-01",
      title: "Chemical, Biological, Radiological, or Nuclear (CBRN) Incident",
      category: "CBRN",
      level: "CRITICAL",
      guidelines: [
        "Immediate shelter-in-place inside an interior room with no windows.",
        "Turn off all HVAC systems, ventilation, and seal doors/windows with plastic sheeting if available.",
        "Equip full protection: respirator/N95 masks, sealed goggles, and thick gloves.",
        "Avoid contact with run-off water or exposed outdoor surfaces.",
        "Decontaminate by removing outer clothing layers and washing skin thoroughly with soap."
      ],
      equipment: ["CBRN Mask / Respirator", "Hazmat Suit or Sealed Outer Layer", "Dosimeter / Geiger Counter", "Sealing Tape"]
    },
    {
      id: "STR-02",
      title: "Major Structural Collapse / Seismic Failure",
      category: "Structural",
      level: "HIGH",
      guidelines: [
        "Establish an immediate 150-meter safety perimeter to prevent injuries from secondary collapses.",
        "Identify and isolate gas mains, electrical conduits, and water lines immediately.",
        "Utilize acoustic monitoring or search cams to detect trapped survivors prior to heavy clearing.",
        "Do not enter unstable debris piles without structural shoring equipment.",
        "Monitor for dust inhalation and ensure all personnel utilize particulate respirators."
      ],
      equipment: ["Hard Hat", "Steel-toe Boots", "Structural Shoring Props", "Thermal Imaging System"]
    },
    {
      id: "FLD-03",
      title: "Flash Flood & Rapid Inundation",
      category: "Environmental",
      level: "HIGH",
      guidelines: [
        "Immediately evacuate low-lying structures and retreat to designated vertical evacuation points.",
        "Never attempt to drive or walk through moving water (6 inches can sweep a person away).",
        "Treat all standing water as highly contaminated with biological pathogens and electrical hazards.",
        "Monitor local weather channels and NOAA radio feeds for flash flood updates.",
        "Assemble flotation devices, clean drinking water, and high-intensity emergency beacons."
      ],
      equipment: ["PFD (Personal Flotation Device)", "Waterproof VHF Radio", "High-intensity Beacon", "Water Purification Kit"]
    },
    {
      id: "ACT-04",
      title: "Active Hostile Threat / Civil Disturbance",
      category: "Tactical",
      level: "CRITICAL",
      guidelines: [
        "RUN: If there is an escape path, attempt to evacuate immediately, leaving belongings behind.",
        "HIDE: If evacuation is impossible, lock and barricade doors, silence all communication devices.",
        "FIGHT: As a last resort when lives are in imminent danger, attempt to disrupt or disable the threat.",
        "Upon law enforcement arrival, keep hands visible, empty, and follow all instructions strictly.",
        "Provide emergency trauma treatment (tourniquets, chest seals) if safe to do so."
      ],
      equipment: ["Tactical Trauma Kit (IFAK)", "Tourniquet", "Ballistic Protection", "Secure Comm-Channels"]
    },
    {
      id: "WLF-05",
      title: "Wildfire and Large-Scale Conflagration",
      category: "Environmental",
      level: "CRITICAL",
      guidelines: [
        "Evacuate immediately if local authorities issue orders. Do not wait for visual flame confirmation.",
        "Keep all doors and windows closed; remove flammable drapes or curtains near openings.",
        "If trapped in a vehicle, park away from heavy vegetation, close vents, and lie on the floor under a blanket.",
        "Wear 100% cotton/wool long-sleeve clothing to protect against radiant heat.",
        "Ensure clear air pathways by wearing N95 or superior dust masks."
      ],
      equipment: ["Fire-resistant clothing", "N95 / Smoke Mask", "Emergency Fire Blanket", "GPS Navigator"]
    }
  ];

  // Helper to show custom status toast
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Prepopulate initial system log updates to simulate a live command center
  useEffect(() => {
    const initialLogs = [
      { id: 1, time: "09:12:15", type: "SYSTEM", message: "CD-TCC Visual Node initialized in Secure Mode." },
      { id: 2, time: "09:18:42", type: "WEATHER", message: "Atmospheric tracking updated. No nuclear fallout risks detected in region." },
      { id: 3, time: "09:21:05", type: "ALERT", message: "Standing by for active field imagery analysis." }
    ];
    setAlertLogs(initialLogs);
  }, []);

  // Handle Drag & Drop Events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Convert uploaded image to base64 for API transmission
  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      showToast("Invalid file type. Please upload an image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      const base64Data = reader.result.split(',')[1];
      setBase64Image(base64Data);
      showToast("Visual intelligence asset loaded successfully.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Exponential Backoff API Wrapper
  const callWithRetry = async (url, options, retries = 5, delay = 1000) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP Code ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return callWithRetry(url, options, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  // Run the core Visual Threat Analysis using Gemini 2.5 Flash Preview
  const runVisualThreatAnalysis = async () => {
    if (!base64Image) {
      showToast("Error: No threat imagery provided for scanning.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisSteps([
      "Acquiring high-resolution visual feed...",
      "Normalizing sensory metrics and removing distortion...",
      "Running semantic anomaly and tactical classification algorithms..."
    ]);

    // Simulate step updates for realistic tactical feel
    const stepIntervals = [
      setTimeout(() => setAnalysisSteps(prev => [...prev, "Extracting hazard footprints and thermal structures..."]), 1000),
      setTimeout(() => setAnalysisSteps(prev => [...prev, "Querying international Civil Defense & CBRN indices..."]), 2000),
      setTimeout(() => setAnalysisSteps(prev => [...prev, "Finalizing structural & tactical assessment protocols..."]), 3000)
    ];

    const activeKey = customApiKey || apiKey;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${activeKey}`;

    const promptText = `
      You are "DANGER DETECTOR" - an elite military-grade AI specializing in Civil Defense, emergency planning, and hazard mitigation.
      Analyze this image thoroughly and provide a structured, tactical JSON response following this exact format (JSON ONLY, do not wrap in markdown code blocks outside of the direct output, output pure valid JSON):

      {
        "threatLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
        "hazardCategory": "Structural" | "CBRN" | "Tactical" | "Environmental" | "Fire" | "Uncertain",
        "threatSummary": "A concise, formal one-sentence summary of the detected hazard.",
        "keyObservations": [
          "Observation detail 1",
          "Observation detail 2",
          "Observation detail 3"
        ],
        "imminentRisks": [
          "Risk factor 1",
          "Risk factor 2"
        ],
        "tacticalProtocols": [
          "Emergency Action Step 1",
          "Emergency Action Step 2",
          "Emergency Action Step 3"
        ],
        "recommendedGear": [
          "Recommended Equipment 1",
          "Recommended Equipment 2"
        ]
      }

      Additional Context/User Query: "${customPrompt}"
    `;

    const payload = {
      contents: [{
        parts: [
          { text: promptText },
          { inlineData: { mimeType: "image/png", data: base64Image } }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    try {
      const data = await callWithRetry(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const cleanJson = JSON.parse(responseText.trim());
      
      setAnalysisResult(cleanJson);
      
      // Update system logs with new threat event
      const logTime = new Date().toTimeString().split(' ')[0];
      setAlertLogs(prev => [
        { 
          id: Date.now(), 
          time: logTime, 
          type: cleanJson.threatLevel, 
          message: `NEW INCIDENT: [${cleanJson.hazardCategory}] - Threat assessed as ${cleanJson.threatLevel}.` 
        },
        ...prev
      ]);
      
      showToast("Intelligence feed processed successfully.");
    } catch (error) {
      console.error(error);
      showToast(`Analysis Failure: ${error.message}`);
    } finally {
      stepIntervals.forEach(clearTimeout);
      setIsAnalyzing(false);
      setAnalysisSteps([]);
    }
  };

  // Convert the assessed threat or any text to automated vocal warning (TTS)
  const synthesizeEmergencyBroadcast = async (textToSpeak) => {
    if (!textToSpeak) return;
    setIsSynthesizing(true);
    setAudioUrl(null);

    const activeKey = customApiKey || apiKey;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${activeKey}`;

    const ttsText = `Say in a clear, authoritative, and urgent military dispatch voice: "${textToSpeak}"`;

    const payload = {
      contents: [{ parts: [{ text: ttsText }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: selectedVoice
            }
          }
        }
      },
      model: "gemini-2.5-flash-preview-tts"
    };

    try {
      const data = await callWithRetry(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const pcmBase64 = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      if (!pcmBase64) {
        throw new Error("No synthesized audio payload returned from threat broadcast node.");
      }

      // Convert PCM16 (L16) to a playable WAV data URL (typically 24kHz or 16kHz)
      const convertedUrl = pcmToWav(pcmBase64, 24000);
      setAudioUrl(convertedUrl);
      showToast("Emergency vocal warning synthesized. Standby to play.");
    } catch (error) {
      console.error(error);
      showToast(`Vocal Synth Failed: ${error.message}`);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Convert PCM 16-bit Mono Audio to WAV helper
  const pcmToWav = (pcmDataB64, sampleRate = 24000) => {
    const binaryString = atob(pcmDataB64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const buffer = bytes.buffer;
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    // File length
    view.setUint32(4, 36 + len, true);
    // RIFF type
    view.setUint32(8, 0x57415645, false); // "WAVE"
    // Format chunk identifier
    view.setUint32(12, 0x666d7420, false); // "fmt "
    // Format chunk length
    view.setUint32(16, 16, true);
    // Sample format (1 is PCM Integer)
    view.setUint16(20, 1, true);
    // Channel count (1 is Mono)
    view.setUint16(22, 1, true);
    // Sample rate
    view.setUint32(24, sampleRate, true);
    // Byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 2, true);
    // Block align
    view.setUint16(32, 2, true);
    // Bits per sample (16-bit)
    view.setUint16(34, 16, true);
    // Data chunk identifier
    view.setUint32(36, 0x64617461, false); // "data"
    // Chunk length
    view.setUint32(40, len, true);
    
    const blob = new Blob([wavHeader, buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };

  // Safe clipboard extraction mechanism for embedded environments
  const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast("Incident report copied to tactical clipboard.");
  };

  const getThreatColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-500 border-red-900 bg-red-950/25';
      case 'HIGH': return 'text-amber-500 border-amber-950 bg-amber-950/20';
      case 'MEDIUM': return 'text-yellow-400 border-yellow-950 bg-yellow-950/10';
      case 'LOW': return 'text-emerald-500 border-emerald-950 bg-emerald-950/10';
      default: return 'text-slate-400 border-slate-800 bg-slate-900/40';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-mono text-xs selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top HUD/Header bar */}
      <header className="border-b border-slate-900 bg-slate-950 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-500 animate-pulse">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-slate-100 flex items-center gap-2">
              CIVIL DEFENSE COMMAND <span className="text-amber-500">[CD-TCC-v2.6]</span>
            </h1>
            <p className="text-slate-500 text-[10px] tracking-tight uppercase">Visual Threat Assessment & Dispatch Protocols Node</p>
          </div>
        </div>

        {/* Global Stats / Status */}
        <div className="flex items-center gap-4 flex-wrap text-[10px]">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-slate-400">SAT FEED: CONNECTED</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">09:25:00 UTC</span>
          </div>
          <button 
            onClick={() => setShowApiSettings(!showApiSettings)} 
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded flex items-center gap-1.5 transition text-slate-400 hover:text-slate-200"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>API {customApiKey ? 'SET' : 'AUTO'}</span>
          </button>

          <button
            onClick={() => window.open(gemUrl, '_blank')}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-3 py-1.5 rounded flex items-center gap-1.5 transition"
          >
            <Play className="w-3.5 h-3.5 text-slate-950" />
            <span>Open GEM</span>
          </button>

          <button 
            onClick={() => setShowGemEmbed(!showGemEmbed)}
            className={`bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded flex items-center gap-1.5 transition text-slate-400 hover:text-slate-200 ${showGemEmbed ? 'ring-2 ring-amber-500' : ''}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showGemEmbed ? 'Hide Embed' : 'Embed GEM'}</span>
          </button>
        </div>
      </header>

      {/* Custom API Key Config Box */}
      {showApiSettings && (
        <div className="bg-slate-900/90 border-b border-slate-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="max-w-md">
            <h4 className="text-amber-500 font-bold mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Key Configuration Override
            </h4>
            <p className="text-slate-400 text-[10px] leading-relaxed">
              CD-TCC automatically detects cloud keys in sandbox execution environments. If you are experiencing timeouts or plan to use this on independent infrastructure, override the key here.
            </p>
          </div>
          <div className="flex w-full md:w-auto items-center gap-2">
            <input 
              type="password" 
              placeholder="Enter Gemini API Key..." 
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-700 px-3 py-2 rounded focus:outline-none focus:border-amber-500 text-[11px] w-full md:w-64"
            />
            {customApiKey && (
              <button 
                onClick={() => { setCustomApiKey(""); showToast("Reset to system API key"); }}
                className="bg-red-950/40 text-red-500 border border-red-900 px-3 py-2 rounded hover:bg-red-900/20"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Command Dashboard Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Side Navigation Panel */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-900 bg-slate-950/50 p-4 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible shrink-0">
          <div className="hidden lg:block mb-4 text-[10px] tracking-widest text-slate-500 uppercase font-black">
            Operational Sectors
          </div>
          
          <button 
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded transition font-medium text-left whitespace-nowrap lg:w-full ${activeTab === 'analyzer' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'hover:bg-slate-900 text-slate-400'}`}
          >
            <Eye className="w-4 h-4" />
            <div className="flex-1 text-xs">Visual Threat Scanner</div>
          </button>

          <button 
            onClick={() => setActiveTab('protocols')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded transition font-medium text-left whitespace-nowrap lg:w-full ${activeTab === 'protocols' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'hover:bg-slate-900 text-slate-400'}`}
          >
            <BookOpen className="w-4 h-4" />
            <div className="flex-1 text-xs">Emergency Protocol Manual</div>
          </button>

          <button 
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded transition font-medium text-left whitespace-nowrap lg:w-full ${activeTab === 'logs' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'hover:bg-slate-900 text-slate-400'}`}
          >
            <Radio className="w-4 h-4" />
            <div className="flex-1 text-xs flex items-center justify-between">
              <span>Intel Logs Feed</span>
              <span className="bg-slate-900 px-1.5 py-0.5 rounded text-[9px] text-slate-400 border border-slate-800">{alertLogs.length}</span>
            </div>
          </button>

          <div className="hidden lg:block mt-auto pt-6 border-t border-slate-900 text-slate-600 text-[10px] leading-relaxed">
            <div className="flex items-center gap-1.5 mb-1 text-slate-500 font-bold uppercase">
              <Shield className="w-3 h-3 text-amber-500/60" /> SECURITY NOTE
            </div>
            All visual uploads processed in sandboxed environment. Emergency protocols comply with FEMA & international civil protection guidelines.
          </div>
        </aside>

        {/* Dynamic Center Work Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950/20">
          
          {showGemEmbed && (
            <div className="mb-4">
              <div className="text-[11px] text-slate-400 mb-2">Embedded Gemini GEM (may be blocked by X-Frame-Options; opens in new tab if blocked)</div>
              <div className="w-full h-96 border border-slate-800 rounded overflow-hidden">
                <iframe src={gemUrl} title="Gemini GEM" className="w-full h-full" sandbox="allow-forms allow-same-origin allow-scripts" />
              </div>
            </div>
          )}

          {/* TAB 1: VISUAL THREAT SCANNER */}
          {activeTab === 'analyzer' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* Left Column: Input and Intelligence Feeds */}
              <div className="xl:col-span-5 flex flex-col gap-6">
                
                {/* Visual Asset Loading Block */}
                <div className="border border-slate-900 bg-slate-900/30 rounded p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-500" /> VISUAL ASSET LOAD
                    </span>
                    {image && (
                      <button 
                        onClick={() => { setImage(null); setBase64Image(null); setAnalysisResult(null); }}
                        className="text-[10px] text-red-500 hover:underline"
                      >
                        Purge Image
                      </button>
                    )}
                  </div>

                  {/* Drag-and-Drop Area */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition ${isDragging ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'}`}
                  >
                    {image ? (
                      <div className="relative w-full max-h-64 rounded overflow-hidden border border-slate-800">
                        <img src={image} alt="Intelligence Asset" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded text-slate-400">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-slate-300 font-medium">Drag intelligence asset here</p>
                          <p className="text-slate-500 text-[10px] mt-1">PNG, JPG or WEBP formats supported</p>
                        </div>
                        <label className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 px-3 py-1.5 rounded cursor-pointer transition text-[10px] font-bold">
                          Select Local File
                          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tactical Parameters Formulation */}
                <div className="border border-slate-900 bg-slate-900/30 rounded p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-500" /> TACTICAL PARAMETERS
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-slate-400 text-[10px]">SUPPLEMENTAL OBSERVATIONS / QUESTIONS (OPTIONAL)</label>
                    <textarea 
                      placeholder="e.g. Specify if the structure is a school, describe smell of chemicals, or prompt for specific evacuation distances."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-700 p-2.5 rounded h-24 focus:outline-none focus:border-amber-500/60 leading-relaxed font-mono"
                    />
                  </div>

                  <button 
                    onClick={runVisualThreatAnalysis}
                    disabled={!image || isAnalyzing}
                    className={`w-full font-black tracking-widest py-3 px-4 rounded text-xs transition uppercase flex items-center justify-center gap-2 ${!image ? 'bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md font-bold'}`}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Intelligence Asset...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Execute Hazard Analysis
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* Right Column: Tactical Analysis Output */}
              <div className="xl:col-span-7 flex flex-col gap-6">
                
                {isAnalyzing ? (
                  <div className="border border-amber-500/20 bg-amber-500/5 rounded-lg p-6 flex flex-col justify-center min-h-[400px]">
                    <div className="flex items-center gap-3 mb-6">
                      <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                      <div className="animate-pulse">
                        <h4 className="text-amber-500 font-bold tracking-widest uppercase">Executing Danger Scanner</h4>
                        <p className="text-slate-500 text-[10px]">Real-time Civil Defense heuristics model processing...</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 font-mono border-l border-amber-500/30 pl-4 py-2">
                      {analysisSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-400 text-[10px] animate-fade-in">
                          <span className="text-amber-500">❯</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : analysisResult ? (
                  <div className="flex flex-col gap-6">
                    
                    {/* Threat Assessment Level Card */}
                    <div className={`border-2 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${getThreatColor(analysisResult.threatLevel)}`}>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-950/80 border border-current rounded-full">
                          <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="text-[10px] tracking-widest font-bold opacity-75">THREAT INTEL RECONNAISSANCE</div>
                          <h2 className="text-xl font-black tracking-widest">{analysisResult.threatLevel} STATUS</h2>
                          <div className="text-[11px] mt-1 text-slate-300 font-medium">Category: <span className="font-bold underline">{analysisResult.hazardCategory}</span></div>
                        </div>
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-right md:border-l md:border-slate-800 md:pl-6">
                        <div className="text-slate-400">Scan Timestamp</div>
                        <div className="font-black text-slate-100">{new Date().toLocaleTimeString()}</div>
                        <div className="text-slate-500">Source: Mobile Telemetry</div>
                      </div>
                    </div>

                    {/* Threat Analysis Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Observations Card */}
                      <div className="border border-slate-900 bg-slate-900/30 rounded p-4 flex flex-col gap-3">
                        <span className="font-bold text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-amber-500" /> VISUAL OBSERVATIONS
                        </span>
                        <ul className="flex flex-col gap-2.5">
                          {analysisResult.keyObservations?.map((obs, idx) => (
                            <li key={idx} className="text-slate-400 leading-relaxed flex items-start gap-2">
                              <span className="text-amber-500 shrink-0 mt-1">▪</span>
                              <span>{obs}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Imminent Risks Card */}
                      <div className="border border-slate-900 bg-slate-900/30 rounded p-4 flex flex-col gap-3">
                        <span className="font-bold text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> IMMINENT HAZARD FORECAST
                        </span>
                        <ul className="flex flex-col gap-2.5">
                          {analysisResult.imminentRisks?.map((risk, idx) => (
                            <li key={idx} className="text-slate-400 leading-relaxed flex items-start gap-2">
                              <span className="text-red-500 shrink-0 mt-1">▪</span>
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    {/* Recommended Civil Defense Protocols */}
                    <div className="border border-slate-900 bg-slate-900/30 rounded p-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5 text-xs">
                          <Shield className="w-4 h-4 text-emerald-500" /> IMMEDIATE DEFENSIVE ACTIONS
                        </span>
                        <button 
                          onClick={() => {
                            const reportMarkdown = `
# CIVIL DEFENSE EMERGENCY ASSESSMENT REPORT
Threat Level: ${analysisResult.threatLevel}
Category: ${analysisResult.hazardCategory}
Summary: ${analysisResult.threatSummary}

## Key Observations
${analysisResult.keyObservations?.map(o => `- ${o}`).join('\n')}

## Immediate Risks
${analysisResult.imminentRisks?.map(r => `- ${r}`).join('\n')}

## Recommended Civil Defense Protocols
${analysisResult.tacticalProtocols?.map(p => `- ${p}`).join('\n')}
                            `;
                            copyToClipboard(reportMarkdown.trim());
                          }}
                          className="bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 text-[10px] px-3 py-1.5 rounded flex items-center gap-1.5 transition"
                        >
                          <Copy className="w-3 h-3" /> Copy Full Incident Report
                        </button>
                      </div>

                      <div className="bg-slate-950 p-4 border border-slate-900 rounded text-slate-300 leading-relaxed font-bold">
                        {analysisResult.threatSummary}
                      </div>

                      <ul className="flex flex-col gap-3">
                        {analysisResult.tacticalProtocols?.map((pt, idx) => (
                          <li key={idx} className="bg-slate-950/50 p-3 rounded border border-slate-900 hover:border-slate-800 flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-500 flex items-center justify-center shrink-0 font-bold text-[10px] border border-emerald-900">
                              {idx + 1}
                            </span>
                            <span className="text-slate-300 leading-relaxed">{pt}</span>
                          </li>
                        ))}
                      </ul>

                      {analysisResult.recommendedGear && (
                        <div className="mt-2 border-t border-slate-900 pt-4">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Required Personal Protection Equipment (PPE)</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {analysisResult.recommendedGear.map((g, i) => (
                              <span key={i} className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] px-2.5 py-1 rounded">
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Integrated Dispatch Audio Broadcast Module */}
                    <div className="border border-amber-500/20 bg-amber-500/5 rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-3 max-w-md">
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500 animate-pulse">
                          <Volume2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-amber-500 font-bold tracking-widest uppercase">Synthesize Tactical Vocal Warning</h4>
                          <p className="text-slate-400 text-[10px] leading-relaxed mt-0.5">
                            Use Gemini's audio model to synthesize an automated emergency vocal warning to stream over civil radio bands.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-[10px]">VOICE DESPATCH:</span>
                          <select 
                            value={selectedVoice} 
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-slate-200 px-2 py-1 rounded text-[10px]"
                          >
                            <option value="Fenrir">Fenrir (Deep Tactical)</option>
                            <option value="Zephyr">Zephyr (Clear dispatch)</option>
                            <option value="Kore">Kore (Calm dispatch)</option>
                            <option value="Aoede">Aoede (Clear emergency tone)</option>
                          </select>
                        </div>

                        {audioUrl ? (
                          <div className="flex items-center gap-2 bg-slate-950 border border-slate-900 p-2 rounded">
                            <audio src={audioUrl} controls className="h-6 text-xs w-full max-w-[200px]" />
                            <button 
                              onClick={() => setAudioUrl(null)}
                              className="text-red-500 text-[9px] hover:underline px-2"
                            >
                              Reset
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              const alertSentence = `Alert. Threat level identified as ${analysisResult.threatLevel}. ${analysisResult.threatSummary} Execute immediate defensive containment actions.`;
                              synthesizeEmergencyBroadcast(alertSentence);
                            }}
                            disabled={isSynthesizing}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded text-[11px] flex items-center justify-center gap-2 transition"
                          >
                            {isSynthesizing ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Synthesizing...
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                Broadcast Incident Alert
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="border border-slate-900 bg-slate-900/10 rounded-lg p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="p-4 bg-slate-900 border border-slate-850 rounded-full text-slate-500 mb-4">
                      <Shield className="w-10 h-10" />
                    </div>
                    <h3 className="text-slate-300 font-bold tracking-widest uppercase">Awaiting Visual Intelligence</h3>
                    <p className="text-slate-500 max-w-sm mx-auto text-[10px] mt-2 leading-relaxed">
                      Please upload field imagery on the left panel (such as structure collapse, hazardous spills, floods, tactical damage) and click 'Execute Hazard Analysis' to generate official Civil Defense actions.
                    </p>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB 2: EMERGENCY PROTOCOL MANUAL */}
          {activeTab === 'protocols' && (
            <div className="flex flex-col gap-6">
              
              <div className="border border-slate-900 bg-slate-900/30 rounded-lg p-6">
                <h3 className="text-sm font-black text-amber-500 tracking-widest uppercase flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4" /> OFFICIAL CIVIL PROTECTION STANDARDS
                </h3>
                <p className="text-slate-400 text-[10px] max-w-2xl leading-relaxed">
                  Browse standard contingency actions developed by national civil defense teams. These can be executed immediately while waiting for emergency responders or automated visual AI damage scans.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left Panel: Protocol List */}
                <div className="md:col-span-1 flex flex-col gap-3">
                  {protocolsDatabase.map((prot) => (
                    <button 
                      key={prot.id}
                      onClick={() => setSelectedProtocol(prot)}
                      className={`text-left p-4 rounded border transition ${selectedProtocol?.id === prot.id ? 'bg-amber-500/10 border-amber-500/40 text-slate-100' : 'bg-slate-900/30 border-slate-900 hover:border-slate-800 text-slate-400'}`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[10px] text-amber-500 font-bold tracking-widest">{prot.id}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${prot.level === 'CRITICAL' ? 'bg-red-950 text-red-500' : 'bg-amber-950 text-amber-500'}`}>
                          {prot.level}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs line-clamp-2 leading-relaxed text-slate-200">{prot.title}</h4>
                      <div className="text-[10px] text-slate-500 mt-2">Hazard Class: {prot.category}</div>
                    </button>
                  ))}
                </div>

                {/* Right Panel: Selected Protocol Details */}
                <div className="md:col-span-2">
                  {selectedProtocol ? (
                    <div className="border border-slate-900 bg-slate-900/30 rounded p-6 flex flex-col gap-6">
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                        <div>
                          <div className="text-[10px] text-amber-500 font-bold">{selectedProtocol.id} // STANDARD OPERATING DIRECTIVE</div>
                          <h3 className="text-base font-black text-slate-200 mt-1">{selectedProtocol.title}</h3>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-1 rounded inline-block self-start ${selectedProtocol.level === 'CRITICAL' ? 'bg-red-950 border border-red-900 text-red-500' : 'bg-amber-950 border border-amber-900 text-amber-500'}`}>
                          {selectedProtocol.level}
                        </span>
                      </div>

                      <div className="flex flex-col gap-3">
                        <span className="text-[10px] text-slate-500 font-black tracking-wider uppercase">Evacuation & Containment Guidelines</span>
                        <ul className="flex flex-col gap-3">
                          {selectedProtocol.guidelines.map((g, idx) => (
                            <li key={idx} className="bg-slate-950 p-4 rounded border border-slate-900 flex items-start gap-3">
                              <span className="text-amber-500 shrink-0 mt-0.5 font-bold">❯</span>
                              <span className="text-slate-300 leading-relaxed text-[11px]">{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t border-slate-805 pt-4">
                        <span className="text-[10px] text-slate-500 font-black tracking-wider uppercase block mb-2">Required Equipment Inventory</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedProtocol.equipment.map((eq, i) => (
                            <span key={i} className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded text-[10px]">
                              {eq}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 border border-slate-900 rounded-lg flex items-center justify-between gap-4 mt-2">
                        <div>
                          <h4 className="font-bold text-slate-300">Generate Tactical Voice Dispatch</h4>
                          <p className="text-slate-500 text-[10px] mt-0.5">Synthesizes the first directive of this protocol for megaphone/PA transmission.</p>
                        </div>
                        <button 
                          onClick={() => synthesizeEmergencyBroadcast(`Operational Alert. ${selectedProtocol.guidelines[0]}`)}
                          disabled={isSynthesizing}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded text-[10px] flex items-center gap-1.5 shrink-0 transition"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Speak Guide
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="border border-slate-900 bg-slate-900/10 rounded-lg p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                      <BookOpen className="w-10 h-10 text-slate-600 mb-3" />
                      <h4 className="text-slate-300 font-bold tracking-widest uppercase">Protocol Reader Standby</h4>
                      <p className="text-slate-500 max-w-sm mx-auto text-[10px] mt-2">
                        Select a Civil Defense Protocol category from the left column list to review comprehensive tactical guidelines and mitigation plans.
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: INTEL LOGS FEED */}
          {activeTab === 'logs' && (
            <div className="flex flex-col gap-6">
              
              <div className="border border-slate-900 bg-slate-900/30 rounded-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-amber-500 tracking-widest uppercase flex items-center gap-2">
                    <Radio className="w-4 h-4 animate-pulse" /> LIVE TELEMETRY INTEL FEED
                  </h3>
                  <p className="text-slate-400 text-[10px] mt-1 leading-relaxed">
                    This feed tracks live scanning logs, atmospheric changes, and threat levels registered by the local command terminal during the current mission session.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setAlertLogs([
                      { id: Date.now(), time: new Date().toTimeString().split(' ')[0], type: "SYSTEM", message: "Terminal metrics forced manual recalibration." },
                      ...alertLogs
                    ]);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded text-[10px] flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Trigger Simulated Log Ping
                </button>
              </div>

              <div className="border border-slate-900 bg-slate-900/20 rounded-lg overflow-hidden">
                <div className="bg-slate-900/60 p-3 border-b border-slate-900 grid grid-cols-12 font-bold text-slate-400">
                  <div className="col-span-2">TIMESTAMP</div>
                  <div className="col-span-2">THREAT/TYPE</div>
                  <div className="col-span-8">LOG DESCRIPTION</div>
                </div>

                <div className="flex flex-col divide-y divide-slate-900/40 font-mono">
                  {alertLogs.map((log) => (
                    <div key={log.id} className="p-3.5 grid grid-cols-12 hover:bg-slate-900/20 transition items-center text-[11px]">
                      <div className="col-span-2 text-slate-500">{log.time}</div>
                      <div className="col-span-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${log.type === 'CRITICAL' ? 'bg-red-950/40 border-red-900/50 text-red-500' : log.type === 'HIGH' ? 'bg-amber-950/30 border-amber-900/40 text-amber-500' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                          {log.type}
                        </span>
                      </div>
                      <div className="col-span-8 text-slate-300 leading-relaxed font-bold">{log.message}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Footer System Status Bar */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-3 flex flex-col md:flex-row items-center justify-between text-[10px] text-slate-500 gap-2">
        <div>
          CIVIL DEFENSE COMMAND CENTER NODE • CURRENT SECTOR: NORTHERN SECTOR B-4
        </div>
        <div className="flex items-center gap-4">
          <span className="text-amber-500/80 font-bold">GEMINI 2.5 FLASH PROACTIVE THREAT ANALYSIS ACTIVE</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>
      </footer>

      {/* Global Status Toast Notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-slate-100 px-4 py-3 rounded shadow-2xl flex items-center gap-2 animate-fade-in font-mono text-[11px] max-w-sm">
          <Shield className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}