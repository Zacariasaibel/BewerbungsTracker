export type ApplicationStatus = 'applied' | 'interview' | 'rejected' | 'accepted';

export interface ApplicationInput {
  company: string;
  position: string;
  location: string;
  status: ApplicationStatus;
  applied_on: string;
  job_url: string;
  notes: string;
  next_action_on: string | null;
}

export interface Application extends ApplicationInput {
  id: number;
  created_at: string;
}

export const statusLabels: Record<ApplicationStatus, string> = {
  applied: 'Beworben', interview: 'Vorstellungsgespräch', rejected: 'Absage', accepted: 'Zusage',
};
export const statuses = Object.entries(statusLabels) as [ApplicationStatus, string][];

export function berlinToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function formatDate(value: string | null): string {
  if (!value) return 'Nicht geplant';
  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}`;
}

export function isOpen(item: Application): boolean {
  return item.status === 'applied' || item.status === 'interview';
}

export function followUps(items: Application[], today: string, dueOnly = true): Application[] {
  return items.filter((item) => isOpen(item) && item.next_action_on && (!dueOnly || item.next_action_on <= today))
    .sort((a, b) => (a.next_action_on ?? '').localeCompare(b.next_action_on ?? '') || b.id - a.id);
}

export function filterApplications(items: Application[], company: string, status: string): Application[] {
  const query = company.trim().toLocaleLowerCase('de');
  return items.filter((item) => item.company.toLocaleLowerCase('de').includes(query) && (!status || item.status === status));
}
