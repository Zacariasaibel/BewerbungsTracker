import assert from 'node:assert/strict';
import { filterApplications } from '../src/app/application.ts';

const base = 'http://127.0.0.1:8000/api/applications/';
const company = `HTTP Workflow Demo ${Date.now()}`;
const headers = { 'Content-Type': 'application/json' };
let id;
try {
  let response = await fetch(base, {
    method: 'POST', headers,
    body: JSON.stringify({ company, position: 'Praktikum FIAE', applied_on: '2026-10-29' }),
  });
  assert.equal(response.status, 201);
  id = (await response.json()).id;
  response = await fetch(`${base}${id}/`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).company, company);
  response = await fetch(`${base}${id}/`, {
    method: 'PUT', headers,
    body: JSON.stringify({ company, position: 'Praktikum Backend', status: 'interview', applied_on: '2026-10-29', next_action_on: null }),
  });
  assert.equal(response.status, 200);
  response = await fetch(base);
  assert.equal(response.status, 200);
  const items = await response.json();
  assert.deepEqual(filterApplications(items, company.toUpperCase(), 'interview').map((item) => item.id), [id]);
  assert.deepEqual(filterApplications(items, company, 'applied'), []);
  response = await fetch(`${base}${id}/`, { method: 'DELETE' });
  assert.equal(response.status, 204);
  assert.equal((await fetch(`${base}${id}/`)).status, 404);
  id = undefined;
  console.log('HTTP + TypeScript: create 201 -> retrieve 200 -> edit 200 -> filter OK -> delete 204 -> missing 404.');
} finally {
  if (id !== undefined) await fetch(`${base}${id}/`, { method: 'DELETE' });
}
