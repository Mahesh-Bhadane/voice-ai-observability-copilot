const base = typeof __BACKEND_URL__ !== 'undefined' ? __BACKEND_URL__ : '';

export function apiFetch(path, options) {
  return fetch(`${base}${path}`, options);
}
