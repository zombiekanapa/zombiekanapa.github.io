# Szczecin SafePoint — Instrukcja Uruchomienia i Publikacji Online
> **Projekt:** Interaktywna i taktyczna mapa schronów obrony cywilnej, punktów zbiórki ewakuacyjnej oraz ujęć wody pitnej dla miasta Szczecin.

---

## 📖 Spis Treści
1. [Przegląd Projektu](#1-przegląd-projektu)
2. [Wymagania Systemowe](#2-wymagania-systemowe)
3. [Lokalne Środowisko Programistyczne](#3-lokalne-środowisko-programistyczne)
4. [Instrukcja Publikacji w Internecie (Deployment)](#4-instrukcja-publikacji-w-internecie-deployment)
   - [Opcja A: Vercel (Najszybsza i Darmowa)](#opcja-a-vercel-najszybsza-i-darmowa)
   - [Opcja B: Netlify](#opcja-b-netlify)
   - [Opcja C: GitHub Pages (Zautomatyzowana)](#opcja-c-github-pages-zautomatyzowana)
   - [Opcja D: Cloudflare Pages](#opcja-d-cloudflare-pages)
   - [Opcja E: Własny Serwer VPS / Docker (Zaawansowana)](#opcja-e-własny-serwer-vps--docker-zaawansowana)
5. [Często Zadawane Pytania i Rozwiązywanie Problemów](#5-często-zadawane-pytania-i-rozwiązywanie-problemów)

---

## 1. Przegląd Projektu
**Szczecin SafePoint** to nowoczesna, responsywna aplikacja frontendowa typu Single Page Application (SPA), zbudowana z użyciem systemu **Vite**, **React 18**, **TypeScript** oraz **Tailwind CSS v4**. 

Aplikacja integruje interaktywną mapę (zintegrowaną poprzez bibliotekę Leaflet z podkładami mapowymi OpenStreetMap, Esri Satellite i taktycznymi nakładkami termicznymi) wspierającą:
* **Taktyczny panel HUD** z informacjami o schronach, punktach medycznych, zbiórkach ewakuacyjnych i hydrantach w Szczecinie.
* **Wyszukiwarkę adresów i ulic** z geokodowaniem OSM Nominatim dedykowaną dla Szczecina.
* **Autokodowanie odwrotne (Reverse Geocoding)**: Kliknięcie na mapie automatycznie pobiera oficjalny adres i uzupełnia formularz zgłoszeniowy nowego punktu.
* **Zdalne przełączanie warstw**: Standardowo ciemna minimalistyczna mapa kartograficzna (Dark-Mode), autentyczny podgląd satelitarny świata, oraz termiczna mapa gęstości zweryfikowanych schronów.

---

## 2. Wymagania Systemowe
Przed przystąpieniem do pracy upewnij się, że na Twoim komputerze lokalnym zainstalowane są:
* **Node.js** (rekomendowana wersja LTS, minimum 18.x lub nowsza)
* **npm** (dołączany automatycznie do instalatora Node.js) lub alternatywne menedżery pakietów (**Yarn** / **pnpm**).
* **Git** (narzędzie kontroli wersji wymagane do integracji z chmurą).

---

## 3. Lokalne Środowisko Programistyczne
Uruchomienie projektu na własnym komputerze w kilkunastu krokach:

1. **Pobierz źródła projektu** na swój dysk (poprzez pobranie archiwum ZIP wyeksportowanego z Google AI Studio, bądź sklonowanie repozytorium GitHub).
2. **Otwórz terminal** (np. PowerShell, Bash, CMD lub terminal wbudowany w VS Code) w głównym katalogu projektu.
3. **Zainstaluj zależności aplikacji**:
   ```bash
   npm install
   ```
4. **Uruchom serwer developerski**:
   ```bash
   npm run dev
   ```
5. **Otwórz przeglądarkę** i wejdź pod adres wskazany w terminalu (domyślnie to `http://localhost:3000` lub `http://localhost:5173`). Serwer posiada funkcję natychmiastowego odświeżania na żywo (Hot Reloading) podczas edycji plików.

---

## 4. Instrukcja Publikacji w Internecie (Deployment)
Wybierz jedną z poniższych, darmowych i profesjonalnych platform hostingowych do opublikowania swojej mapy na publicznym, zabezpieczonym protokołem HTTPS adresie URL.

---

### Opcja A: Vercel (Najszybsza i Darmowa)
*Vercel to najpopularniejsza chmura dla aplikacji React/Vite. Automatycznie importuje kod bezpośrednio z repozytorium GitHub i przebudowuje go przy każdej aktualizacji.*

#### Krok-po-kroku z GitHubem (Zalecane):
1. Utwórz darmowe konto na platformie [Vercel](https://vercel.com).
2. Opublikuj swój lokalny kod na darmowym repozytorium na **GitHub** (prywatnym lub publicznym).
3. Na pulpicie nawigacyjnym Vercel kliknij **"Add New"** -> **"Project"**.
4. Połącz swoje konto GitHub i wybierz repozytorium `safepoint-app`.
5. Vercel automatycznie wykryje konfigurację środowiska jako **Vite**.
6. **Ustawienia kompilacji (zostaw domyślne):**
   * *Build Command:* `npm run build`
   * *Output Directory:* `dist`
7. Kliknij **"Deploy"**. Po około minucie Twoja aplikacja będzie dostępna pod unikalnym adresem `https://twoja-nazwa.vercel.app`.

#### Krok-po-kroku bez GitHuba (Za pomocą CLI):
1. Zainstaluj CLI Vercel globalnie w swoim terminalu:
   ```bash
   npm install -g vercel
   ```
2. Uruchom polecenie logowania i konfiguracji w katalogu projektu:
   ```bash
   vercel
   ```
3. Postępuj zgodnie z instrukcjami wyświetlanymi w terminalu (odpowiedz na pytania i zaloguj się).
4. Po ukończeniu konfiguracji otrzymasz bezpośredni link produkcyjny!

---

### Opcja B: Netlify
*Netlify oferuje proste i bezproblemowe hostowanie statycznych stron internetowych.*

#### Metoda przeciągnij-i-upuść (Super prosta, bez kodu i konta na GitHubie):
1. Najpierw zbuduj aplikację produkcyjną lokalnie w terminalu:
   ```bash
   npm run build
   ```
2. W Twoim katalogu projektu zostanie wygenerowany zoptymalizowany folder o nazwie `dist`.
3. Zaloguj się na darmowe konto [Netlify](https://www.netlify.com).
4. Przejdź do zakładki **"Sites"** i przewiń na sam dół strony do sekcji **"Want to deploy a new site without connecting to Git? Drag and drop your site folder here"**.
5. **Przeciągnij folder `dist` i upuść go w wyznaczonym oknie przeglądarki.**
6. Po kilku sekundach strona będzie online ze statusem *Published*!

---

### Opcja C: GitHub Pages (Zautomatyzowana)
*Jeśli Twój kod znajduje się na darmowym repozytorium GitHub, możesz skonfigurować automatyczne publikowanie mapy za pomocą mechanizmu GitHub Actions.*

1. Wejdź w ustawienia swojego repozytorium na GitHubie (**Settings**).
2. W bocznym menu wybierz zakładkę **"Pages"**.
3. W sekcji *Build and deployment* -> *Source* zmień opcję z "Deploy from a branch" na **"GitHub Actions"**.
4. W swoim projekcie utwórz katalogi `.github/workflows` i utwórz w nich plik konfiguracyjny o nazwie `deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ] # Lub master (zależnie od nazwy gałęzi głównej)

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

5. Zapisz zmiany i wypchnij je (`git push`) do repozytorium. GitHub automatycznie wykona wdrożenie i przekaże Ci link do strony (np. `https://twoj-login.github.io/safepoint-app`).

---

### Opcja D: Cloudflare Pages
*Wydajne rozwiązanie dystrybuowane na krawędzi sieci globalnej Cloudflare, oferujące darmowy transfer i natychmiastowe ładowanie mapy.*

1. Zaloguj się do panelu [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Przejdź do zakładki **"Workers & Pages"** -> **"Create"** -> **"Pages"** -> **"Connect to Git"**.
3. Połącz konto ze swoim repozytorium na GitHubie.
4. Wybierz szablon projektu jako **Vite**.
5. Pozostałe ustawienia pozostaw bez zmian (komenda budowania: `npm run build`, katalog wyjściowy: `dist`).
6. Kliknij **"Save and Deploy"**. Gotowe!

---

### Opcja E: Własny Serwer VPS / Docker (Zaawansowana)
*Jeżeli chcesz utrzymywać aplikację na własnym zabezpieczonym serwerze.*

Możesz opakować spakowany folder `dist` w lekki kontener serwera Nginx do serwowania plików statycznych za pomocą technologii Docker.

#### 1. dockerfile
Utwórz plik `Dockerfile` w głównym katalogu projektu:
```dockerfile
# Etap budowy
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etap uruchomienia (Lekki obraz Nginx)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Konfiguracja obsługująca routowanie SPA przez Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Budowa i uruchomienie kontenera dockerowego:
```bash
docker build -t szczecin-safepoint .
docker run -d -p 8080:80 szczecin-safepoint
```
Serwer z mapą będzie działał teraz na Twoim porcie `8080`.

---

## 5. Często Zadawane Pytania i Rozwiązywanie Problemów

* **P: Czy wyszukiwanie adresów offline i geokodowanie wymaga płatnych kluczy API?**
  * **O:** Nie! Aplikacja korzysta w pełni z darmowych, otwartych i publicznych interfejsów API OpenStreetMap (OSM Nominatim). Nie ponosisz żadnych kosztów ze względu na liczbę zapytań użytkowników.
* **P: Dlaczego moja mapa nie ładowała kafelków satelitarnych w trybie lokalnym?**
  * **O:** Podkłady satelitarne Esri pobierane są poprzez bezpieczne połączenia HTTPS i wymagają aktywnego połączenia z Internetem na porcie 443. Po wdrożeniu na publiczny serwer z certyfikatem SSL usterka ustępuje całkowicie.
* **P: Opcje wyszukiwania i klikania na mapie nie zwracają adresów na urządzeniu mobilnym.**
  * **O:** Serwer OSM Nominatim odrzuca żądania z nieprawidłowym nagłówkiem `User-Agent`. W komponencie mapy zaimplementowaliśmy zgodną sygnaturę `Szczecin-SafePoint-App/1.0`, co zapobiega blokadom i zapewnia wysoki czas odpowiedzi.

---
*Bezpieczeństwo i pewność operacyjna dla mieszkańców Szczecina.*
