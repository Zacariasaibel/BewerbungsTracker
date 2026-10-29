import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <a class="skip-link" href="#main">Zum Inhalt springen</a>
    <aside class="sidebar">
      <a class="brand" routerLink="/"><span class="brand-icon" aria-hidden="true">B</span><span>Bewerbungs<span class="brand-light">Tracker</span></span></a>
      <p class="nav-caption">MEIN ARBEITSPLATZ</p>
      <nav aria-label="Hauptnavigation">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" ariaCurrentWhenActive="page"><span aria-hidden="true">◫</span> Übersicht</a>
        <a routerLink="/bewerbungen" routerLinkActive="active" ariaCurrentWhenActive="page"><span aria-hidden="true">▤</span> Bewerbungen</a>
        <a routerLink="/nachfassen" routerLinkActive="active" ariaCurrentWhenActive="page"><span aria-hidden="true">◷</span> Nachfassen</a>
      </nav>
      <div class="sidebar-note"><span class="small-label">SCHRITT FÜR SCHRITT</span><p>Ihre nächste Chance<br>beginnt mit Überblick.</p><span class="muted">Alles an einem Ort.</span></div>
    </aside>
    <div class="workspace">
      <header class="topbar"><span>Bewerbungen organisieren. Chancen nutzen.</span><span class="local-label"><i aria-hidden="true"></i> Lokaler Arbeitsbereich</span></header>
      <main id="main" tabindex="-1"><router-outlet /></main>
      <footer>BewerbungsTracker <span>Ein klarer Blick auf Ihren nächsten Schritt.</span></footer>
    </div>
  `,
})
export class App {}
