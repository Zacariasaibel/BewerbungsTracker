import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { WorkspacePage } from './workspace-page';

describe('WorkspacePage', () => {
  let http: HttpTestingController;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [WorkspacePage],
      providers: [
        provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { data: of({ mode: 'list' }) } },
      ],
    });
    await TestBed.compileComponents();
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('renders server records, combines filters and distinguishes no search results', () => {
    const fixture = TestBed.createComponent(WorkspacePage);
    http.expectOne('/api/applications/').flush([
      { id: 1, company: 'Beispiel GmbH', position: 'Praktikum', status: 'applied', applied_on: '2026-10-29', next_action_on: null },
      { id: 2, company: 'Beispiel GmbH', position: 'Backend', status: 'interview', applied_on: '2026-10-29', next_action_on: null },
    ]);
    const page = fixture.componentInstance;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(2);
    page.query.set('BEISPIEL');
    page.selectedStatus.set('interview');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Backend');
    page.query.set('nicht vorhanden');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Keine passenden Bewerbungen');
    page.resetFilters();
    expect(page.visible().length).toBe(2);
  });

  it('renders a load error, supports retry, and shows the real empty state', () => {
    const fixture = TestBed.createComponent(WorkspacePage);
    http.expectOne('/api/applications/').error(new ProgressEvent('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Verbindung unterbrochen');
    fixture.componentInstance.reload();
    http.expectOne('/api/applications/').flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Noch keine Bewerbungen');
  });
});
