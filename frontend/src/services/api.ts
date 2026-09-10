const BASE_URL = import.meta.env.VITE_API_URL || '';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Universal fetch wrapper with auto Authorization injection and JWT refresh rotation.
 */
export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject Bearer token
  if (!options.skipAuth) {
    const token = localStorage.getItem('pm_access_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const config: RequestInit = {
    ...options,
    headers
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (err: any) {
    if (!BASE_URL) {
      throw new Error('Backend URL (VITE_API_URL) is not configured in Vercel. Please add VITE_API_URL in Vercel Settings and Redeploy.');
    }
    throw new Error(`Cannot reach backend at ${BASE_URL}. If hosted on Render free-tier, the server may be waking from cold sleep (~45s). Please wait a few seconds and try again.`);
  }

  // If 401 and not an auth route, attempt token refresh
  if (response.status === 401 && !endpoint.startsWith('/api/auth/login') && !endpoint.startsWith('/api/auth/refresh')) {
    const refreshToken = localStorage.getItem('pm_refresh_token');

    if (!refreshToken) {
      localStorage.removeItem('pm_access_token');
      localStorage.removeItem('pm_refresh_token');
      localStorage.removeItem('pm_user');
      let errBody: any;
      try {
        errBody = await response.json();
      } catch (_) {}
      throw new Error(errBody?.error || 'Authentication required. Please log in.');
    }

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newAccessToken = refreshData.data.accessToken;
          const newRefreshToken = refreshData.data.refreshToken;

          localStorage.setItem('pm_access_token', newAccessToken);
          localStorage.setItem('pm_refresh_token', newRefreshToken);

          isRefreshing = false;
          onRefreshed(newAccessToken);

          // Retry initial request
          headers.set('Authorization', `Bearer ${newAccessToken}`);
          return (await fetch(url, { ...options, headers })).json();
        } else {
          // Token expired or invalid
          localStorage.removeItem('pm_access_token');
          localStorage.removeItem('pm_refresh_token');
          localStorage.removeItem('pm_user');
          isRefreshing = false;
        }
      } catch (err) {
        isRefreshing = false;
      }
    } else {
      // Wait for ongoing refresh
      return new Promise((resolve) => {
        subscribeTokenRefresh(async (newToken) => {
          headers.set('Authorization', `Bearer ${newToken}`);
          const retryRes = await fetch(url, { ...options, headers });
          resolve(retryRes.json());
        });
      });
    }
  }

  let data: any;
  try {
    data = await response.json();
  } catch (err) {
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }
    throw new Error('Unexpected non-JSON response from API');
  }

  if (!response.ok && !data?.success) {
    throw new Error(data?.error || `HTTP ${response.status} Request Failed`);
  }

  return data;
}
