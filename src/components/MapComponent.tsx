import { useRef, useEffect, useState } from 'react';
import { EvacuationSpot, SpotType } from '../types';
import { 
  Compass,
  Search,
  MapPin
} from 'lucide-react';

interface MapComponentProps {
  spots: EvacuationSpot[];
  selectedSpot: EvacuationSpot | null;
  onSelectSpot: (spot: EvacuationSpot | null) => void;
  userLocation: { lat: number; lng: number } | null;
  onUserLocationDetected: (loc: { lat: number; lng: number }) => void;
  travelMode: 'WALKING' | 'DRIVING';
  activeRouteInfo: { distance: string; duration: string } | null;
  onRouteComputed: (info: { distance: string; duration: string } | null) => void;
  onMapClickToAdd: (coords: { lat: number; lng: number }, address?: string) => void;
}

// Convert emoji or symbol representation to string for Leaflet DivIcon
function getSymForType(type: SpotType): string {
  switch (type) {
    case 'shelter':
      return '🛡️';
    case 'undergroundParking':
      return '🚗';
    case 'tunnel':
      return '👷';
    case 'basement':
      return '🏢';
    case 'fortress':
      return '🏰';
    default:
      return '📍';
  }
}

export function MapComponent({
  spots,
  selectedSpot,
  onSelectSpot,
  userLocation,
  onUserLocationDetected,
  travelMode,
  onRouteComputed,
  onMapClickToAdd
}: MapComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  
  // Keep track of layers to clean them up dynamically on state modifications
  const markersLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const searchMarkerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const heatmapLayerRef = useRef<any>(null);

  const [isReady, setIsReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite' | 'heatmap'>('standard');

  // Address lookup handler for search bar
  const handleAddressSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    const L = (window as any).L;
    const map = mapRef.current;
    if (!L || !map) {
      setIsSearching(false);
      return;
    }

    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Szczecin')}&format=json&limit=5&accept-language=pl`, {
      headers: {
        'User-Agent': 'Szczecin-SafePoint-App/1.0'
      }
    })
      .then(res => res.json())
      .then(results => {
        setIsSearching(false);
        if (results && results.length > 0) {
          const first = results[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);

          map.setView([lat, lng], 16);

          if (searchMarkerRef.current) {
            try {
              searchMarkerRef.current.remove();
            } catch (err) {}
            searchMarkerRef.current = null;
          }

          const targetIcon = L.divIcon({
            html: `
              <div class="relative flex items-center justify-center">
                <span class="absolute inline-flex h-9 w-9 animate-ping rounded-full bg-orange-500 opacity-45"></span>
                <div class="bg-black text-orange-400 p-2 rounded-full border border-orange-500 shadow-[0_0_15px_#f97316] font-mono font-bold leading-none">
                  🎯
                </div>
              </div>
            `,
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const newSearchMarker = L.marker([lat, lng], { icon: targetIcon })
            .addTo(map)
            .bindPopup(`
              <div class="p-3 font-mono text-[11px] leading-relaxed max-w-[220px]">
                <div class="text-orange-400 font-bold border-b border-orange-500/15 pb-1 mb-1 uppercase tracking-wide flex items-center justify-between">
                  <span>WYSZUKANY ADRES</span>
                </div>
                <div class="text-zinc-200 mt-1 font-semibold mb-1 leading-snug">${first.display_name.split(', Szczecin')[0]}</div>
                <div class="text-[9.5px] text-zinc-500 mb-2.5">Koordynaty: ${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
                
                <button 
                  id="search-add-btn" 
                  class="w-full bg-[#00FF00]/10 hover:bg-[#00FF00] text-[#00FF00] hover:text-black font-mono font-black text-[9.5px] py-1.5 rounded border border-[#00FF00]/30 transition-all uppercase cursor-pointer animate-pulse"
                >
                  Zaproponuj Schron Tutaj
                </button>
              </div>
            `);

          searchMarkerRef.current = newSearchMarker;
          newSearchMarker.openPopup();

          newSearchMarker.on('popupopen', () => {
            const btn = document.getElementById('search-add-btn');
            if (btn) {
              btn.addEventListener('click', () => {
                onMapClickToAdd({ lat, lng }, first.display_name.split(', Szczecin')[0]);
              });
            }
          });
        } else {
          alert("Nie odnaleziono podanej dogodnej lokalizacji w Szczecinie. Spróbuj wpisać np: 'Niepodległości', 'Plac Rodła' czy 'Krzywoustego'.");
        }
      })
      .catch(err => {
        setIsSearching(false);
        console.warn("Błąd wyszukiwania geolokalizacji:", err);
        alert("Błąd połączenia z serwerem geokodowania.");
      });
  };

  // Initialize Leaflet Map inside the viewport container
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !containerRef.current || mapRef.current) return;

    // Center of Szczecin
    const initLat = 53.4285;
    const initLng = 14.5528;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([initLat, initLng], 13);

    // Dark cartographic tiles layer perfectly matching Szczecin Defense HUD theme
    const baseTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);
    tileLayerRef.current = baseTile;

    // Initialize tactical heatmap layer group
    const heatmapLayer = L.layerGroup().addTo(map);
    heatmapLayerRef.current = heatmapLayer;

    // Custom attribution overlay
    L.control.attribution({
      prefix: 'OpenStreetMap'
    }).addTo(map);

    // Zoom buttons in the bottom right corner
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Sub-layer for all civil defense spots
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Attach map clicks to report new locations with reverse geocoding
    const clickPopup = L.popup();
    map.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      // Display real-time loading feedback on the map
      clickPopup
        .setLatLng([lat, lng])
        .setContent(`
          <div class="p-2 font-mono text-[10px] leading-tight text-center">
            <span class="text-[#00FF00] animate-pulse font-bold">📡 Pobieranie adresu z bazy OSM...</span>
            <div class="text-[8px] text-zinc-500 mt-1">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
          </div>
        `)
        .openOn(map);

      // Fetch reverse geocode address layout from OSM Nominatim
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pl`, {
        headers: {
          'User-Agent': 'Szczecin-SafePoint-App/1.0'
        }
      })
        .then(res => res.json())
        .then(data => {
          const rawAddress = data.display_name || '';
          let address = rawAddress;
          const sznIndex = rawAddress.indexOf('Szczecin');
          if (sznIndex !== -1) {
            address = rawAddress.substring(0, sznIndex + 8); // Keep the address up to "Szczecin"
          }
          if (!address) {
            address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          }

          clickPopup.setContent(`
            <div class="p-2.5 font-mono text-[11px] leading-tight max-w-[220px]">
              <div class="text-[#00FF00] font-black mb-1 border-b border-[#00FF00]/15 pb-0.5 uppercase tracking-wide flex items-center justify-between">
                <span>📍 ODPOWIEDNIK ADRESOWY</span>
              </div>
              <div class="text-zinc-200 mt-1.5 font-bold mb-1 leading-snug">${address}</div>
              <p class="text-[9px] text-zinc-500 mt-2 leading-relaxed font-medium">
                Przesłano formularz propozycji nowego schronu o adresie: <span class="text-zinc-400 font-semibold">${address}</span>. Możesz go zapisać w bocznym panelu "Zgłoś schron".
              </p>
            </div>
          `);

          onMapClickToAdd({ lat, lng }, address);
        })
        .catch(err => {
          console.warn("Reverse geocoding error:", err);
          const fallbackAddress = `Szczecin [${lat.toFixed(4)}, ${lng.toFixed(4)}]`;
          clickPopup.setContent(`
            <div class="p-2 font-mono text-[11px] leading-tight max-w-[200px]">
              <div class="text-amber-500 font-bold mb-1 border-b border-amber-900/40 pb-0.5">WSPÓŁRZĘDNE GPS</div>
              <div class="text-zinc-200 font-bold mb-1">Wybrana pozycja na mapie</div>
              <div class="text-zinc-500 text-[10px] mt-1 mb-1">Szerokość: ${lat.toFixed(5)}<br/>Długość: ${lng.toFixed(5)}</div>
              <div class="text-[9.5px] text-amber-500/80">Błąd pobierania adresu (Serwer OSM zajęty). Formularz wypełniono koordynatami.</div>
            </div>
          `);
          onMapClickToAdd({ lat, lng }, fallbackAddress);
        });
    });

    mapRef.current = map;
    setIsReady(true);

    // Attempt automatic browser geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          onUserLocationDetected(loc);
          if (mapRef.current) {
            mapRef.current.setView([loc.lat, loc.lng], 14);
          }
        },
        (err) => {
          console.warn("Lokalizacja niedostępna lub odrzucona:", err.message);
        }
      );
    }

    return () => {
      setIsReady(false);
      
      // Clean up route polyline
      if (routePolylineRef.current) {
        try {
          routePolylineRef.current.remove();
        } catch (e) {}
        routePolylineRef.current = null;
      }

      // Clean up user marker
      if (userMarkerRef.current) {
        try {
          userMarkerRef.current.remove();
        } catch (e) {}
        userMarkerRef.current = null;
      }

      // Clean up search marker
      if (searchMarkerRef.current) {
        try {
          searchMarkerRef.current.remove();
        } catch (e) {}
        searchMarkerRef.current = null;
      }

      // Clean up markers layer group
      if (markersLayerRef.current) {
        try {
          markersLayerRef.current.clearLayers();
          markersLayerRef.current.remove();
        } catch (e) {}
        markersLayerRef.current = null;
      }

      // Clean up base layer & heatmap layer
      if (tileLayerRef.current) {
        try {
          tileLayerRef.current.remove();
        } catch (e) {}
        tileLayerRef.current = null;
      }

      if (heatmapLayerRef.current) {
        try {
          heatmapLayerRef.current.clearLayers();
          heatmapLayerRef.current.remove();
        } catch (e) {}
        heatmapLayerRef.current = null;
      }

      if (mapRef.current) {
        try {
          mapRef.current.off();
          mapRef.current.remove();
        } catch (e) {
          console.warn("Error during map teardown:", e);
        }
        mapRef.current = null;
      }
    };
  }, []);

  // Sync user location marker
  useEffect(() => {
    const L = (window as any).L;
    const map = mapRef.current;
    if (!L || !map || !isReady) return;

    let markerInstance: any = null;

    if (userLocation) {
      if (userMarkerRef.current) {
        try {
          userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
          markerInstance = userMarkerRef.current;
        } catch (e) {
          console.warn("Could not setLatLng on userMarkerRef, recreating marker:", e);
          try {
            userMarkerRef.current.remove();
          } catch (err) {}
          userMarkerRef.current = null;
        }
      }

      if (!userMarkerRef.current) {
        // Glowing cyan marker with custom CSS transition class
        const userIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center">
              <span class="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-blue-500 opacity-40"></span>
              <div class="bg-blue-600 text-white p-1.5 rounded-full border border-white shadow-[0_0_12px_#3b82f6]">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="transform rotate-45"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </div>
            </div>
          `,
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        try {
          const newMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
            .addTo(map)
            .bindPopup('<strong class="font-mono text-zinc-900 text-xs text-center block">Twoja pozycja GPS</strong>');
          userMarkerRef.current = newMarker;
          markerInstance = newMarker;
        } catch (e) {
          console.warn("Could not add user location marker to map:", e);
        }
      }
    }

    return () => {
      // Clear marker instance specifically on change, but only if map is still mounted
      if (markerInstance && mapRef.current) {
        try {
          markerInstance.remove();
        } catch (err) {}
      }
      userMarkerRef.current = null;
    };
  }, [userLocation, isReady]);

  // Sync map tiles and tactical heatmap layers
  useEffect(() => {
    const L = (window as any).L;
    const map = mapRef.current;
    if (!L || !map || !isReady) return;

    // 1. Update Tile URL based on style selection
    // Satellite uses Esri World imagery, standard/heatmap defaults to CartoDB Dark Matter
    const url = mapStyle === 'satellite' 
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(url);
    }

    // 2. Manage Heatmap layer
    const heatmapLayer = heatmapLayerRef.current;
    if (heatmapLayer) {
      heatmapLayer.clearLayers();

      if (mapStyle === 'heatmap') {
        // Find verified shelters only
        const verifiedSpots = spots.filter(s => s.verified);
        
        // Draw overlapping density circles with a green toxic terminal glow
        verifiedSpots.forEach(spot => {
          // Inner core density
          const innerCore = L.circle([spot.lat, spot.lng], {
            radius: 180,
            fillColor: '#00FF00',
            fillOpacity: 0.18,
            color: '#00FF00',
            weight: 1,
            opacity: 0.35,
            interactive: false
          });

          // Mid coverage area
          const midArea = L.circle([spot.lat, spot.lng], {
            radius: 450,
            fillColor: '#00FF00',
            fillOpacity: 0.08,
            stroke: false,
            interactive: false
          });

          // Outer tactical range
          const outerRange = L.circle([spot.lat, spot.lng], {
            radius: 900,
            fillColor: '#00FF00',
            fillOpacity: 0.03,
            stroke: false,
            interactive: false
          });

          heatmapLayer.addLayer(innerCore);
          heatmapLayer.addLayer(midArea);
          heatmapLayer.addLayer(outerRange);
        });

        if (!map.hasLayer(heatmapLayer)) {
          heatmapLayer.addTo(map);
        }
      } else {
        if (map.hasLayer(heatmapLayer)) {
          map.removeLayer(heatmapLayer);
        }
      }
    }
  }, [mapStyle, spots, isReady]);

  // Render or re-evaluate shelter markers on filter logic modifications
  useEffect(() => {
    const L = (window as any).L;
    const markersLayer = markersLayerRef.current;
    if (!L || !markersLayer || !isReady || !mapRef.current) return;

    try {
      markersLayer.clearLayers();
    } catch (e) {
      console.warn("Error clearing markersLayer:", e);
    }

    spots.forEach((spot) => {
      const isSelected = selectedSpot?.id === spot.id;
      
      const glowColor = isSelected 
        ? 'rgba(0, 255, 0, 0.95)' 
        : spot.verified 
          ? 'rgba(0, 255, 0, 0.45)' 
          : 'rgba(245, 158, 11, 0.45)';

      const ringClass = isSelected
        ? 'border-white bg-[#00FF00] scale-120 animate-pulse text-black'
        : spot.verified
          ? 'border-[#00FF00] bg-[#030306] text-[#00FF00]'
          : 'border-amber-500 bg-[#030306] text-amber-500';

      const spotIcon = L.divIcon({
        html: `
          <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center transform transition-all hover:scale-125 hover:shadow-lg ${ringClass}" 
               style="box-shadow: 0 0 12px ${glowColor}; font-size: 15px;">
            ${getSymForType(spot.type)}
          </div>
        `,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      try {
        const marker = L.marker([spot.lat, spot.lng], { icon: spotIcon });
        
        marker.on('click', () => {
          onSelectSpot(spot);
        });

        // Short text description tooltip on hover
        const descTooltipHtml = `
          <div class="p-2 font-mono text-[10px] text-zinc-300 min-w-[200px] whitespace-normal leading-normal select-none">
            <div class="text-[#00FF00] font-black border-b border-[#00FF00]/15 pb-1 mb-1 uppercase text-[11px] flex items-center justify-between">
              <span>${spot.name}</span>
              <span class="text-[9px] bg-[#00FF00]/10 text-[#00FF00] px-1 py-0.5 rounded leading-none">${getSymForType(spot.type)}</span>
            </div>
            <p class="text-zinc-200 text-[10.5px] italic mb-1.5 leading-relaxed">"${spot.details || 'Pas ryglowy w gotowości operacyjnej.'}"</p>
            <div class="text-[9px] text-zinc-400 mb-0.5"><strong class="text-zinc-500 uppercase">Adres:</strong> ${spot.address}</div>
            <div class="flex justify-between text-[8px] text-zinc-500 pt-1 border-t border-zinc-900/60 mt-1">
              <span>Pojemność: <strong class="text-zinc-300 font-bold">${spot.capacity} os.</strong></span>
              <span class="${spot.verified ? 'text-[#00FF00] font-bold' : 'text-amber-500 font-bold'}">${spot.verified ? '✓ ZWERYFIKOWANY' : '⚠ SPOŁECZNOŚCIOWY'}</span>
            </div>
          </div>
        `;
        marker.bindTooltip(descTooltipHtml, {
          direction: 'top',
          offset: [0, -12],
          sticky: true,
          opacity: 0.98,
          className: 'custom-spot-tooltip border-2 border-[#00FF00]/30 bg-[#07070d] p-0 shadow-lg shadow-black/85'
        });

        markersLayer.addLayer(marker);
      } catch (e) {
        console.warn("Error creating or adding marker:", e);
      }
    });

    return () => {
      if (markersLayerRef.current && mapRef.current) {
        try {
          markersLayerRef.current.clearLayers();
        } catch (e) {}
      }
    };
  }, [spots, selectedSpot, isReady]);

  // Center view on newly selected spot from filters sidebar
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedSpot || !isReady) return;
    try {
      map.setView([selectedSpot.lat, selectedSpot.lng], 15);
    } catch (e) {
      console.warn("Error setting view on selected spot:", e);
    }
  }, [selectedSpot, isReady]);

  // Calculate high-fidelity real street route using OpenSource OSRM client APIs
  useEffect(() => {
    const L = (window as any).L;
    const map = mapRef.current;
    if (!L || !map || !isReady) return;

    let active = true;

    if (!userLocation || !selectedSpot) {
      if (routePolylineRef.current) {
        try {
          routePolylineRef.current.remove();
        } catch (e) {}
        routePolylineRef.current = null;
      }
      return;
    }

    const profile = travelMode === 'WALKING' ? 'foot' : 'driving';
    const osrmUrl = `https://router.project-osrm.org/route/v1/${profile}/${userLocation.lng},${userLocation.lat};${selectedSpot.lng},${selectedSpot.lat}?overview=full&geometries=geojson`;

    fetch(osrmUrl)
      .then((res) => res.json())
      .then((data) => {
        if (!active || !mapRef.current) return;

        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          const distMeters = route.distance || 0;
          const durationSecs = route.duration || 0;

          // Compute readable display text metrics
          const distText = distMeters >= 1000 
            ? `${(distMeters / 1000).toFixed(2)} km` 
            : `${Math.round(distMeters)} m`;

          const durationMins = Math.round(durationSecs / 60);
          const durationText = durationMins > 0 
            ? `${durationMins} min` 
            : `${Math.round(durationSecs)} sek`;

          onRouteComputed({ distance: distText, duration: durationText });

          // Parse route coordinates
          const pathPoints = route.geometry.coordinates.map((pt: any) => [pt[1], pt[0]]);

          if (routePolylineRef.current) {
            try {
              routePolylineRef.current.remove();
            } catch (e) {}
            routePolylineRef.current = null;
          }

          // Create a dynamic tactical glowing route on open street maps
          try {
            const poly = L.polyline(pathPoints, {
              color: '#00FF00',
              weight: 5,
              opacity: 0.9,
              dashArray: '8, 8',
              className: 'route-path-glowing'
            }).addTo(map);

            routePolylineRef.current = poly;

            // Recenter view to accommodate entire transit bounding box
            const b = L.latLngBounds(pathPoints);
            map.fitBounds(b, { padding: [60, 60] });
          } catch (e) {
            console.warn("Failed to draw interactive OSRM path points on canvas map:", e);
          }
        } else {
          throw new Error("No route points found");
        }
      })
      .catch((error) => {
        if (!active || !mapRef.current) return;
        console.warn("In-street routing call failed. Drawing straight rescue projection line:", error);
        
        // Solid backup line connection when OSRM API rate-limits
        const backupPoints = [
          [userLocation.lat, userLocation.lng],
          [selectedSpot.lat, selectedSpot.lng]
        ];

        if (routePolylineRef.current) {
          try {
            routePolylineRef.current.remove();
          } catch (e) {}
          routePolylineRef.current = null;
        }

        try {
          const poly = L.polyline(backupPoints, {
            color: '#00FF00',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 10'
          }).addTo(map);

          routePolylineRef.current = poly;

          // Approximate direct distance text
          const radLat1 = Math.PI * userLocation.lat / 180;
          const radLat2 = Math.PI * selectedSpot.lat / 180;
          const differenceLng = Math.PI * (selectedSpot.lng - userLocation.lng) / 180;
          const distKm = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(differenceLng);
          const distanceVal = Math.acos(Math.min(distKm, 1)) * 6371;

          const distanceText = distanceVal >= 1 
            ? `${distanceVal.toFixed(2)} km (lot ptaka)` 
            : `${Math.round(distanceVal * 1000)} m (lot ptaka)`;

          const walkingMin = Math.round(distanceVal * 15); // Average walking pace metric 4km/h
          const durationText = travelMode === 'WALKING' 
            ? `ok. ${walkingMin} min` 
            : `ok. ${Math.round(distanceVal * 3)} min`;

          onRouteComputed({ distance: distanceText, duration: durationText });

          map.fitBounds(L.latLngBounds(backupPoints), { padding: [50, 50] });
        } catch (e) {
          console.warn("Failed to draw straight path points fallback on canvas map:", e);
        }
      });

    return () => {
      active = false;
      if (routePolylineRef.current && mapRef.current) {
        try {
          routePolylineRef.current.remove();
        } catch (e) {}
        routePolylineRef.current = null;
      }
    };
  }, [userLocation, selectedSpot, travelMode, isReady]);

  // Request browser geolocation on user action
  const handleLocateUser = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          onUserLocationDetected(loc);
          mapRef.current.setView([loc.lat, loc.lng], 14);
        },
        (err) => {
          alert("Błąd lokalizacyjny: " + err.message);
        }
      );
    } else {
      alert("Twoja przeglądarka nie wspiera geolokalizacji.");
    }
  };

  return (
    <div className="relative w-full h-full min-h-[450px]">
      
      {/* Real-time Address and Street Search Bar Overlay */}
      <div className="absolute top-4 left-4 z-[1000] w-[calc(100%-2rem)] sm:w-80 md:w-[420px] flex flex-col gap-2">
        <form 
          onSubmit={handleAddressSearch}
          className="flex bg-black/90 p-1.5 rounded border border-[#00FF00]/25 shadow-[0_4px_25px_rgba(0,0,0,0.85)] pointer-events-auto items-center"
        >
          <div className="flex items-center justify-center p-1.5 text-zinc-500">
            <MapPin size={14} className="text-[#00FF00]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Wyszukaj ulice/adres w Szczecinie..."
            className="flex-1 bg-transparent border-0 text-[10.5px] font-mono p-1 text-white focus:outline-none focus:ring-0 placeholder:text-zinc-600 uppercase"
            disabled={isSearching}
          />
          <button
            type="submit"
            disabled={isSearching}
            className="p-1 px-2.5 bg-zinc-900 border border-zinc-850 hover:border-[#00FF00]/40 text-[#00FF00] hover:text-white rounded-md font-mono text-[9px] uppercase font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Rozpocznij geolokalizację adresu"
          >
            {isSearching ? (
              <span className="w-2.5 h-2.5 border border-[#00FF00] border-t-transparent rounded-full animate-spin inline-block"></span>
            ) : (
              <Search size={11} />
            )}
            <span>{isSearching ? 'SZUKAM...' : 'SZUKAJ'}</span>
          </button>
        </form>

        {/* Tactical Map Layer Toggle Control */}
        <div className="flex items-center bg-black/90 p-1 rounded border border-[#00FF00]/20 shadow-[0_4px_20px_rgba(0,0,0,0.85)] gap-1 pointer-events-auto">
          <span className="text-[8px] font-mono font-black tracking-wider text-[#00FF00]/70 px-2 uppercase select-none">
            WIDOK:
          </span>
          {[
            { id: 'standard', label: 'STANDARD' },
            { id: 'satellite', label: 'SATELITA' },
            { id: 'heatmap', label: 'TERMICZNA HUD' }
          ].map(layer => (
            <button
              key={layer.id}
              type="button"
              onClick={() => setMapStyle(layer.id as any)}
              className={`flex-1 py-1 text-[9px] font-mono rounded cursor-pointer transition-all uppercase font-bold text-center
                ${mapStyle === layer.id
                  ? 'bg-[#00FF00]/15 text-[#00FF00] border border-[#00FF00]/40 shadow-[0_0_8px_rgba(0,255,0,0.25)]'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="w-full h-full bg-[#030306]" 
        style={{ height: '100%' }}
      />
      
      {/* Dynamic Geolocation control floating button */}
      <button
        onClick={handleLocateUser}
        className="absolute bottom-28 right-3.5 z-[1000] p-2.5 bg-black/90 hover:bg-[#00FF00]/10 hover:text-[#00FF00] text-white border border-zinc-800 rounded-md transition-colors shadow-lg shadow-black/80 flex items-center justify-center cursor-pointer"
        title="Namierz moją lokalizację GPS"
      >
        <Compass size={18} className="animate-spin-slow text-[#00FF00]" />
      </button>

      {/* Styled css overlay to make the map fits seamlessly into military-inspired radar looks */}
      <style>{`
        .leaflet-container {
          background: #030306 !important;
        }
        .leaflet-popup-content-wrapper {
          background: #07070d !important;
          border: 1px solid rgba(0, 255, 0, 0.3) !important;
          color: #f4f4f5 !important;
          border-radius: 4px !important;
          font-family: inherit !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.9) !important;
        }
        .leaflet-popup-tip {
          background: #07070d !important;
          border: 1px solid rgba(0, 255, 0, 0.3) !important;
        }
        .leaflet-tooltip-top.custom-spot-tooltip::before {
          border-top-color: rgba(0, 255, 0, 0.3) !important;
        }
        /* Custom map cursor adjustments */
        .leaflet-grab {
          cursor: crosshair !important;
        }
      `}</style>
    </div>
  );
}
