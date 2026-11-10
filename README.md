# Weihnachtsmarkt Bad Wildungen 2026 – Schichtliste

Einfache Eintragsseite für Auf-/Abbauteam und Standbesetzung (05.–06.12.2026, Laupark).
Kostenlos: Webseite auf GitHub Pages, Daten in einem Google Sheet (Apps Script als Backend).

- `index.html` + `logo-rotary.png`, `logo-lions.png` – die Seite (kein Build nötig)
- `apps-script/Code.gs` – Backend; hier sind auch die **Schichten und Plätze** definiert
- `.github/workflows/pages.yml` – veröffentlicht `index.html` auf GitHub Pages

Ohne Backend-URL läuft `index.html` im **Vorschau-Modus** (Demo-Daten, nichts wird gespeichert) –
einfach die Datei im Browser öffnen.

## Einrichtung (ca. 15 Minuten)

### 1. Google Sheet + Backend
1. Neues Google Sheet anlegen (z. B. „Weihnachtsmarkt 2026 – Schichten“).
2. **Erweiterungen → Apps Script**, den Inhalt von `apps-script/Code.gs` einfügen, speichern.
3. Funktion `setup` einmal ausführen (Berechtigungen bestätigen). Es entsteht das Blatt „Eintragungen“.
4. **Bereitstellen → Neue Bereitstellung → Typ „Web-App“**
   - Ausführen als: **Ich**
   - Zugriff: **Jeder**
5. Die angezeigte **Web-App-URL** (endet auf `/exec`) kopieren.

### 2. URL in die Seite eintragen
In `index.html` den Platzhalter `HIER_WEB_APP_URL_EINFUEGEN` bei `API_URL` durch die URL ersetzen.

### 3. GitHub Pages
1. Änderungen nach `main` mergen.
2. Im Repo: **Settings → Pages → Source: „GitHub Actions“**.
3. Die Seite ist dann unter `https://syring-digital.github.io/weihnachtsmarkt-bw-2026/` erreichbar
   (kostenlose Konten brauchen dafür ein öffentliches Repo – im Repo liegen keine Personendaten).

Diesen Link an die Clubpräsidenten schicken, sie leiten ihn an die Mitglieder weiter.

## Betrieb
- Alle Eintragungen stehen im Blatt „Eintragungen“ (Name, Club, Telefon, Schicht).
- Zusätzlich werden die Namen automatisch in die Übersichtstabelle (Vorlage mit „Person 1 … Person 15“) geschrieben,
  als „Name (Club)“. Die Zeilen je Schicht stehen in `OVERVIEW_ROWS` in `Code.gs`; ändert sich das Layout, dort anpassen.
  Nach manuellem Löschen von Zeilen: Menü **Schichtliste → Übersicht aktualisieren**.
- **Austragen:** Zeile im Sheet löschen – der Platz wird sofort wieder frei.
- **Schichten/Plätze ändern:** `SLOTS` in `Code.gs` anpassen und eine **neue Version bereitstellen**
  (Bereitstellen → Bereitstellungen verwalten → Bearbeiten → Neue Version). Die URL bleibt gleich.
- Überbuchung wird serverseitig verhindert (Sperre bei gleichzeitigen Eintragungen).

## Annahmen (bitte prüfen)
- Plätze pro Schicht: 15, Sonntag 11–14 Uhr: 10 (laut Vorlage „nicht erforderlich“ ab Person 11).
- Schicht „17:00–20:00“ am Sonntag und Auf-/Abbauteam: 15 Plätze angenommen.
