# Xtream Codes API - Cloudflare Worker

Serverlose Xtream Codes API Implementation für Ihre M3U-Playlist. Komplett kostenlos auf Cloudflare Workers!

## ✨ Features

- ✅ **Xtream Codes API** - Vollständige API-Kompatibilität
- ✅ **IPTV Smarters Pro** - Direkte Integration mit Username/Password
- ✅ **Serverless** - Keine Server-Kosten, 100% kostenlos
- ✅ **Global CDN** - Blitzschnell weltweit verfügbar
- ✅ **Auto-Update** - Liest immer die neueste Playlist von GitHub

## 🚀 Quick Start

### 1. Cloudflare Account erstellen

Besuchen Sie [cloudflare.com](https://www.cloudflare.com/) und erstellen Sie einen kostenlosen Account.

### 2. Worker deployen

**🎯 Option A: Mit GitHub Actions (EMPFOHLEN)**

Vollautomatisches Deployment mit GitHub Secrets:

1. Siehe [`GITHUB_SECRETS_SETUP.md`](GITHUB_SECRETS_SETUP.md) für detaillierte Anleitung
2. Richten Sie 4 GitHub Secrets ein:
   - `CLOUDFLARE_API_TOKEN` - API Token
   - `CLOUDFLARE_ACCOUNT_ID` - Account ID
   - `XTREAM_USERNAME` - Ihr Benutzername
   - `XTREAM_PASSWORD` - Ihr Passwort
3. Pushen Sie zum `main` Branch oder lösen Sie den Workflow manuell aus
4. Fertig! Worker wird automatisch deployed 🎉

**Vorteile:**
- ✅ Credentials als sichere GitHub Secrets
- ✅ Automatisches Deployment bei Änderungen
- ✅ Keine manuelle Konfiguration im Code
- ✅ Einfaches Update der Credentials

**Option B: Über Dashboard (Manuell)**

1. Gehen Sie zu [Cloudflare Dashboard → Workers](https://dash.cloudflare.com/)
2. Klicken Sie auf "Create a Service"
3. Wählen Sie einen Namen (z.B. `xtream-api`)
4. Klicken Sie auf "Create Service"
5. Klicken Sie auf "Quick Edit"
6. Kopieren Sie den Inhalt von `worker.js` komplett
7. Fügen Sie ihn ein und klicken Sie auf "Save and Deploy"
8. **WICHTIG:** Passen Sie die Credentials in Zeile 10-16 an!

**Option C: Mit Wrangler CLI (Fortgeschritten)**

```bash
# Wrangler installieren
npm install -g wrangler

# Login
wrangler login

# Deployen
cd cloudflare-worker
wrangler deploy
```

### 3. Konfiguration anpassen

Öffnen Sie `worker.js` und ändern Sie:

```javascript
// Zeile 10-16: Ihre Login-Daten
CREDENTIALS: [
  { username: 'meinuser', password: 'meinpasswort' },
  { username: 'familie', password: 'geheim123' }
],
```

**WICHTIG:** Ändern Sie die Credentials vor dem Deployment!

### 4. URL notieren

Nach dem Deployment erhalten Sie eine URL wie:
```
https://xtream-api.ihr-subdomain.workers.dev
```

## 📱 IPTV Smarters Pro Setup (Vidaa OS)

### Schritt 1: App öffnen
Öffnen Sie IPTV Smarters Pro auf Ihrem Hisense TV

### Schritt 2: Login mit Xtream Codes
1. Wählen Sie **"Login with Xtream Codes API"**
2. Geben Sie ein:
   - **Server URL:** `https://xtream-api.ihr-subdomain.workers.dev`
   - **Username:** `meinuser` (wie in worker.js konfiguriert)
   - **Password:** `meinpasswort` (wie in worker.js konfiguriert)
3. Klicken Sie auf "Add User"

### Schritt 3: Fertig!
Ihre Kanäle erscheinen jetzt automatisch nach Kategorien sortiert!

## 🔧 Erweiterte Konfiguration

### Eigene Domain verwenden

1. Fügen Sie Ihre Domain zu Cloudflare hinzu
2. Gehen Sie zu Workers → Ihr Worker → Triggers
3. Klicken Sie auf "Add Custom Domain"
4. Geben Sie ein: `xtream.ihredomain.com`
5. Klicken Sie auf "Add Custom Domain"

Dann können Sie verwenden:
```
Server URL: https://xtream.ihredomain.com
```

### Mehrere Benutzer

Fügen Sie in `worker.js` weitere Credentials hinzu:

```javascript
CREDENTIALS: [
  { username: 'user1', password: 'pass1' },
  { username: 'user2', password: 'pass2' },
  { username: 'familie', password: 'geheim' },
  { username: 'gast', password: 'gast123' }
],
```

### Playlist-URL ändern

Falls Sie eine andere M3U-Quelle verwenden möchten:

```javascript
// Zeile 8
PLAYLIST_URL: 'https://raw.githubusercontent.com/IHR-USER/IHR-REPO/main/playlist.m3u',
```

## 📊 API Endpoints

Ihr Worker stellt folgende Endpoints bereit:

### Server Info
```
GET https://your-worker.workers.dev/player_api.php?username=X&password=Y
```

### Live Kategorien
```
GET https://your-worker.workers.dev/player_api.php?username=X&password=Y&action=get_live_categories
```

### Live Streams
```
GET https://your-worker.workers.dev/player_api.php?username=X&password=Y&action=get_live_streams
```

### M3U Playlist
```
GET https://your-worker.workers.dev/get.php?username=X&password=Y&type=m3u_plus&output=ts
```

## 🔍 Troubleshooting

### Worker funktioniert nicht
- Überprüfen Sie die Cloudflare Dashboard Logs
- Stellen Sie sicher, dass die Playlist-URL erreichbar ist
- Testen Sie die URL im Browser

### IPTV Smarters zeigt "Invalid Credentials"
- Überprüfen Sie Username/Password in `worker.js`
- Stellen Sie sicher, dass Sie den Worker neu deployed haben
- URL muss OHNE `/player_api.php` sein (nur `https://....workers.dev`)

### Keine Kanäle sichtbar
- Überprüfen Sie ob die GitHub Playlist aktuell ist
- Testen Sie den Endpoint `/player_api.php?username=X&password=Y&action=get_live_streams` im Browser
- Prüfen Sie die M3U-Datei auf Fehler

### Performance Issues
- Cloudflare Workers haben ein Limit von 10ms CPU-Zeit (kostenlos)
- Bei sehr großen Playlists (>500 Kanäle) kann es langsam werden
- Erwägen Sie Cloudflare Workers Paid Plan für mehr CPU-Zeit

## 💰 Kosten

**Komplett kostenlos** bis 100.000 Requests/Tag!

Cloudflare Workers Free Plan:
- ✅ 100.000 Requests pro Tag
- ✅ Unbegrenzte Workers
- ✅ Global CDN
- ✅ Keine Kreditkarte erforderlich

Das reicht locker für persönliche Nutzung!

## 🔒 Sicherheit

**Best Practices:**

1. **Starke Passwörter verwenden**
   ```javascript
   { username: 'user', password: 'sup3r-s3cur3-p@ssw0rd!' }
   ```

2. **Regelmäßig Credentials ändern**
   - Ändern Sie Passwörter alle 3-6 Monate
   - Deployen Sie den Worker neu nach Änderungen

3. **Nicht teilen**
   - Geben Sie Ihre Worker-URL nicht öffentlich weiter
   - Nur vertrauenswürdigen Personen Zugang geben

4. **Rate Limiting** (optional)
   - Cloudflare bietet automatisches Rate Limiting
   - Bei Missbrauch sperrt Cloudflare automatisch

## 📝 Logs & Monitoring

### Echtzeit-Logs ansehen

```bash
wrangler tail
```

### Im Dashboard
1. Gehen Sie zu Workers → Ihr Worker
2. Klicken Sie auf "Logs"
3. Sehen Sie alle Requests in Echtzeit

## 🔄 Updates

### Worker aktualisieren

1. Bearbeiten Sie `worker.js`
2. Deployen Sie neu:

**Dashboard:**
- Quick Edit → Code ändern → Save and Deploy

**CLI:**
```bash
wrangler deploy
```

### Auto-Deploy mit GitHub Actions

✅ **Bereits vorkonfiguriert!**

Der Workflow `.github/workflows/deploy-worker.yml` ist bereits im Repository vorhanden.

**Setup:**
1. Siehe [`GITHUB_SECRETS_SETUP.md`](GITHUB_SECRETS_SETUP.md) für detaillierte Anleitung
2. Konfigurieren Sie die erforderlichen GitHub Secrets
3. Der Worker wird automatisch deployed bei:
   - Push auf `main` Branch
   - Änderungen in `cloudflare-worker/**`
   - Manuellem Auslösen des Workflows

**Benötigte Secrets:**
- `CLOUDFLARE_API_TOKEN` - API Token für Deployment
- `CLOUDFLARE_ACCOUNT_ID` - Ihre Account ID
- `XTREAM_USERNAME` - Ihr Benutzername
- `XTREAM_PASSWORD` - Ihr Passwort
- `XTREAM_CREDENTIALS` - Optional: Zusätzliche Benutzer als JSON Array

## 🌍 Alternative: Cloudflare Pages Functions

Falls Sie eine statische Website wollen, können Sie auch Cloudflare Pages verwenden.

## 📚 Weitere Ressourcen

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Xtream Codes API Spec](https://github.com/tellytv/go.xtream-codes)

## ❓ Support

Bei Problemen:
1. Überprüfen Sie die Cloudflare Worker Logs
2. Testen Sie die Endpoints im Browser
3. Erstellen Sie ein Issue auf GitHub

## 🎉 Fertig!

Sie haben jetzt Ihre eigene Xtream Codes API! 🚀

Nutzen Sie sie in:
- ✅ IPTV Smarters Pro (Vidaa OS, Android, iOS)
- ✅ TiviMate
- ✅ GSE Smart IPTV
- ✅ Perfect Player
- ✅ Und jeder anderen Xtream-kompatiblen App!
