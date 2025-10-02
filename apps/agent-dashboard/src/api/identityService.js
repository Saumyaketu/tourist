// apps/agent-dashboard/src/api/identityService.js
// Robust identity client with improved error messages and optional agent token support.

const IDENTITY_BASE = (import.meta.env.VITE_IDENTITY_SERVICE_URL || 'http://localhost:4100/v1').replace(/\/$/, '');
const AUTH_BASE = (import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:4300/v1').replace(/\/$/, '');

// helper to parse response safely
async function parseBodySafe(res) {
  const text = await res.text().catch(() => null);
  if (!text) return null;
  try { return JSON.parse(text); }
  catch (e) { return text; }
}

function getAgentAuthHeader() {
  try {
    // If your agent UI stores token in localStorage under a different key, change it here
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('agent_token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (e) {
    return {};
  }
}

async function handleFetch(url, opts = {}) {
  // attach default headers
  opts.headers = Object.assign({}, opts.headers || {}, { 'Content-Type': 'application/json' });

  // if this is called from the agent dashboard we may need to include agent auth header
  const agentHeader = getAgentAuthHeader();
  if (agentHeader.Authorization) opts.headers = Object.assign({}, opts.headers, agentHeader);

  // ensure we accept CORS and credentials when needed
  // NOTE: we do not set credentials by default. Uncomment if you need cookies:
  // opts.credentials = opts.credentials || 'include';

  try {
    console.debug('[identityService] REQUEST', url, opts);
    const res = await fetch(url, opts);
    const body = await parseBodySafe(res);
    if (res.ok) {
      console.debug('[identityService] OK', res.status, body);
      return body;
    } else {
      // Build informative error
      const err = new Error(`HTTP ${res.status} ${res.statusText} - ${JSON.stringify(body)}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }
  } catch (err) {
    // network-level error (fetch failed, CORS, DNS, etc.)
    console.error('[identityService] Network/Fetch error', err);
    // wrap to give UI helpful message
    const e = new Error(`Network error while contacting ${url}: ${err.message}`);
    e.original = err;
    throw e;
  }
}

/* ---------------------------
   Exposed API
   --------------------------- */

export async function listTourists() {
  const url = `${IDENTITY_BASE}/tourists`;
  return handleFetch(url, { method: 'GET' });
}

export async function getTourist(id) {
  if (!id) throw new Error('getTourist requires id');
  const url = `${IDENTITY_BASE}/tourists/${encodeURIComponent(id)}`;
  return handleFetch(url, { method: 'GET' });
}

/**
 * createTourist(payload)
 * - If payload includes password, this client will attempt to register auth on AUTH service first
 * - If you do not want that, omit `password` from the payload.
 */
export async function createTourist(payload) {
  // If payload includes password and we have an AUTH_BASE, attempt auth register first
  let authResp = null;
  try {
    if (payload && payload.password && AUTH_BASE) {
      const authUrl = `${AUTH_BASE}/auth/register`;
      const authPayload = {
        id: payload.tourist_id,
        password: payload.password,
        temporaryPassword: payload.temporaryPassword === undefined ? true : !!payload.temporaryPassword,
        email: payload.primary_email || payload.email || null,
        phone: payload.primary_phone || payload.phone || null,
        name: payload.full_name || payload.name || null
      };
      // Create auth user
      authResp = await handleFetch(authUrl, {
        method: 'POST',
        body: JSON.stringify(authPayload)
      });
    }

    // Now create identity (do not include raw password in identity payload)
    const identityPayload = { ...payload };
    delete identityPayload.password;
    delete identityPayload.temporaryPassword;

    const url = `${IDENTITY_BASE}/tourists`;
    const idResp = await handleFetch(url, {
      method: 'POST',
      body: JSON.stringify(identityPayload)
    });

    // return combined info but keep backward-compatible return: return identity if caller expects only identity
    return { auth: authResp, identity: idResp };
  } catch (err) {
    // If auth was created but identity failed, attempt rollback of auth user (best-effort)
    if (authResp && payload?.tourist_id) {
      try {
        console.warn('[identityService] Identity create failed — attempting rollback of auth user', payload.tourist_id);
        // best-effort delete endpoint (requires admin secret or proper auth)
        // If your auth-service requires admin header, set it in .env and include here (not recommended to expose publicly)
        const deleteUrl = `${AUTH_BASE}/auth/users/${encodeURIComponent(payload.tourist_id)}`;
        // Try delete without admin header; server may accept x-admin-secret as query or header
        await handleFetch(deleteUrl, { method: 'DELETE' }).catch(e => console.warn('rollback delete failed', e));
      } catch (rbErr) {
        console.warn('rollback failed', rbErr);
      }
    }
    throw err;
  }
}

export async function issueCredential(id) {
  if (!id) throw new Error('issueCredential requires id');
  const url = `${IDENTITY_BASE}/tourists/${encodeURIComponent(id)}/issue`;
  return handleFetch(url, { method: 'POST' });
}

export default { listTourists, getTourist, createTourist, issueCredential };