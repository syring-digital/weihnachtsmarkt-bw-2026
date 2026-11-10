/**
 * Backend für die Schichtliste Weihnachtsmarkt Bad Wildungen 2026.
 * Läuft als Google Apps Script (Web-App) und speichert in einem Google Sheet.
 * Einrichtung: siehe README.md
 *
 * Die Schichten (Zeiten, Plätze) werden NUR HIER gepflegt – die Webseite
 * liest sie von dieser Web-App.
 */

var SHEET_NAME = 'Eintragungen';
var CLUBS = ['Rotary', 'Lions'];

// cap = maximale Anzahl Personen pro Schicht
var SLOTS = [
  { id: 'sa-aufbau', day: 'Samstag, 05.12.2026',  task: 'Aufbauteam',    time: 'ab 10:00 Uhr',  cap: 15 },
  { id: 'sa-1',      day: 'Samstag, 05.12.2026',  task: 'Standbesetzung', time: '13:00–16:00', cap: 15 },
  { id: 'sa-2',      day: 'Samstag, 05.12.2026',  task: 'Standbesetzung', time: '16:00–19:00', cap: 15 },
  { id: 'sa-3',      day: 'Samstag, 05.12.2026',  task: 'Standbesetzung', time: '19:00–22:00', cap: 15 },
  { id: 'so-1',      day: 'Sonntag, 06.12.2026',  task: 'Standbesetzung', time: '11:00–14:00', cap: 10 },
  { id: 'so-2',      day: 'Sonntag, 06.12.2026',  task: 'Standbesetzung', time: '14:00–17:00', cap: 15 },
  { id: 'so-3',      day: 'Sonntag, 06.12.2026',  task: 'Standbesetzung', time: '12:00–20:00', cap: 15 },
  { id: 'so-abbau',  day: 'Sonntag, 06.12.2026',  task: 'Abbauteam',     time: 'ab 20:00 Uhr',  cap: 15 }
];

function doGet() {
  return json_({ ok: true, slots: slotsWithCounts_(readCounts_()) });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json_({ ok: false, error: 'Der Server ist gerade ausgelastet. Bitte gleich nochmal versuchen.' });
  }
  try {
    var req = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Spam-Schutz: verstecktes Feld muss leer sein
    if (req.website) return json_({ ok: true, booked: [], full: [], duplicates: [], slots: slotsWithCounts_(readCounts_()) });

    var name = clean_(req.name, 80);
    var phone = clean_(req.phone, 40);
    var club = String(req.club || '');
    if (name.length < 2) return json_({ ok: false, error: 'Bitte Namen angeben.' });
    if (CLUBS.indexOf(club) < 0) return json_({ ok: false, error: 'Bitte Club auswählen.' });
    if (!Array.isArray(req.slots) || req.slots.length === 0) return json_({ ok: false, error: 'Bitte mindestens eine Schicht auswählen.' });

    var sheet = sheet_();
    var rows = sheet.getDataRange().getValues().slice(1);
    var counts = {}, mine = {};
    rows.forEach(function (r) {
      counts[r[1]] = (counts[r[1]] || 0) + 1;
      mine[r[1] + '|' + String(r[5]).toLowerCase()] = true;
    });

    var booked = [], full = [], duplicates = [], now = new Date();
    var seen = {};
    req.slots.forEach(function (id) {
      if (seen[id]) return;
      seen[id] = true;
      var slot = findSlot_(id);
      if (!slot) return;
      if (mine[id + '|' + name.toLowerCase()]) { duplicates.push(id); return; }
      if ((counts[id] || 0) >= slot.cap) { full.push(id); return; }
      sheet.appendRow([now, id, slot.day, slot.time, slot.task, name, club, phone]);
      counts[id] = (counts[id] || 0) + 1;
      booked.push(id);
    });
    SpreadsheetApp.flush();

    return json_({ ok: true, booked: booked, full: full, duplicates: duplicates, slots: slotsWithCounts_(counts) });
  } catch (err) {
    return json_({ ok: false, error: 'Unerwarteter Fehler. Bitte später nochmal versuchen.' });
  } finally {
    lock.releaseLock();
  }
}

/** Einmalig im Apps-Script-Editor ausführen: legt das Tabellenblatt an. */
function setup() {
  sheet_();
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Zeitstempel', 'SlotID', 'Datum', 'Zeit', 'Aufgabe', 'Name', 'Club', 'Telefon']);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, 8).setFontWeight('bold');
  }
  return sh;
}

function readCounts_() {
  var counts = {};
  sheet_().getDataRange().getValues().slice(1).forEach(function (r) {
    counts[r[1]] = (counts[r[1]] || 0) + 1;
  });
  return counts;
}

function slotsWithCounts_(counts) {
  return SLOTS.map(function (s) {
    return { id: s.id, day: s.day, task: s.task, time: s.time, cap: s.cap, taken: counts[s.id] || 0 };
  });
}

function findSlot_(id) {
  for (var i = 0; i < SLOTS.length; i++) if (SLOTS[i].id === id) return SLOTS[i];
  return null;
}

function clean_(v, max) {
  // Führende Zeichen, die Google Sheets als Formel deuten würde, entschärfen
  var s = String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
