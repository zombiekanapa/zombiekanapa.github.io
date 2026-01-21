# MANUAL – Deploying ZOMBIE_NEXUS Landing Page to zombiekanapa.free.nf

This guide walks you through uploading the `index.html` file to your free.nf hosting so that it appears at:

> https://zombiekanapa.free.nf/

---

## 1. Prepare your files locally

1. **Create a project folder** on your computer, e.g.:
   - `C:\zombie_nexus_landing\`
2. Inside that folder, **create a file named** `index.html`.
3. Paste the full HTML code from `index.html` (from the Copilot response) into that file and save it.

You now have a minimal static site ready to upload.

---

## 2. Log in to your free.nf hosting panel

1. Open your browser and go to the hosting control panel used by `free.nf` (usually linked from the registration email or main site).
2. Log in with your **hosting account credentials** (not GitHub, not Google—your hosting login).

Look for something like:

- **File Manager**
- **FTP Accounts**
- **Control Panel / cPanel / VistaPanel**

---

## 3. Option A – Upload via File Manager (easiest)

Most free hosts provide a web‑based **File Manager** where you can upload files directly without FTP clients.

1. In the hosting panel, open **File Manager**.
2. Locate the **document root** for your domain:
   - Often named `htdocs`, `public_html`, `www`, or similar.
   - If `zombiekanapa.free.nf` is your main domain, its root is usually the default folder shown when you open File Manager.
3. Check if there is an existing `index.php` or `index.html`:
   - If yes, **rename it** (e.g. `index_old.php`) or **download a backup** and then delete it.
4. Click **Upload** (or similar button).
5. Select your local `index.html` from `C:\zombie_nexus_landing\`.
6. Confirm upload.

After upload:

1. Go to `https://zombiekanapa.free.nf/` in your browser.
2. Refresh (Ctrl+R / Cmd+R).  
   You should now see the ZOMBIE_NEXUS terminal‑style landing page.

---

## 4. Option B – Upload via FTP (FileZilla or similar)

If you prefer FTP, you can use a client like **FileZilla**.

### 4.1. Install an FTP client

1. Download **FileZilla Client** from the official site.
2. Install and open it.

### 4.2. Get your FTP credentials

In your hosting panel, find:

- **FTP Host / Server** (e.g. `ftp.free.nf` or similar)
- **FTP Username**
- **FTP Password**
- **Port** (usually `21` for FTP)

These are usually listed under **FTP Accounts** or **FTP Details**.

### 4.3. Connect via FileZilla

1. Open FileZilla.
2. At the top, fill in:
   - **Host:** your FTP host (e.g. `ftp.yourhost.com`)
   - **Username:** your FTP username
   - **Password:** your FTP password
   - **Port:** `21` (if not specified otherwise)
3. Click **Quickconnect**.

On the right side (remote site):

1. Navigate to the **document root** for your domain:
   - Often `htdocs`, `public_html`, or similar.
2. On the left side (local site), navigate to `C:\zombie_nexus_landing\`.

### 4.4. Upload the site

1. Drag `index.html` from the left (local) to the right (remote document root).
2. Wait until the transfer finishes (check the queue at the bottom).

Then visit:

> https://zombiekanapa.free.nf/

Refresh the page. You should see your new landing.

---

## 5. Updating the site later

Whenever you want to change the page:

1. Edit `index.html` locally.
2. Re‑upload it via File Manager or FTP, overwriting the old file.
3. Refresh your browser (you may need Ctrl+F5 for a hard refresh).

---

## 6. Troubleshooting

- **Still seeing the old “coming soon” page?**
  - Clear browser cache or use a private/incognito window.
  - Make sure you uploaded `index.html` to the correct folder (document root).
- **Getting a directory listing instead of the page?**
  - Ensure the file is named exactly `index.html` (lowercase, no extra extensions).
- **500 or 403 errors?**
  - Check file permissions in File Manager (usually `644` for files is safe).
  - Ensure there is no conflicting `.htaccess` rule blocking access.

Once this is working, you can start expanding the site with more pages and assets.
