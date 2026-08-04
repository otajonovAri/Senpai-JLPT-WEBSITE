const BASE_URL = import.meta.env.VITE_API_URL || 'https://your-domain.com/api';

/** @type {string | null} */
let accessToken = localStorage.getItem('accessToken');
/** @type {string | null} */
let refreshToken = localStorage.getItem('refreshToken');
let isRefreshing = false;
/** @type {((token: string | null) => void)[]} */
let refreshQueue = [];

/**
 * API xatosi — HTTP status va server validatsiya xatolarini olib yuradi.
 * `Error`ning vorisi, shuning uchun mavjud `err.message` ishlatishlari o'zgarmaydi.
 */
export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} [status] HTTP status kodi
   * @param {unknown} [errors] Middleware qaytargan validatsiya xatolari
   */
  constructor(message, status, errors) {
    super(message);
    this.name = 'ApiError';
    /** @type {number | undefined} */
    this.status = status;
    /** @type {unknown} */
    this.errors = errors;
  }
}

/**
 * @param {string | null} access
 * @param {string | null} refresh
 * @returns {void}
 */
export function setTokens(access, refresh) {
  accessToken = access;
  refreshToken = refresh;
  if (access) localStorage.setItem('accessToken', access);
  else localStorage.removeItem('accessToken');
  if (refresh) localStorage.setItem('refreshToken', refresh);
  else localStorage.removeItem('refreshToken');
}

/** @returns {string | null} */
export function getAccessToken() {
  return accessToken;
}

/** @returns {void} */
export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

/**
 * Access token'ni yangilaydi. Muvaffaqiyatsiz bo'lsa sessiyani tozalab /login'ga yuboradi.
 * @returns {Promise<string>} Yangi access token
 */
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

/**
 * @typedef {object} ApiOptions
 * @property {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} [method='GET']
 * @property {unknown} [body] JSON body (yoki multipart bo'lsa FormData)
 * @property {boolean} [auth=true] Authorization sarlavhasini qo'shish
 * @property {boolean} [multipart=false] FormData yuborish (Content-Type qo'yilmaydi)
 */

/**
 * Backend'ga so'rov yuboradi: token qo'shadi, 401'da bir marta refresh qilib qayta uradi,
 * 429'da global overlay hodisasini chiqaradi va javob konvertini (`{data}`) ochadi.
 *
 * @param {string} path `/vocabulary?page=1` kabi BASE_URL'dan keyingi yo'l
 * @param {ApiOptions} [options]
 * @returns {Promise<any>} Javob `data` maydoni (204 bo'lsa null)
 * @throws {ApiError} 4xx/5xx javoblarda
 */
export async function api(path, options = {}) {
  const { method = 'GET', body, auth = true, multipart = false } = options;

  /** @type {Record<string, string>} */
  const headers = {};
  if (!multipart) headers['Content-Type'] = 'application/json';
  if (auth && accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  /** @type {RequestInit} */
  const config = { method, headers };
  if (body) {
    config.body = multipart ? /** @type {FormData} */ (body) : JSON.stringify(body);
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
    const retryAfter = parseInt(res.headers.get('Retry-After') || '', 10) || 60;
    window.dispatchEvent(new CustomEvent('api:rate-limit', { detail: { retryAfter } }));
    throw new ApiError("Juda ko'p so'rov. Biroz kutib turing.", 429);
  }

  // 429/5xx javoblarida body bo'sh bo'lishi mumkin — JSON parse xatosini yutamiz
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(json.message || `API error ${res.status}`, res.status, json.errors);
  }

  return json.data !== undefined ? json.data : json;
}
