# GitHub Secrets Setup für automatisches Deployment

Dieses Dokument erklärt, wie Sie GitHub Secrets einrichten, um den Cloudflare Worker automatisch via GitHub Actions zu deployen.

## 🔐 Benötigte Secrets

Gehen Sie zu Ihrem GitHub Repository → Settings → Secrets and variables → Actions → "New repository secret"

### 🎯 Einfache Methode (Ein Benutzer)

Für die meisten Benutzer (nur ein Login):

#### 1. XTREAM_USERNAME (Erforderlich)
- Name: `XTREAM_USERNAME`
- Value: `ihr-benutzername` (z.B. `familie`)

#### 2. XTREAM_PASSWORD (Erforderlich)
- Name: `XTREAM_PASSWORD`
- Value: `ihr-passwort` (z.B. `geheim123`)

### 🔧 Cloudflare Secrets

#### 3. CLOUDFLARE_API_TOKEN (Erforderlich)

**Was:** API Token für Cloudflare Worker Deployment

**Wie erstellen:**
1. Gehen Sie zu [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Klicken Sie auf "Create Token"
3. Verwenden Sie das Template "Edit Cloudflare Workers"
4. Oder erstellen Sie ein Custom Token mit folgenden Permissions:
   - Account → Workers Scripts → Edit
   - Account → Workers KV Storage → Edit (optional)
5. Kopieren Sie den Token

**In GitHub:**
- Name: `CLOUDFLARE_API_TOKEN`
- Value: `Ihr-Cloudflare-API-Token`

#### 4. CLOUDFLARE_ACCOUNT_ID (Erforderlich)

**Was:** Ihre Cloudflare Account ID

**Wie finden:**
1. Gehen Sie zu [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Wählen Sie eine beliebige Domain (oder gehen Sie zu Workers & Pages)
3. Rechts in der Sidebar sehen Sie "Account ID"
4. Oder in der URL: `dash.cloudflare.com/ACCOUNT_ID/...`

**In GitHub:**
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: `Ihre-Account-ID` (z.B. `1234567890abcdef1234567890abcdef`)

### 👥 Erweiterte Methode (Mehrere Benutzer) - Optional

Falls Sie mehrere Logins benötigen:

#### XTREAM_CREDENTIALS (Optional)

**Was:** Zusätzliche Login-Daten als JSON Array

**Format:** JSON Array mit Username/Password Objekten

**Beispiel:**
```json
[{"username":"familie","password":"geheim123"},{"username":"gast","password":"gast2024"}]
```

**In GitHub:**
- Name: `XTREAM_CREDENTIALS`
- Value: `[{"username":"user2","password":"pass2"},{"username":"user3","password":"pass3"}]`

**WICHTIG:**
- Muss gültiges JSON sein (keine Zeilenumbrüche!)
- Wird ZUSÄTZLICH zu XTREAM_USERNAME/PASSWORD verwendet
- Oder alleine für mehrere Benutzer ohne XTREAM_USERNAME/PASSWORD

### ⚙️ Optionale Secrets

#### WORKER_URL (Optional)

**Was:** Die öffentliche URL Ihres Workers

**Wann verwenden:** Wenn Sie eine Custom Domain verwenden oder die Worker-URL bereits kennen

**In GitHub:**
- Name: `WORKER_URL`
- Value: `https://xtream-api.ihre-subdomain.workers.dev`

**Standard:** Falls nicht gesetzt, wird `https://xtream-api.workers.dev` verwendet

#### PLAYLIST_URL (Optional)

**Was:** URL zur M3U Playlist

**Wann verwenden:** Wenn Sie eine andere Playlist-Quelle verwenden möchten

**In GitHub:**
- Name: `PLAYLIST_URL`
- Value: `https://ihre-alternative-quelle.com/playlist.m3u`

**Standard:** Falls nicht gesetzt, wird `https://raw.githubusercontent.com/Rosenweg/tv7/main/playlist.m3u` verwendet

## 📋 Zusammenfassung - Minimale Konfiguration

Für ein funktionierendes Setup benötigen Sie **mindestens diese 4 Secrets**:

1. ✅ `CLOUDFLARE_API_TOKEN` - API Token für Deployment
2. ✅ `CLOUDFLARE_ACCOUNT_ID` - Ihre Cloudflare Account ID
3. ✅ `XTREAM_USERNAME` - Ihr Login-Benutzername
4. ✅ `XTREAM_PASSWORD` - Ihr Login-Passwort

**Optional:**
- `XTREAM_CREDENTIALS` - Für zusätzliche Benutzer (JSON Array)
- `WORKER_URL` - Ihre Worker-URL (falls Custom Domain)
- `PLAYLIST_URL` - Alternative M3U-Quelle

## 🚀 Deployment auslösen

Nach dem Einrichten der Secrets:

### Manuell
1. Gehen Sie zu Actions → "Deploy Cloudflare Worker"
2. Klicken Sie "Run workflow"
3. Wählen Sie den Branch `main`
4. Klicken Sie "Run workflow"

### Automatisch
Der Worker wird automatisch deployed bei:
- Push auf `main` Branch
- Änderungen in `cloudflare-worker/**`
- Änderungen in `.github/workflows/deploy-worker.yml`

## 📱 Nach dem Deployment

1. Gehen Sie zu [Cloudflare Dashboard → Workers & Pages](https://dash.cloudflare.com/)
2. Suchen Sie nach `xtream-api`
3. Klicken Sie darauf
4. Notieren Sie die Worker-URL (z.B. `https://xtream-api.ihre-subdomain.workers.dev`)

## 🔧 IPTV Smarters Pro Setup

Verwenden Sie diese Daten in der App:

- **Server URL:** Die Worker-URL (siehe oben)
- **Username:** Aus `XTREAM_CREDENTIALS` (z.B. `familie`)
- **Password:** Aus `XTREAM_CREDENTIALS` (z.B. `geheim123`)

## 🔒 Sicherheit

**Best Practices:**

1. **Niemals Secrets im Code committen**
   - Secrets werden nur in GitHub gespeichert
   - Worker liest sie aus Environment Variables

2. **Starke Passwörter verwenden**
   ```json
   [{"username":"user1","password":"Sup3r-S3cur3-P@ssw0rd!2024"}]
   ```

3. **Regelmäßig rotieren**
   - Ändern Sie Passwörter alle 3-6 Monate
   - Einfach Secret in GitHub aktualisieren
   - Workflow erneut ausführen

4. **API Token Permissions minimieren**
   - Nur "Edit Cloudflare Workers" Permission
   - Kein "Read All Resources" o.ä.

## 🐛 Troubleshooting

### "Error: Authentication error"
- ❌ CLOUDFLARE_API_TOKEN ist ungültig oder abgelaufen
- ✅ Token neu erstellen und Secret aktualisieren

### "Error: Account not found"
- ❌ CLOUDFLARE_ACCOUNT_ID ist falsch
- ✅ Account ID im Cloudflare Dashboard überprüfen

### "Invalid credentials" in IPTV App
- ❌ XTREAM_USERNAME oder XTREAM_PASSWORD falsch gesetzt
- ✅ Username/Password in GitHub Secrets überprüfen
- ✅ Username/Password in der App korrekt eingeben
- ✅ Falls XTREAM_CREDENTIALS verwendet: JSON-Format überprüfen

### Worker deployed aber funktioniert nicht
1. Gehen Sie zu Cloudflare Dashboard → Workers
2. Öffnen Sie `xtream-api`
3. Klicken Sie auf "Edit"
4. Überprüfen Sie die Environment Variables
5. Prüfen Sie die Logs in "Logs" Tab

## 📝 Beispiel-Konfiguration

### Einfache Konfiguration (1 Benutzer):

| Secret Name | Value |
|------------|-------|
| CLOUDFLARE_API_TOKEN | `abc123...xyz789` |
| CLOUDFLARE_ACCOUNT_ID | `1234567890abcdef...` |
| XTREAM_USERNAME | `familie` |
| XTREAM_PASSWORD | `geheim123` |

### Erweiterte Konfiguration (Mehrere Benutzer):

| Secret Name | Value |
|------------|-------|
| CLOUDFLARE_API_TOKEN | `abc123...xyz789` |
| CLOUDFLARE_ACCOUNT_ID | `1234567890abcdef...` |
| XTREAM_USERNAME | `familie` |
| XTREAM_PASSWORD | `geheim123` |
| XTREAM_CREDENTIALS | `[{"username":"gast","password":"gast2024"},{"username":"freunde","password":"freunde123"}]` |
| WORKER_URL | `https://tv.meinedomain.com` (optional) |
| PLAYLIST_URL | `https://raw.githubusercontent.com/Rosenweg/tv7/main/playlist.m3u` (optional) |

## 🎉 Fertig!

Ihr Worker wird jetzt automatisch deployed und aktualisiert!

Bei Änderungen an der Playlist wird der Worker automatisch die neueste Version laden.
