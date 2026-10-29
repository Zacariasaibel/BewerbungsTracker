import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { App } from './app/app';
import { routes } from './app/app.routes';

bootstrapApplication(App, {
  providers: [provideHttpClient(), provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' }))],
}).catch(() => {
  document.body.textContent = 'Die Anwendung konnte nicht gestartet werden. Bitte laden Sie die Seite neu.';
});
