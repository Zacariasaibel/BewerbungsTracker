import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { finalize, Subscription, tap } from 'rxjs';
import { Application, ApplicationInput } from './application';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/applications/';
  private listRequest?: Subscription;
  readonly items = signal<Application[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  load(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.listRequest = this.http.get<Application[]>(this.url).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (items) => this.items.set(items),
      error: () => this.error.set('Die Bewerbungen konnten nicht geladen werden. Bitte prüfen Sie die Verbindung und versuchen Sie es erneut.'),
    });
  }

  get(id: number) { return this.http.get<Application>(`${this.url}${id}/`); }

  save(input: ApplicationInput, id?: number) {
    const request = id === undefined
      ? this.http.post<Application>(this.url, input)
      : this.http.put<Application>(`${this.url}${id}/`, input);
    return request.pipe(tap((saved) => {
      this.listRequest?.unsubscribe();
      this.items.update((items) =>
        [...items.filter((item) => item.id !== saved.id), saved].sort((a, b) =>
          b.applied_on.localeCompare(a.applied_on) || b.id - a.id));
    }));
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}${id}/`).pipe(
      tap(() => {
        this.listRequest?.unsubscribe();
        this.items.update((items) => items.filter((item) => item.id !== id));
      }),
    );
  }
}
