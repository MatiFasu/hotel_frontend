/**
 * Servicio centralizado de API y cliente HTTP para el frontend.
 * Gestiona la inclusión automática de headers 'Authorization: Bearer <token>'
 * para todas las peticiones hacia la API protegida por Spring Security.
 */

export function getAuthToken() {
  try {
    const sesionStr = sessionStorage.getItem('hackacode_sesion');
    if (!sesionStr) return null;
    const sesion = JSON.parse(sesionStr);
    return sesion?.token || null;
  } catch (_) {
    return null;
  }
}

export function setupAuthInterceptor() {
  if (window.__hackacode_interceptor_installed) return;
  window.__hackacode_interceptor_installed = true;

  const originalFetch = window.fetch;
  window.fetch = async (input, init = {}) => {
    let url = typeof input === 'string' ? input : input?.url || '';

    // Si la llamada va a /api/ y no es el endpoint de login
    if (url.startsWith('/api/') && !url.includes('/api/auth/login')) {
      const token = getAuthToken();
      if (token) {
        const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : {}));
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        init = { ...init, headers };
      }
    }

    const response = await originalFetch(input, init);

    // Si el backend devuelve 401 en un endpoint protegido, emitir evento para expiración de sesión
    if (response.status === 401 && url.startsWith('/api/') && !url.includes('/api/auth/login')) {
      window.dispatchEvent(new CustomEvent('hackacode:unauthorized'));
    }

    return response;
  };
}

export async function apiFetch(url, options = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    options.body = JSON.stringify(options.body);
  }

  return fetch(url, { ...options, headers });
}
