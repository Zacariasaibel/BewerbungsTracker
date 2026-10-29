# BewerbungsTracker

Ein lokaler Bewerbungsmanager für das FIAE-Praktikumsportfolio: Bewerbungen erfassen, den Überblick behalten und rechtzeitig nachfassen.

## Funktionen

- Übersicht mit Kennzahlen aus der Django-API und den nächsten geplanten Schritten.
- Bewerbungen suchen, nach Status filtern, anlegen, ansehen, bearbeiten und löschen.
- Fällige Schritte für offene Bewerbungen; Zusagen und Absagen werden ausgeschlossen.
- Deutsche Oberfläche, responsive CSS, beschriftete Formulare und sichtbarer Tastaturfokus.
- Zehn fiktive Demobewerbungen über den wiederholbaren Befehl `seed_demo`.

## Technik

Angular 21 mit Standalone-Komponenten, strengem TypeScript und CSS; Django 5.2.18, Django REST Framework 3.18.3 und SQLite. Kein SSR und keine zusätzliche UI-Bibliothek. Kalenderdaten bleiben als `YYYY-MM-DD` erhalten.

## Lokal starten (PowerShell)

Voraussetzungen: Python 3.13, Node.js passend zu Angular 21, npm und das vorbereitete virtuelle Python-Environment `.venv`. Backend-Abhängigkeiten stehen in `backend/requirements.txt`.

Terminal 1, im Projektverzeichnis:

```powershell
$env:DJANGO_SECRET_KEY = & .\.venv\Scripts\python.exe -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
.\.venv\Scripts\python.exe backend/manage.py migrate
.\.venv\Scripts\python.exe backend/manage.py seed_demo
.\.venv\Scripts\python.exe backend/manage.py runserver 127.0.0.1:8000
```

Terminal 2, im Projektverzeichnis:

```powershell
Set-Location frontend
npm.cmd install
npm.cmd start
```

Anschließend `http://127.0.0.1:4200` öffnen. Der Entwicklungsproxy leitet `/api/**` an Django weiter. `seed_demo` verändert vorhandene Einträge nicht und erkennt Beispiele anhand von Unternehmen und Position.

## Prüfungen und aktueller Stand

**Der lokale MVP ist implementiert und geprüft.** Der Benutzer hat die erfolgreiche npm-Installation, den Angular-Build und alle zwölf Angular-Tests in PowerShell bestätigt. Im Browser wurden Anlegen → Neuladen → Suchen und Filtern → Bearbeiten → Löschen sowie die Oberfläche auf Desktop und Mobilgeräten überprüft.

Der Agent hat zuvor 19 Backend-Tests, fünf TypeScript-Domänentests und einen echten HTTP-CRUD-Ablauf mit TypeScript-Filter erfolgreich ausgeführt. Die Zuordnung der Prüfungen steht in der spanischen [Test-Checkliste](docs/test-checklist.md). Der frühere Installationsfehler in der Agentenumgebung ist kein offener Blocker mehr.

Zum Wiederholen der Prüfungen, in `frontend/`:

```powershell
npm.cmd run build
npm.cmd test
npm.cmd run test:domain
# Requires the running Django server.
npm.cmd run test:api
```

Die API erlaubt lokal anonymen Lese- und Schreibzugriff. Nur mit fiktiven Daten verwenden; vor einer Veröffentlichung müssen Schreibrechte eingeschränkt und Produktionseinstellungen eingerichtet werden. Deployment und Bewerbungshistorie sind nicht Teil dieses MVP-Blocks.

`frontend/package-lock.json` wird versioniert; bei einer frischen Installation mit vorhandenem Lockfile kann `npm.cmd ci` verwendet werden. Abhängigkeiten, virtuelle Umgebungen, lokale SQLite-Datenbanken und `.env`-Dateien gehören nicht ins Repository.

Ausführliche Lern- und Entwicklungsdokumentation auf Spanisch: [Entwicklung und Prüfungen](docs/development.md), [Test-Checkliste](docs/test-checklist.md), [API](docs/api.md), [Datenmodell](docs/data-model.md).
