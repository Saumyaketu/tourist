// src/api/identityService.js

const BASE = import.meta.env.VITE_IDENTITY_SERVICE_URL || 'http://localhost:4100/v1';

async function parseBody(res) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const text = await res.text();
  if (isJson) {
    try { return JSON.parse(text); } catch (e) { return text; }
  }
  return text;
}

async function handleRes(res) {
  if (res.ok) {
    return parseBody(res);
  }
  // Not ok — parse body if possible and throw an Error with details
  const body = await parseBody(res).catch(()=>null);
  const msg = body && body.errors ? JSON.stringify(body.errors) : (body && body.message) ? body.message : `HTTP ${res.status} ${res.statusText}`;
  const err = new Error(msg);
  err.status = res.status;
  err.body = body;
  throw err;
}

export async function listTourists() {
  const res = await fetch(`${BASE}/tourists`);
  try { return await handleRes(res); }
  catch (e) { console.error('listTourists error', e); throw e; }
}

export async function getTourist(id) {
  if (!id) throw new Error('getTourist requires id');
  const res = await fetch(`${BASE}/tourists/${encodeURIComponent(id)}`);
  try { return await handleRes(res); }
  catch (e) { console.error('getTourist error', e); throw e; }
}

export async function createTourist(payload) {
  console.log('createTourist ->', payload, 'POST', `${BASE}/tourists`);
  const res = await fetch(`${BASE}/tourists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  try { return await handleRes(res); }
  catch (e) { console.error('createTourist error ->', e); throw e; }
}

export async function issueCredential(id) {
  if (!id) throw new Error('issueCredential requires id');
  const res = await fetch(`${BASE}/tourists/${encodeURIComponent(id)}/issue`, { method: 'POST' });
  try { return await handleRes(res); }
  catch (e) { console.error('issueCredential error', e); throw e; }
}
