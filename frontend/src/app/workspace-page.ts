import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApplicationService } from './application.service';
import { ApplicationStatus, berlinToday, filterApplications, followUps, formatDate, isOpen, statusLabels, statuses } from './application';

@Component({
  selector: 'app-workspace-page',
  imports: [RouterLink, FormsModule],
  templateUrl: './workspace-page.html',
})
export class WorkspacePage {
  readonly store = inject(ApplicationService);
  private readonly route = inject(ActivatedRoute);
  readonly mode = signal<'overview' | 'list' | 'followups'>('overview');
  readonly query = signal('');
  readonly selectedStatus = signal('');
  readonly today = signal(berlinToday());
  readonly labels = statusLabels;
  readonly statuses = statuses;
  readonly date = formatDate;
  readonly openCount = computed(() => this.store.items().filter(isOpen).length);
  readonly interviewCount = computed(() => this.store.items().filter((item) => item.status === 'interview').length);
  readonly due = computed(() => followUps(this.store.items(), this.today()));
  readonly upcoming = computed(() => followUps(this.store.items(), this.today(), false).slice(0, 5));
  readonly visible = computed(() => this.mode() === 'followups' ? this.due()
    : filterApplications(this.store.items(), this.query(), this.selectedStatus()));

  constructor() {
    const clock = setInterval(() => this.today.set(berlinToday()), 60_000);
    inject(DestroyRef).onDestroy(() => clearInterval(clock));
    this.route.data.pipe(takeUntilDestroyed()).subscribe((data) => {
      this.mode.set(data['mode'] as 'overview' | 'list' | 'followups');
      this.reload();
    });
  }

  reload(): void {
    this.today.set(berlinToday());
    this.store.load();
  }

  resetFilters(): void {
    this.query.set('');
    this.selectedStatus.set('');
  }

  countStatus(status: ApplicationStatus): number {
    return this.store.items().filter((item) => item.status === status).length;
  }
}
