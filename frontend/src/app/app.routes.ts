import { Routes } from '@angular/router';
import { WorkspacePage } from './workspace-page';
import { ApplicationForm } from './application-form';
import { ApplicationDetail } from './application-detail';

export const routes: Routes = [
  { path: '', component: WorkspacePage, data: { mode: 'overview' }, title: 'Übersicht · BewerbungsTracker' },
  { path: 'bewerbungen', component: WorkspacePage, data: { mode: 'list' }, title: 'Bewerbungen · BewerbungsTracker' },
  { path: 'nachfassen', component: WorkspacePage, data: { mode: 'followups' }, title: 'Nachfassen · BewerbungsTracker' },
  { path: 'bewerbungen/neu', component: ApplicationForm, title: 'Neue Bewerbung · BewerbungsTracker' },
  { path: 'bewerbungen/:id/bearbeiten', component: ApplicationForm, title: 'Bewerbung bearbeiten · BewerbungsTracker' },
  { path: 'bewerbungen/:id', component: ApplicationDetail, title: 'Bewerbung · BewerbungsTracker' },
  { path: '**', redirectTo: '' },
];
