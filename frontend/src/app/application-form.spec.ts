import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { ApplicationForm } from './application-form';

describe('ApplicationForm', () => {
  let http: HttpTestingController;
  async function setup(id?: string) {
    TestBed.configureTestingModule({
      imports: [ApplicationForm],
      providers: [
        provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap(id ? { id } : {})) } },
      ],
    });
    await TestBed.compileComponents();
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ApplicationForm);
    fixture.detectChanges();
    return fixture;
  }
  afterEach(() => { http?.verify(); vi.restoreAllMocks(); });

  it('rejects company and position containing only spaces before sending a request', async () => {
    const fixture = await setup();
    fixture.componentInstance.form.patchValue({ company: '  ', position: '\t' });
    fixture.componentInstance.submit();
    fixture.detectChanges();
    expect(fixture.componentInstance.form.invalid).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Bitte füllen Sie dieses Feld aus.');
    http.expectNone('/api/applications/');
  });

  it('retains data on API errors, displays field errors and blocks duplicate submissions', async () => {
    const fixture = await setup();
    const page = fixture.componentInstance;
    page.form.patchValue({ company: 'Beispiel GmbH', position: 'Praktikum', notes: 'Behalten' });
    page.submit();
    page.submit();
    const request = http.expectOne('/api/applications/');
    expect(page.saving()).toBe(true);
    request.flush({ company: ['Bitte prüfen Sie das Unternehmen.'] }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    expect(page.form.controls.notes.value).toBe('Behalten');
    expect(page.saving()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Bitte prüfen Sie das Unternehmen.');
    page.submit();
    http.expectOne('/api/applications/').error(new ProgressEvent('error'));
    expect(page.form.controls.notes.value).toBe('Behalten');
  });

  it('sends calendar strings and null follow-up dates without converting timezones', async () => {
    const fixture = await setup();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.componentInstance.form.patchValue({ company: ' Beispiel ', position: 'Praktikum', applied_on: '2026-03-29' });
    fixture.componentInstance.submit();
    const request = http.expectOne('/api/applications/');
    expect(request.request.body.applied_on).toBe('2026-03-29');
    expect(request.request.body.next_action_on).toBeNull();
    expect(request.request.body.company).toBe('Beispiel');
    request.flush({ ...request.request.body, id: 12, created_at: '2026-03-29T10:00:00Z' });
    expect(navigate).toHaveBeenCalledWith(['/bewerbungen', 12]);
  });

  it('handles a missing application when editing', async () => {
    const fixture = await setup('999');
    http.expectOne('/api/applications/999/').flush({}, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Bewerbung nicht gefunden');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('rejects malformed dates and links on the client', async () => {
    const fixture = await setup();
    fixture.componentInstance.form.patchValue({
      company: 'Demo', position: 'Praktikum', applied_on: '2026-02-30', job_url: 'javascript:alert(1)',
    });
    fixture.componentInstance.submit();
    expect(fixture.componentInstance.form.controls.applied_on.invalid).toBe(true);
    expect(fixture.componentInstance.form.controls.job_url.invalid).toBe(true);
    http.expectNone('/api/applications/');
  });
});
