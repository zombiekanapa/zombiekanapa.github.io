export interface SafetyProtocol {
  id: string;
  title: string;
  category: 'AIR_RAID' | 'RADIATION' | 'BLACKOUT' | 'CHEMICAL' | 'MEDICAL';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  shortDesc: string;
  steps: string[];
  equipmentNeeded: string[];
  frequencies?: string[];
  localInfo?: string;
}

export const safetyProtocols: SafetyProtocol[] = [
  {
    id: 'prot-siren',
    title: 'Alarm Powietrzny i Sygnały Syren',
    category: 'AIR_RAID',
    severity: 'CRITICAL',
    shortDesc: 'Sygnał syreny ciągły modulowany trwający 3 minuty oznacza ogłoszenie alarmu powietrznego.',
    steps: [
      'Wyłącz urządzenia gazowe i elektryczne, zgaś otwarty ogień.',
      'Zabierz ze sobą „plecak ewakuacyjny” (dokumenty, leki, wodę, latarkę).',
      'Zabezpiecz mieszkanie i zamknij okna.',
      'Szybko udaj się do najbliższego schronu szczelinowego lub podziemia (CH Kaskada, Bunkier Grunwaldzki).',
      'Jeśli nie możesz wyjść, schroń się w pomieszczeniu bez okien (np. wewnętrzny przedpokój, łazienka).'
    ],
    equipmentNeeded: [
      'Plecak startowy z dokumentami (Dowód osobisty)',
      'Radioodbiornik na baterie / korbkę',
      'Maska ochronna lub wilgotna tkanina',
      'Latarka czołowa i zapasowe ogniwa'
    ],
    frequencies: [
      '92.0 MHz - Radio Szczecin (Alternatywne komunikaty kryzysowe)',
      'Radio Szczecin DAB+ (Cyfrowe powiadomienia)'
    ],
    localInfo: 'Główny schron pod placem Grunwaldzkim (Bunkier) otwiera się automatycznie w ciągu 3 minut od syreny alarmowej.'
  },
  {
    id: 'prot-iodine',
    title: 'Skażenie Radiacyjne & Jodek Potasu',
    category: 'RADIATION',
    severity: 'CRITICAL',
    shortDesc: 'W przypadku awarii elektrowni i chmury radiacyjnej, nadrzędną zasadą jest ukrycie wewnątrz budynków (SHELTER-IN-PLACE).',
    steps: [
      'Wejdź do pomieszczenia, zamknij i uszczelnij drzwi, okna oraz kratki wentylacyjne taśmą.',
      'Wyłącz klimatyzację, rekuperację i wentylatory mechaniczne.',
      'Przyjmij tabletkę jodku potasu TYLKO po oficjalnym komunikacie rządu (punkty dystrybucyjne w szkołach w Szczecinie).',
      'Spożywaj wyłącznie zapakowaną fabrycznie żywność i wodę butelkowaną.',
      'Wytrzyj wilgotną szmatką zwierzęta domowe, jeśli były na zewnątrz, i trzymaj je w zamknięciu.'
    ],
    equipmentNeeded: [
      'Stabilny jodek potasu (dostępny w punktach dystrybucyjnych)',
      'Taśma naprawcza (Duct Tape) do uszczelnień',
      'Foliowe worki na skażone ubrania',
      'Zapas wody pitnej w butelkach (min. 3 dni)'
    ],
    frequencies: [
      '102.3 MHz - Program 1 Polskiego Radia (Wiadomości Sztabu Generalnego)'
    ],
    localInfo: 'Szczecin posiada 104 wyznaczone samorządowe punkty dystrybucji tabletek stabilnego jodku potasu, w większości zlokalizowane w liceach i szkołach podstawowych.'
  },
  {
    id: 'prot-blackout',
    title: 'Brak Zasilania (Totalny Blackout)',
    category: 'BLACKOUT',
    severity: 'WARNING',
    shortDesc: 'Długotrwały brak energii paraliżuje dostawy wody, ogrzewania, sygnał GSM i transakcje kartami płatniczymi.',
    steps: [
      'Miej przygotowaną gotówkę w niskich nominałach (systemy bankowe przestaną działać).',
      'Napełnij wannę i wszystkie wolne naczynia czystą wodą od razu, zanim spadnie ciśnienie w wodociągach.',
      'Trzymaj lodówki i zamrażalniki zamknięte, aby maksymalnie opóźnić psucie się zapasów.',
      'Śledź doniesienia na radiu analogowym. Sieć GSM wyłączy się po wyczerpaniu baterii stacji bazowych (ok. 2-4h).',
      'Ustal z najbliższymi stały punkt zbiórki awaryjnej (np. plac Rodła pod zegarem) w przypadku utraty kontaktu.'
    ],
    equipmentNeeded: [
      'Gotówka fizyczna (PLN / EUR)',
      'Powerbanki wielorazowe (z panelami solarnymi)',
      'Turystyczna kuchenka gazowa z zapasem kartuszy',
      'Filtry turystyczne do wody (np. Sawyer)'
    ],
    frequencies: [
      'Amatorskie pasmo ratunkowe: 145.500 MHz (VHF)',
      'Kanał 9 obywatelskiego pasma CB (Pasmo alarmowe)'
    ],
    localInfo: 'Netto Arena oraz budynek urzędu miasta Szczecin posiadają zintegrowane generatory prądotwórcze dużej mocy mogące pełnić rolę punktów ładowania medycznego.'
  },
  {
    id: 'prot-chemical',
    title: 'Zagrożenie Chemiczne i Toksyczne',
    category: 'CHEMICAL',
    severity: 'CRITICAL',
    shortDesc: 'Awarie przemysłowe lub skażenie rzeki Odry chemikaliami. Objawem są nietypowe zapachy lub nagły pomór ptaków i ryb.',
    steps: [
      'Poruszaj się prostopadle do kierunku wiatru, aby ominąć przesuwającą się chmurę gazową.',
      'Szukaj schronienia na wyższych piętrach budynków (gazy cięższe od powietrza jak chlor opadają) lub na odwrót w przypadku gazów lekkich (amoniak).',
      'Oddychaj przez zwilżoną chusteczkę lub ubranie nasączone wodą (lub roztworem sody oczyszczonej przy kwaśnych oparach).',
      'Po wejściu do schronienia natychmiast zdejmij ubranie zewnętrzne i umieść je w worku, umyj ciało mydłem.'
    ],
    equipmentNeeded: [
      'Okulary ochronne ściśle przylegające',
      'Maseczki filtrujące FFP3 lub maska przeciwgazowa',
      'Rękawice nitrylowe grubościenne',
      'Soda oczyszczona (neutralizator kwasów)'
    ],
    localInfo: 'Zakłady Chemiczne Police w pobliżu Szczecina posiadają własny, zintegrowany system ostrzegania ludności z syrenami o odmiennej tonacji.'
  },
  {
    id: 'prot-medical',
    title: 'Pierwsza Pomoc & Apteczka Taktyczna',
    category: 'MEDICAL',
    severity: 'INFO',
    shortDesc: 'Kontrola krwotoków z uszkodzeń kończyn i stabilizacja poszkodowanego są kluczem do przetrwania przed przybyciem służb.',
    steps: [
      'Załóż rękawiczki ochronne. Oceń bezpieczeństwo własne na miejscu wypadku.',
      'W przypadku masywnego krwotoku z kończyny użyj stazy taktycznej (opaski uciskowej) 5-7 cm powyżej rany, bezpośrednio na mundur/odzież.',
      'Uciski klatki piersiowej: 30 uciśnięć rannych w tempie 100-120 na minutę, przeplatane 2 wdechami (w ratownictwie cywilnym).',
      'Zabezpiecz rany klatki piersiowej opatrunkiem wentylowym, aby zapobiec odmie prężnej.',
      'Okryj poszkodowanego kocem termicznym NRC (srebrną stroną do ciała), aby zahamować hipotermię.'
    ],
    equipmentNeeded: [
      'Staza taktyczna typu CAT (Combat Application Tourniquet)',
      'Bandaż izraelski (opatrunek uciskowy)',
      'Koc termiczny NRC (Folia ratunkowa)',
      'Nożyczki ratownicze (do rozcinania ubrań)'
    ],
    localInfo: 'Główny Szpital Medyczny PUM na Pomorzanach posiada całodobowe lądowisko helikopterów ratunkowych i bazę zaopatrzenia krwią.'
  }
];
