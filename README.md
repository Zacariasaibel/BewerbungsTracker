# BewerbungsTracker

BewerbungsTracker hilft dabei, Bewerbungen zu verwalten und Termine zum Nachfassen im Blick zu behalten. Das Projekt ist Teil meines Portfolios für ein Praktikum in der Anwendungsentwicklung.

## Funktionen

- Bewerbungen anlegen, ansehen, bearbeiten und löschen.
- Nach Unternehmen suchen und nach Status filtern.
- Auf einer Übersichtsseite die wichtigsten Zahlen und die nächsten Schritte sehen.
- Fällige Termine zum Nachfassen anzeigen. Bewerbungen mit Zusage oder Absage werden dabei nicht berücksichtigt.
- Die Anwendung auf dem Computer und auf dem Smartphone nutzen.

Die Oberfläche ist auf Deutsch. Zum Ausprobieren stehen zehn fiktive Bewerbungen zur Verfügung.

## Technologien

- **Frontend:** Angular 21, TypeScript und CSS.
- **Backend:** Python, Django 5.2.18 und Django REST Framework 3.18.3.
- **Datenbank:** SQLite.

Das Frontend ruft die Daten über die REST-API des Backends ab. Es verwendet Standalone-Komponenten und keine zusätzliche UI-Bibliothek.

## Lokal starten

Die folgenden Schritte sind für Windows PowerShell gedacht. Benötigt werden Git, Python 3.13 mit dem Windows-Launcher `py` und Node.js mit npm.

Getestet wurde mit Python 3.13.3, Node.js 24.11.1 und npm 11.6.2. Angular CLI wird mit den Frontend-Abhängigkeiten installiert. SQLite ist in Python enthalten.

### 1. Backend vorbereiten

In der ersten PowerShell das Projekt herunterladen und die Python-Abhängigkeiten installieren:

```powershell
git clone https://github.com/Zacariasaibel/BewerbungsTracker.git "$HOME\BewerbungsTracker"
Set-Location "$HOME\BewerbungsTracker"
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
```

Danach in derselben PowerShell einen temporären Schlüssel erzeugen, die Datenbank vorbereiten und Django starten:

```powershell
$env:DJANGO_SECRET_KEY = & .\.venv\Scripts\python.exe -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
.\.venv\Scripts\python.exe backend/manage.py migrate
.\.venv\Scripts\python.exe backend/manage.py seed_demo
.\.venv\Scripts\python.exe backend/manage.py runserver 127.0.0.1:8000
```

Der Schlüssel gilt für diese PowerShell-Sitzung und wird nicht in einer Datei gespeichert. In einer neuen Sitzung muss er vor Django-Befehlen erneut gesetzt werden. Die virtuelle Umgebung muss nicht aktiviert werden, da die Befehle ihren Python-Interpreter direkt aufrufen. `.env`-Dateien werden nicht automatisch geladen.

`migrate` erstellt die lokale Datenbank `backend/db.sqlite3`. `seed_demo` legt zehn fiktive Bewerbungen an. Vorhandene Beispiele werden anhand von Unternehmen und Position erkannt und bleiben bei erneutem Ausführen unverändert. Andere Datensätze werden nicht gelöscht.

Django läuft unter `http://127.0.0.1:8000`. Dieses Terminal geöffnet lassen.

### 2. Frontend starten

Eine zweite PowerShell öffnen und ausführen:

```powershell
Set-Location "$HOME\BewerbungsTracker\frontend"
npm.cmd ci
npm.cmd start
```

Danach im Browser **http://127.0.0.1:4200** öffnen.

`npm.cmd ci` installiert die im Lockfile festgelegten Versionen. `npm.cmd` funktioniert auch dann, wenn PowerShell `npm.ps1` blockiert.

Beide Server müssen laufen. Der Entwicklungsproxy leitet API-Anfragen an Django auf Port 8000 weiter. Die Server lassen sich im jeweiligen Terminal mit `Ctrl+C` beenden.

## Prüfungen

Folgende Prüfungen wurden erfolgreich durchgeführt:

- 19 Backend-Tests.
- 12 Angular-Tests.
- 5 Tests für die TypeScript-Logik.
- Angular-Build und ein vollständiger CRUD-Ablauf mit echten HTTP-Anfragen.
- Manuelle Prüfung im Browser: anlegen, neu laden, suchen, filtern, bearbeiten und löschen.
- Prüfung der Oberfläche auf Computer und Smartphone.

Die Ergebnisse und die Zuordnung der einzelnen Prüfungen stehen in der [Test-Checkliste](docs/test-checklist.md).

Die Frontend-Prüfungen lassen sich in einer weiteren PowerShell ausführen:

```powershell
Set-Location "$HOME\BewerbungsTracker\frontend"
npm.cmd run build
npm.cmd test
npm.cmd run test:domain
npm.cmd run test:api
```

Für `test:api` muss der Django-Server laufen.

## Aktueller Stand

Die Anwendung funktioniert lokal. Eine Anmeldung gibt es noch nicht. Die API erlaubt Lese- und Schreibzugriffe ohne Anmeldung. Deshalb sind die Beispieldaten fiktiv; auch zum eigenen Ausprobieren bitte nur fiktive Daten verwenden.

Vor einem öffentlichen Betrieb müssen die Schreibrechte eingeschränkt und die Einstellungen für den Serverbetrieb angepasst werden. Ein öffentliches Hosting und eine Historie der Statusänderungen sind noch nicht umgesetzt.

## Weitere Dokumentation

Die Lern- und Entwicklungsdokumentation ist auf Spanisch:

- [Entwicklung und Prüfungen](docs/development.md)
- [Test-Checkliste](docs/test-checklist.md)
- [API](docs/api.md)
- [Datenmodell](docs/data-model.md)
