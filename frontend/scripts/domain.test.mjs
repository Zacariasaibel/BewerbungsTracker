import assert from 'node:assert/strict';
import test from 'node:test';
import { berlinToday, filterApplications, followUps, formatDate, isOpen } from '../src/app/application.ts';

const application = (id, overrides = {}) => ({
  id, company: 'Beispiel GmbH', position: 'Praktikum', location: '', status: 'applied',
  applied_on: '2026-10-01', job_url: '', notes: '', next_action_on: null,
  created_at: '2026-10-01T12:00:00Z', ...overrides,
});

test('company search is case-insensitive and combines with status', () => {
  const items = [application(1), application(2, { status: 'interview' }), application(3, { company: 'Andere AG' })];
  assert.deepEqual(filterApplications(items, ' BEISPIEL ', 'interview').map((item) => item.id), [2]);
  assert.equal(filterApplications(items, 'missing', '').length, 0);
  assert.equal(filterApplications(items, '', '').length, 3);
});

test('due follow-ups include today, exclude closed applications, and sort oldest first', () => {
  const items = [
    application(1, { next_action_on: '2026-10-29' }),
    application(2, { next_action_on: '2026-10-28', status: 'interview' }),
    application(3, { next_action_on: '2026-10-30' }),
    application(4, { next_action_on: '2026-10-20', status: 'rejected' }),
    application(5, { next_action_on: '2026-10-20', status: 'accepted' }),
    application(6),
  ];
  assert.deepEqual(followUps(items, '2026-10-29').map((item) => item.id), [2, 1]);
  assert.deepEqual(followUps(items, '2026-10-29', false).map((item) => item.id), [2, 1, 3]);
  assert.equal(items[0].id, 1);
});

test('calendar dates are displayed without timezone conversion', () => {
  assert.equal(formatDate('2026-03-29'), '29.03.2026');
  assert.equal(formatDate('2026-10-25'), '25.10.2026');
  assert.equal(formatDate(null), 'Nicht geplant');
});

test('today uses Berlin across winter, summer and daylight-saving boundaries', () => {
  assert.equal(berlinToday(new Date('2026-01-01T23:30:00Z')), '2026-01-02');
  assert.equal(berlinToday(new Date('2026-07-01T22:30:00Z')), '2026-07-02');
  assert.equal(berlinToday(new Date('2026-03-29T00:30:00Z')), '2026-03-29');
  assert.equal(berlinToday(new Date('2026-10-25T01:30:00Z')), '2026-10-25');
});

test('dashboard open count excludes accepted and rejected', () => {
  const items = ['applied', 'interview', 'rejected', 'accepted'].map((status, index) => application(index, { status }));
  assert.equal(items.filter(isOpen).length, 2);
});
