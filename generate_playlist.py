#!/usr/bin/env python3
"""
M3U Playlist Generator
Kombiniert Init7 TV Streams und go2rtc Streams zu einer M3U-Playlist
"""

import requests
import yaml
import sys
import re
from typing import List, Dict
from pathlib import Path


class M3UEntry:
    """Repräsentiert einen einzelnen M3U Eintrag"""

    def __init__(self, name: str, url: str, tvg_id: str = "", tvg_name: str = "",
                 tvg_logo: str = "", group_title: str = ""):
        self.name = name
        self.url = url
        self.tvg_id = tvg_id
        self.tvg_name = tvg_name or name
        self.tvg_logo = tvg_logo
        self.group_title = group_title

    def to_m3u(self) -> str:
        """Konvertiert den Eintrag zu M3U Format"""
        extinf_parts = ['#EXTINF:-1']

        if self.tvg_id:
            extinf_parts.append(f'tvg-id="{self.tvg_id}"')
        if self.tvg_name:
            extinf_parts.append(f'tvg-name="{self.tvg_name}"')
        if self.tvg_logo:
            extinf_parts.append(f'tvg-logo="{self.tvg_logo}"')
        if self.group_title:
            extinf_parts.append(f'group-title="{self.group_title}"')

        extinf_line = ' '.join(extinf_parts) + f',{self.name}'
        return f'{extinf_line}\n{self.url}\n'


class PlaylistGenerator:
    """Generiert M3U Playlists aus verschiedenen Quellen"""

    def __init__(self, config_path: str = 'config.yaml'):
        self.config = self.load_config(config_path)
        self.entries: List[M3UEntry] = []

    def load_config(self, config_path: str) -> dict:
        """Lädt die Konfigurationsdatei"""
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            print(f"Fehler: Konfigurationsdatei '{config_path}' nicht gefunden")
            sys.exit(1)
        except yaml.YAMLError as e:
            print(f"Fehler beim Parsen der Konfiguration: {e}")
            sys.exit(1)

    def fetch_init7_streams(self):
        """Lädt die Init7 TV Streams"""
        if not self.config.get('init7', {}).get('enabled', False):
            print("Init7 Streams deaktiviert")
            return

        url = self.config['init7'].get('url')
        if not url:
            print("Warnung: Init7 URL nicht konfiguriert")
            return

        print(f"Lade Init7 Streams von {url}...")
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()

            # Parse M3U content
            content = response.text
            entries = self.parse_m3u(content)
            self.entries.extend(entries)
            print(f"✓ {len(entries)} Init7 Streams geladen")

        except requests.RequestException as e:
            print(f"Fehler beim Laden der Init7 Streams: {e}")

    def parse_m3u(self, content: str) -> List[M3UEntry]:
        """Parst M3U Inhalt und gibt Einträge zurück"""
        entries = []
        lines = content.strip().split('\n')

        i = 0
        while i < len(lines):
            line = lines[i].strip()

            # Skip empty lines and header
            if not line or line == '#EXTM3U':
                i += 1
                continue

            # Parse EXTINF line
            if line.startswith('#EXTINF:'):
                # Extract attributes
                tvg_id = self.extract_attribute(line, 'tvg-id')
                tvg_name = self.extract_attribute(line, 'tvg-name')
                tvg_logo = self.extract_attribute(line, 'tvg-logo')
                group_title = self.extract_attribute(line, 'group-title')

                # Extract channel name (after last comma)
                name_match = re.search(r',(.+)$', line)
                name = name_match.group(1).strip() if name_match else "Unknown"

                # Get URL from next line
                i += 1
                if i < len(lines):
                    url = lines[i].strip()
                    if url and not url.startswith('#'):
                        entry = M3UEntry(
                            name=name,
                            url=url,
                            tvg_id=tvg_id,
                            tvg_name=tvg_name,
                            tvg_logo=tvg_logo,
                            group_title=group_title
                        )
                        entries.append(entry)

            i += 1

        return entries

    def extract_attribute(self, line: str, attr: str) -> str:
        """Extrahiert ein Attribut aus einer EXTINF Zeile"""
        pattern = f'{attr}="([^"]*)"'
        match = re.search(pattern, line)
        return match.group(1) if match else ""

    def add_go2rtc_streams(self):
        """Fügt go2rtc Streams hinzu"""
        if not self.config.get('go2rtc', {}).get('enabled', False):
            print("go2rtc Streams deaktiviert")
            return

        streams = self.config.get('go2rtc', {}).get('streams', [])
        if not streams:
            print("Keine go2rtc Streams konfiguriert")
            return

        print("Füge go2rtc Streams hinzu...")
        base_url = self.config['go2rtc'].get('base_url', 'http://localhost:1984')

        for stream in streams:
            name = stream.get('name', 'Unknown')
            url = stream.get('url', '')
            logo = stream.get('logo', '')
            group = stream.get('group', 'go2rtc')

            if url:
                entry = M3UEntry(
                    name=name,
                    url=url,
                    tvg_logo=logo,
                    group_title=group
                )
                self.entries.append(entry)

        print(f"✓ {len(streams)} go2rtc Streams hinzugefügt")

    def generate_playlist(self) -> str:
        """Generiert die M3U Playlist"""
        lines = ['#EXTM3U\n']

        for entry in self.entries:
            lines.append(entry.to_m3u())

        return ''.join(lines)

    def save_playlist(self, output_path: str = None):
        """Speichert die Playlist in eine Datei"""
        if output_path is None:
            output_path = self.config.get('output', {}).get('filename', 'playlist.m3u')

        content = self.generate_playlist()

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"\n✓ Playlist gespeichert: {output_path}")
        print(f"  Anzahl Streams: {len(self.entries)}")

    def run(self):
        """Führt den kompletten Generierungsprozess aus"""
        print("=" * 60)
        print("M3U Playlist Generator")
        print("=" * 60)

        self.fetch_init7_streams()
        self.add_go2rtc_streams()
        self.save_playlist()

        print("\n✓ Fertig!")


def main():
    """Hauptfunktion"""
    generator = PlaylistGenerator()
    generator.run()


if __name__ == '__main__':
    main()
