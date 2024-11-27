# Wareneingang System

Ein modernes Wareneingangssystem für die effiziente Verwaltung von Lieferungen.

## Features

- Erfassung von Wareneingängen mit Bildern
- Lieferantenverwaltung
- OCR-Texterkennung für Lieferscheine
- Archivierung und Suchfunktion
- Responsive Design

## Technologien

- React mit TypeScript
- Vite als Build-Tool
- Firebase (Auth, Firestore, Storage)
- Tailwind CSS für Styling
- Tesseract.js für OCR

## Entwicklung

1. Repository klonen
2. Dependencies installieren:
```bash
npm install
```

3. Umgebungsvariablen einrichten:
   - Kopieren Sie `.env.example` zu `.env`
   - Tragen Sie Ihre Firebase-Konfigurationswerte ein

4. Entwicklungsserver starten:
```bash
npm run dev
```

## Deployment

Das Projekt ist für das Deployment auf Netlify konfiguriert. Stellen Sie sicher, dass alle erforderlichen Umgebungsvariablen in den Netlify-Einstellungen konfiguriert sind.

## Lizenz

MIT