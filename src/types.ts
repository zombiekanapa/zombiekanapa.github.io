export type SpotType = 'shelter' | 'undergroundParking' | 'tunnel' | 'basement' | 'fortress' | 'other';

export interface EvacuationSpot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: SpotType;
  capacity: number;
  availability: string;
  verified: boolean;
  details: string;
}

export interface RssArticle {
  id: string;
  source: 'Polskie Radio Szczecin' | 'TVP3 Szczecin' | 'MCN Alert' | 'Zarządzanie Kryzysowe';
  title: string;
  content: string;
  time: string;
  rssUrl: string;
  category: 'KOMUNIKAT' | 'OSTRZEŻENIE' | 'RADIO-RSS' | 'TVP-INFO' | 'PILNE';
  isCritical: boolean;
}

