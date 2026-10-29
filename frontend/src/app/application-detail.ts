import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Application, formatDate, statusLabels } from './application';
import { ApplicationService } from './application.service';

@Component({
  selector: 'app-application-detail',
  imports: [RouterLink],
  templateUrl: './application-detail.html',
})
export class ApplicationDetail {
  private readonly store = inject(ApplicationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly application = signal<Application | null>(null);
  readonly loading = signal(true);
  readonly deleting = signal(false);
  readonly missing = signal(false);
  readonly error = signal('');
  readonly deleteError = signal('');
  readonly labels = statusLabels;
  readonly date = formatDate;

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(() => this.load());
  }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.error.set('');
    this.missing.set(false);
    this.application.set(null);
    if (!Number.isSafeInteger(id) || id < 1) { this.missing.set(true); this.loading.set(false); return; }
    this.loading.set(true);
    this.store.get(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (item) => { this.application.set(item); this.loading.set(false); },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.missing.set(error.status === 404);
        if (error.status !== 404) this.error.set('Die Bewerbung konnte nicht geladen werden. Bitte versuchen Sie es erneut.');
      },
    });
  }

  safeJobUrl(url: string): string | null {
    return /^https?:\/\//i.test(url) ? url : null;
  }

  remove(): void {
    const item = this.application();
    if (!item || this.deleting()) return;
    if (!window.confirm(`Bewerbung bei „${item.company}“ wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) return;
    this.deleting.set(true);
    this.deleteError.set('');
    this.store.delete(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { void this.router.navigate(['/bewerbungen']); },
      error: (error: HttpErrorResponse) => {
        this.deleting.set(false);
        if (error.status === 404) { this.missing.set(true); this.application.set(null); }
        else this.deleteError.set('Löschen nicht möglich. Bitte prüfen Sie die Verbindung und versuchen Sie es erneut.');
      },
    });
  }
}
