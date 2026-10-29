import { Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApplicationService } from './application.service';
import { ApplicationStatus, berlinToday, statuses } from './application';

export function nonBlank(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim() ? null : { blank: true };
}

export function calendarDate(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value;
  if (!value) return null;
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value) || value.startsWith('0000')) return { date: true };
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value ? null : { date: true };
}

export function webUrl(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  try {
    const url = new URL(String(control.value));
    return ['https:', 'http:'].includes(url.protocol) && !!url.hostname ? null : { url: true };
  } catch { return { url: true }; }
}

@Component({
  selector: 'app-application-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './application-form.html',
})
export class ApplicationForm {
  private readonly builder = inject(FormBuilder).nonNullable;
  private readonly store = inject(ApplicationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly statuses = statuses;
  readonly id = signal<number | undefined>(undefined);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly missing = signal(false);
  readonly loadError = signal('');
  readonly saveError = signal('');
  readonly serverErrors = signal<Record<string, string>>({});
  readonly fields = [
    { key: 'company', label: 'Unternehmen', type: 'text', required: true, max: 200, placeholder: 'z. B. Beispiel GmbH' },
    { key: 'position', label: 'Position', type: 'text', required: true, max: 200, placeholder: 'z. B. Praktikum Fachinformatik' },
    { key: 'location', label: 'Standort', type: 'text', required: false, max: 200, placeholder: 'z. B. Berlin oder Remote' },
    { key: 'applied_on', label: 'Beworben am', type: 'date', required: true, max: null, placeholder: '' },
    { key: 'job_url', label: 'Link zur Stellenanzeige', type: 'url', required: false, max: 2000, placeholder: 'https://…' },
    { key: 'next_action_on', label: 'Nachfassen am', type: 'date', required: false, max: null, placeholder: '' },
  ];
  readonly form = this.builder.group({
    company: ['', [nonBlank, Validators.maxLength(200)]],
    position: ['', [nonBlank, Validators.maxLength(200)]],
    location: ['', Validators.maxLength(200)],
    status: this.builder.control<ApplicationStatus>('applied', Validators.required),
    applied_on: [berlinToday(), [Validators.required, calendarDate]],
    job_url: ['', [Validators.maxLength(2000), webUrl]],
    notes: ['', Validators.maxLength(10000)],
    next_action_on: ['', calendarDate],
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const raw = params.get('id');
      this.id.set(raw === null ? undefined : Number(raw));
      if (raw !== null) this.load();
    });
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.serverErrors.set({});
    });
  }

  load(): void {
    const id = this.id();
    if (id === undefined) return;
    this.loadError.set('');
    this.missing.set(false);
    if (!Number.isSafeInteger(id) || id < 1) { this.missing.set(true); return; }
    this.loading.set(true);
    this.store.get(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (item) => {
        this.form.patchValue({ ...item, next_action_on: item.next_action_on ?? '' });
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.missing.set(error.status === 404);
        if (error.status !== 404) this.loadError.set('Die Bewerbung konnte nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  fieldError(name: string): string {
    const server = this.serverErrors()[name];
    if (server) return server;
    const field = this.form.get(name);
    if (!field?.touched || !field.errors) return '';
    if (field.hasError('blank') || field.hasError('required')) return 'Bitte füllen Sie dieses Feld aus.';
    if (field.hasError('maxlength')) return `Bitte verwenden Sie höchstens ${field.errors['maxlength'].requiredLength} Zeichen.`;
    if (field.hasError('url')) return 'Bitte geben Sie einen gültigen Link mit https:// oder http:// ein.';
    return 'Bitte geben Sie ein gültiges Datum ein.';
  }

  submit(): void {
    if (this.saving()) return;
    this.saveError.set('');
    this.serverErrors.set({});
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.saveError.set('Bitte prüfen Sie die markierten Felder.');
      this.element.nativeElement.querySelector<HTMLElement>('.ng-invalid:not(form)')?.focus();
      return;
    }
    const value = this.form.getRawValue();
    this.saving.set(true);
    this.store.save({
      ...value, company: value.company.trim(), position: value.position.trim(),
      next_action_on: value.next_action_on || null,
    }, this.id()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (saved) => {
        this.saving.set(false);
        void this.router.navigate(['/bewerbungen', saved.id]);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        if (error.status === 400 && error.error && typeof error.error === 'object') {
          const messages: Record<string, string> = {};
          for (const [key, errors] of Object.entries(error.error as Record<string, unknown>)) {
            messages[key] = Array.isArray(errors) ? errors.join(' ') : String(errors);
          }
          this.serverErrors.set(messages);
        }
        this.saveError.set(error.status === 404
          ? 'Diese Bewerbung ist nicht mehr vorhanden. Ihre Eingaben bleiben erhalten.'
          : 'Speichern nicht möglich. Bitte prüfen Sie Ihre Eingaben und die Verbindung. Ihre Eingaben bleiben erhalten.');
      },
    });
  }
}
