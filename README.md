# M3U Playlist Generator

Automatische Generierung einer kombinierten M3U-Playlist mit Init7 TV-Streams und go2rtc Streams via GitHub Actions.

## Features

- ✅ Automatischer Import aller Init7 TV-Kanäle
- ✅ Integration eigener go2rtc Streams
- ✅ Automatische tägliche Aktualisierung via GitHub Actions
- ✅ Unterstützung für TVG-Attribute (Logos, Gruppen, etc.)
- ✅ Einfache Konfiguration über YAML

## Struktur

```
.
├── .github/
│   └── workflows/
│       └── generate-playlist.yml    # GitHub Actions Workflow
├── sources/                         # M3U-Quelldateien (beliebige *.m3u Dateien)
│   ├── init7_channels.m3u          # Init7 TV Kanäle
│   └── README.md                    # Dokumentation
├── config.yaml                      # Konfigurationsdatei
├── generate_playlist.py             # Generator-Script
├── requirements.txt                 # Python-Dependencies
└── playlist.m3u                     # Generierte Playlist (automatisch erstellt)
```

## Verwendung

### Automatisch (GitHub Actions)

Die Playlist wird automatisch generiert:
- **Täglich** um 6:00 UTC
- Bei **Push** auf main/master (wenn config.yaml oder generate_playlist.py geändert wurden)
- **Manuell** über GitHub Actions UI

Die generierte `playlist.m3u` wird automatisch ins Repository committed.

### Lokal

```bash
# Dependencies installieren
pip install -r requirements.txt

# Playlist generieren
python generate_playlist.py
```

## Konfiguration

Bearbeiten Sie `config.yaml` um die Playlist anzupassen:

### Init7 Streams (API)

```yaml
init7:
  enabled: true
  url: "https://api.init7.net/tvchannels.m3u?rp=true"
```

**Hinweis:** Die Init7 API ist oft nur für Init7-Kunden erreichbar. Verwenden Sie stattdessen lokale M3U-Dateien im `sources/` Ordner.

### Lokale M3U-Dateien

```yaml
sources:
  enabled: true
  directory: "sources"
```

Legen Sie beliebige `*.m3u` Dateien im `sources/` Verzeichnis ab. Alle Dateien werden automatisch eingelesen.

### go2rtc Streams hinzufügen

```yaml
go2rtc:
  enabled: true
  base_url: "http://localhost:1984"
  streams:
    - name: "Mein Stream 1"
      url: "rtsp://192.168.1.100/stream1"
      logo: "https://example.com/logo.png"
      group: "Eigene Streams"

    - name: "Mein Stream 2"
      url: "rtsp://192.168.1.101/stream2"
      logo: ""
      group: "Eigene Streams"
```

### Output-Optionen

```yaml
output:
  filename: "playlist.m3u"
  use_groups: true
  include_tvg: true
```

## Playlist verwenden

### URL zur generierten Playlist

Nach der Generierung ist die Playlist unter folgender URL verfügbar:

```
https://raw.githubusercontent.com/DEIN_USERNAME/DEIN_REPO/main/playlist.m3u
```

Ersetzen Sie `DEIN_USERNAME` und `DEIN_REPO` mit Ihren GitHub-Daten.

### In IPTV-Clients nutzen

#### VLC
1. Medien → Netzwerkstream öffnen
2. URL eingeben
3. Wiedergabe starten

#### Kodi
1. TV → Eingänge → Allgemein → Aktiviert
2. M3U Play List URL eintragen

#### TiviMate (Android TV)
1. Playlist hinzufügen
2. URL eingeben
3. EPG Optional konfigurieren

## Init7 TV-Kanäle

Die Playlist enthält alle verfügbaren Init7 TV-Kanäle:

- 🇩🇪 **Deutsch**: SRF 1, SRF zwei, SRF info
- 🇫🇷 **Français**: RTS 1, RTS 2
- 🇮🇹 **Italiano**: RSI LA 1, RSI LA 2

Und weitere Kanäle je nach Init7-Verfügbarkeit.

## go2rtc Integration

Für go2rtc Streams:

1. Eigene go2rtc Installation aufsetzen
2. Streams in `config.yaml` konfigurieren
3. URLs anpassen (lokal oder über Reverse Proxy)

Beispiel go2rtc Konfiguration:
```yaml
streams:
  camera1:
    - rtsp://admin:password@192.168.1.100/stream1
  camera2:
    - rtsp://admin:password@192.168.1.101/stream1
```

## Troubleshooting

### Playlist wird nicht aktualisiert

1. Prüfen Sie die GitHub Actions Logs
2. Stellen Sie sicher, dass Workflow-Permissions korrekt sind
3. Verifizieren Sie die `config.yaml` Syntax

### Init7 Streams laden nicht

1. Prüfen Sie die Init7 URL in `config.yaml`
2. Testen Sie die URL manuell im Browser
3. Überprüfen Sie die Netzwerkverbindung

### go2rtc Streams nicht verfügbar

1. Stellen Sie sicher, dass go2rtc läuft
2. Prüfen Sie die Stream-URLs
3. Testen Sie die Streams einzeln

## Lizenz

MIT License

## Mitwirken

Contributions sind willkommen! Bitte:

1. Fork das Repository
2. Erstellen Sie einen Feature Branch
3. Committen Sie Ihre Änderungen
4. Push zum Branch
5. Erstellen Sie einen Pull Request

## Support

Bei Fragen oder Problemen:
- Erstellen Sie ein Issue auf GitHub
- Init7 Support: https://www.init7.net/de/support/

## Links

- [Init7 TV](https://www.init7.net/de/tv/)
- [go2rtc](https://github.com/AlexxIT/go2rtc)
- [M3U Format](https://en.wikipedia.org/wiki/M3U)
