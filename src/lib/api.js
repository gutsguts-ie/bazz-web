// Same-origin: /api/* and /storage/* are proxied to the backend by the Next.js
// route handlers in src/app, so the real backend URL never reaches the browser.
const API_BASE_URL = '';

// ---- Token storage & lifecycle ----
const getToken = () => localStorage.getItem('token');
const setToken = (t) => localStorage.setItem('token', t);
const clearToken = () => localStorage.removeItem('token');

// Build headers; include bearer token when present.
const authHeaders = (extra = {}) => {
  const h = { Accept: 'application/json', ...extra };
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
};

// Central response handler: throws on !ok, auto-clears token on 401.
async function handle(response, fallbackMsg) {
  if (response.ok) return response.json();

  if (response.status === 401) {
    clearToken(); // let caller redirect to /login
  }

  // Rate limiting (preserved from the legacy status-by-code flow)
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const message = retryAfter
      ? `Too many requests. Please try again after ${retryAfter} seconds.`
      : 'Too many requests. Please try again in a minute.';
    const err = new Error(message);
    err.status = 429;
    err.response = response;
    throw err;
  }

  const data = await response.json().catch(() => ({}));
  const err = new Error(data.message || fallbackMsg);
  err.response = response;
  err.status = response.status;
  err.data = data; // exposes data.errors (422), data.code (403 frozen)
  if (data.code) err.code = data.code; // e.g. APPLICATION_FROZEN
  throw err;
}

export const api = {
  async submitContact(data) {
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || 'Failed to submit contact form');
      error.response = response;
      error.data = errorData;
      throw error;
    }

    return await response.json();
  },

  // ---- Applicant authentication ----
  async registerApplicant(payload) {
    const res = await fetch(`${API_BASE_URL}/api/applicant/register`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    const data = await handle(res, 'Failed to register');
    setToken(data.token);
    return data;
  },

  async loginApplicant({ username, password }) {
    const res = await fetch(`${API_BASE_URL}/api/applicant/login`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ username, password }),
    });
    const data = await handle(res, 'Failed to log in');
    setToken(data.token);
    return data;
  },

  async claimApplicant(payload) {
    // { application_code, password, email?, phone? }
    const res = await fetch(`${API_BASE_URL}/api/applicant/claim`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    const data = await handle(res, 'Failed to claim application');
    setToken(data.token);
    return data;
  },

  // Code-first entry: tells us whether a code exists and has a password yet.
  // Always 200; never returns the application itself. → { exists, has_password }
  async lookupApplicationCode(code) {
    const res = await fetch(
      `${API_BASE_URL}/api/applicant/lookup/${encodeURIComponent(code)}`,
      { headers: authHeaders() }
    );
    return handle(res, 'Failed to look up application code');
  },

  async me() {
    const res = await fetch(`${API_BASE_URL}/api/applicant/me`, {
      headers: authHeaders(),
    });
    return handle(res, 'Failed to load your application');
  },

  async logoutApplicant() {
    try {
      await fetch(`${API_BASE_URL}/api/applicant/logout`, {
        method: 'POST',
        headers: authHeaders(),
      });
    } finally {
      clearToken();
    }
  },

  isAuthenticated() {
    return !!getToken();
  },

  async submitApplication(data) {
    const formData = new FormData();

    // Add all form fields
    Object.keys(data).forEach(key => {
      if (key === 'idPhoto' && data[key] instanceof File) {
        formData.append('id_photo', data[key]);
      } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/application`, {
      method: 'POST',
      // FormData: let the browser set the multipart boundary — don't set Content-Type.
      headers: authHeaders(),
      body: formData,
    });

    return handle(response, 'Failed to submit application');
  },

  async getApplicationStatus(code) {
    const response = await fetch(`${API_BASE_URL}/api/application/${code}`, {
      method: 'GET',
      headers: authHeaders(),
    });

    if (!response.ok) {
      // 404 = not your application / not found (by design — don't reveal existence)
      if (response.status === 404) {
        throw new Error('Application not found');
      }
      return handle(response, 'Failed to fetch application status');
    }

    return await response.json();
  },

  async uploadDocument(code, file, documentId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_id', documentId);

    const response = await fetch(`${API_BASE_URL}/api/application/${code}/documents`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });

    return handle(response, 'Failed to upload document');
  },

  async getDocuments(code) {
    const response = await fetch(`${API_BASE_URL}/api/application/${code}/documents`, {
      method: 'GET',
      headers: authHeaders(),
    });

    return handle(response, 'Failed to fetch documents');
  },

  async deleteDocument(code, documentId) {
    const response = await fetch(`${API_BASE_URL}/api/application/${code}/documents/${documentId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    return handle(response, 'Failed to delete document');
  },

  // Catalogue of document types (was a second `getDocuments` that shadowed the
  // code-based one — renamed so both endpoints are reachable). Public endpoint.
  async getDocumentTypes(type = 'normal') {
    const url = type ? `${API_BASE_URL}/api/documents?type=${type}` : `${API_BASE_URL}/api/documents`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch documents' }));
      throw new Error(error.message || 'Failed to fetch documents');
    }

    return await response.json();
  },

  getDocumentPreviewUrl(code, documentId) {
    return `${API_BASE_URL}/api/application/${code}/documents/${documentId}/preview`;
  },

  // Fetch a protected document preview with the bearer token and return an
  // object URL usable as <img src> / <a href>. Caller must URL.revokeObjectURL.
  async getDocumentPreviewObjectUrl(code, documentId) {
    const res = await fetch(this.getDocumentPreviewUrl(code, documentId), {
      headers: authHeaders(),
    });
    if (!res.ok) {
      if (res.status === 401) clearToken();
      throw new Error('Failed to load document preview');
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },

  getIdPhotoUrl(photoPath) {
    return `${API_BASE_URL}/storage/${photoPath}`;
  },

  async getTncs() {
    const response = await fetch(`${API_BASE_URL}/api/tncs`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch terms and conditions' }));
      throw new Error(error.message || 'Failed to fetch terms and conditions');
    }
    return await response.json();
  },
};
