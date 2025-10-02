import { AUTH_SERVICE_URL } from './config';

async function handleJsonResponse(res) {
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = payload?.message || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.payload = payload;
    throw err;
  }
  return payload;
}

export async function loginWithPassword(idOrEmail, password) {
  const url = `${AUTH_SERVICE_URL}/v1/auth/login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: idOrEmail, password }),
  });
  return handleJsonResponse(res); // should return { token, user }
}

export async function changePassword(token, currentPassword, newPassword) {
  const url = `${AUTH_SERVICE_URL}/v1/auth/change-password`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return handleJsonResponse(res);
}

export async function fetchProfile(token) {
  const url = `${AUTH_SERVICE_URL}/v1/users/me`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleJsonResponse(res); // expected { user: {...} } or user object
}