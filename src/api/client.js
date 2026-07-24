const BASE_URL = import.meta.env.VITE_API_URL || 'https://your-domain.com/api';

let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');
let isRefreshing = false;
let refreshQueue = [];

export function setTokens(access, refresh) {
  accessToken = access;
  refreshToken = refresh;
  if (access) localStorage.setItem('accessToken', access);
  else localStorage.removeItem('accessToken');
  if (refresh) localStorage.setItem('refreshToken', refresh);
  else localStorage.removeItem('refreshToken');
}

export function getAccessToken() {
  return accessToken;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

async function refreshAccessToken() {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, refreshToken }),
  });
  if (!res.ok) {
    clearTokens();
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  const json = await res.json();
  const data = json.data || json;
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

export async function api(path, options = {}) {
  const { method = 'GET', body, auth = true, multipart = false } = options;

  const headers = {};
  if (!multipart) headers['Content-Type'] = 'application/json';
  if (auth && accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const config = { method, headers };
  if (body) {
    config.body = multipart ? body : JSON.stringify(body);
  }

  let res = await fetch(`${BASE_URL}${path}`, config);

  if (res.status === 401 && auth && refreshToken) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        refreshQueue.forEach(cb => cb(newToken));
        refreshQueue = [];
      } catch (err) {
        isRefreshing = false;
        refreshQueue.forEach(cb => cb(null));
        refreshQueue = [];
        throw err;
      }
    } else {
      const newToken = await new Promise(resolve => refreshQueue.push(resolve));
      if (!newToken) throw new Error('Session expired');
    }

    headers['Authorization'] = `Bearer ${accessToken}`;
    res = await fetch(`${BASE_URL}${path}`, { method, headers, body: config.body });
  }

  if (res.status === 204) return null;

  // 429 — global "Juda ko'p so'rov" sahifasini ochamiz (RateLimitOverlay tinglaydi)
  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get('Retry-After'), 10) || 60;
    window.dispatchEvent(new CustomEvent('api:rate-limit', { detail: { retryAfter } }));
    const error = new Error("Juda ko'p so'rov. Biroz kutib turing.");
    error.status = 429;
    throw error;
  }

  // 429/5xx javoblarida body bo'sh bo'lishi mumkin — JSON parse xatosini yutamiz
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(json.message || `API error ${res.status}`);
    error.status = res.status;
    error.errors = json.errors;
    throw error;
  }

  return json.data !== undefined ? json.data : json;
}
