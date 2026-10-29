import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApplicationService } from './application.service';
import { Application, ApplicationInput, filterApplications } from './application';

export const sampleInput: ApplicationInput = {
  company: 'Beispiel GmbH', position: 'Praktikum', location: '', status: 'applied',
  applied_on: '2026-10-29', next_action_on: null, job_url: '', notes: '',
};
export const sampleApplication: Application = { ...sampleInput, id: 1, created_at: '2026-10-29T12:00:00Z' };

describe('ApplicationService', () => {
  let store: ApplicationService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    store = TestBed.inject(ApplicationService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('loads data and supports retry after a connection failure', () => {
    store.load();
    expect(store.loading()).toBe(true);
    http.expectOne('/api/applications/').error(new ProgressEvent('error'));
    expect(store.error()).toBeTruthy();
    expect(store.loading()).toBe(false);
    store.load();
    http.expectOne('/api/applications/').flush([sampleApplication]);
    expect(store.error()).toBe('');
    expect(store.items()).toEqual([sampleApplication]);
  });

  it('creates, retrieves, updates, filters and deletes consistently', () => {
    store.save(sampleInput).subscribe();
    const create = http.expectOne('/api/applications/');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(sampleInput);
    create.flush(sampleApplication);
    expect(store.items().length).toBe(1);
    store.get(1).subscribe((item) => expect(item.id).toBe(1));
    http.expectOne('/api/applications/1/').flush(sampleApplication);
    store.save({ ...sampleInput, status: 'interview' }, 1).subscribe();
    const update = http.expectOne('/api/applications/1/');
    expect(update.request.method).toBe('PUT');
    update.flush({ ...sampleApplication, status: 'interview' });
    expect(store.items()[0].status).toBe('interview');
    expect(filterApplications(store.items(), 'beispiel', 'interview').length).toBe(1);
    expect(filterApplications(store.items(), 'beispiel', 'applied')).toEqual([]);
    store.delete(1).subscribe();
    const deletion = http.expectOne('/api/applications/1/');
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null, { status: 204, statusText: 'No Content' });
    expect(store.items()).toEqual([]);
  });

  it('does not update cached data when saving fails', () => {
    store.items.set([sampleApplication]);
    store.save({ ...sampleInput, company: '' }, 1).subscribe({ error: () => undefined });
    http.expectOne('/api/applications/1/').flush({ company: ['Pflichtfeld.'] }, { status: 400, statusText: 'Bad Request' });
    expect(store.items()).toEqual([sampleApplication]);
  });

  it('cancels a stale list request after a successful write', () => {
    store.load();
    const stale = http.expectOne('/api/applications/');
    store.save(sampleInput).subscribe();
    http.expectOne('/api/applications/').flush(sampleApplication);
    expect(stale.cancelled).toBe(true);
    expect(store.items()).toEqual([sampleApplication]);
    expect(store.loading()).toBe(false);
  });
});
