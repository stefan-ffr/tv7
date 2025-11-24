# Sources Directory

Legen Sie hier Ihre M3U-Playlist-Dateien ab.

## Verwendung

Alle `*.m3u` Dateien in diesem Verzeichnis werden automatisch vom Generator eingelesen und in die finale Playlist zusammengeführt.

## Beispiele

```
sources/
├── init7_channels.m3u       # Init7 TV Kanäle
├── eigene_streams.m3u       # Ihre eigenen Streams
├── kamera_feeds.m3u         # IP-Kamera Feeds
└── custom.m3u               # Weitere benutzerdefinierte Streams
```

## Dateinamen

Der Dateiname ist egal - alle `*.m3u` Dateien werden geladen. Die Dateien werden alphabetisch sortiert verarbeitet.

## Format

Die Dateien sollten im M3U-Format vorliegen:

```m3u
#EXTM3U
#EXTINF:-1 tvg-id="example.ch" tvg-name="Beispiel Stream" tvg-logo="https://example.com/logo.png" group-title="Gruppe",Stream Name
https://example.com/stream.m3u8
```
