/**
 * Small universal API client used by services and frontend (demo).
 * Works in browser (uses window.fetch) and in Node (uses node-fetch).
 *
 * Usage:
 * const api = require('@smarttourist/api-client');
 * api.get('/v1/alerts', { baseUrl: 'http://localhost:4000' });
 */

let fetchImpl = (typeof fetch !== 'undefined') ? fetch : null;
if (!fetchImpl) {
  // node environment: use node-fetch v2
  try {
    // eslint-disable-next-line global-require
    fetchImpl = require('node-fetch');
  } catch (e) {
    throw new Error('Fetch is not available and node-fetch is not installed.');
  }
}

function normalizeBase(base) {
  if (!base) return '';
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

async function request(method, path, body = null, opts = {}) {
  const base = normalizeBase(opts.baseUrl || process.env.API_BASE || '');
  const url = base + path;

  const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});

  const fetchOpts = {
    method,
    headers
  };

  if (body != null) {
    fetchOpts.body = JSON.stringify(body);
  }

  const res = await fetchImpl(url, fetchOpts);

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    // not JSON
    data = text;
  }

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

module.exports = {
  get: (path, opts) => request('GET', path, null, opts),
  post: (path, body, opts) => request('POST', path, body, opts),
  put: (path, body, opts) => request('PUT', path, body, opts),
  del: (path, opts) => request('DELETE', path, null, opts),
};
