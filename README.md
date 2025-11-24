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

### go2rtc Streams (optional)

Falls Sie go2rtc verwenden, können Sie zusätzliche Streams in der `config.yaml` konfigurieren. Details siehe `config.yaml`.

## Playlist verwenden

### URL zur generierten Playlist

Nach der Generierung ist die Playlist unter folgender URL verfügbar:

```
https://raw.githubusercontent.com/Rosenweg/tv7/main/playlist.m3u
```

## Init7 TV-Kanäle

Die Playlist enthält alle verfügbaren Init7 TV-Kanäle:

- 🇩🇪 **Deutsch**: SRF 1, SRF zwei, SRF info
- 🇫🇷 **Français**: RTS 1, RTS 2
- 🇮🇹 **Italiano**: RSI LA 1, RSI LA 2

Und weitere Kanäle je nach Init7-Verfügbarkeit.

## Links

- [Init7 TV](https://www.init7.net/de/tv/)
- [Init7 Support](https://www.init7.net/de/support/)
