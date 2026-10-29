import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { ApplicationDetail } from './application-detail';

describe('ApplicationDetail', () => {
  let http: HttpTestingController;
  beforeEach(async () => {
    const paramMap = convertToParamMap({ id: '1' });
    TestBed.configureTestingModule({
      imports: [ApplicationDetail],
      providers: [
        provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { paramMap: of(paramMap), snapshot: { paramMap } } },
      ],
    });
    await TestBed.compileComponents();
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); vi.restoreAllMocks(); });

  it('confirms deletion with the company name and allows retry after failure', () => {
    const fixture = TestBed.createComponent(ApplicationDetail);
    http.expectOne('/api/applications/1/').flush({
      id: 1, company: 'Beispiel GmbH', position: 'Praktikum', status: 'applied',
      location: '', applied_on: '2026-10-29', job_url: '', notes: '', next_action_on: null,
      created_at: '2026-10-29T12:00:00Z',
    });
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    fixture.componentInstance.remove();
    expect(confirm.mock.calls[0][0]).toContain('Beispiel GmbH');
    http.expectNone('/api/applications/1/');
    confirm.mockReturnValue(true);
    fixture.componentInstance.remove();
    fixture.componentInstance.remove();
    http.expectOne('/api/applications/1/').error(new ProgressEvent('error'));
    expect(fixture.componentInstance.deleting()).toBe(false);
    expect(fixture.componentInstance.deleteError()).toBeTruthy();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.componentInstance.remove();
    http.expectOne('/api/applications/1/').flush(null, { status: 204, statusText: 'No Content' });
    expect(navigate).toHaveBeenCalledWith(['/bewerbungen']);
  });
});
