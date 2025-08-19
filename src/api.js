// src/api.js — real backend version
const BASE = 'http://localhost:3000';

/* ------------------ Sessies (persistent via localStorage) ------------------ */
const SESSION_KEY = 'heart.session';
function saveSession(s){ localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function loadSession(){ try{ return JSON.parse(localStorage.getItem(SESSION_KEY) || '{}'); }catch{ return {}; } }
function clearSession(){ localStorage.removeItem(SESSION_KEY); }

/* ------------------ HTTP helper (stuurt cookies mee) ------------------ */
async function http(method, url, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include' // nodig voor express-session cookies
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + url, opts);
  if (!res.ok) {
    // probeer nette fout terug te geven
    let msg = 'Request failed';
    try { const t = await res.text(); msg = t || msg; } 
    catch (e) {
    void e;                
  }
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

/* ------------------ API ------------------ */
export const api = {
  /* -------- Auth -------- */
  async register(payload) {
    // payload: { email, username, password, [bio, gender, birthdate, location] }
    const res = await http('POST', '/register', payload);
    // backend geeft { userId }
    saveSession({ userId: res.userId, isLoggedIn: true, activePage: 'swipe' });
    return res;
  },

  async login(payload) {
    // payload: { email, password }
    const res = await http('POST', '/login', payload);
    // backend geeft { userId }
    saveSession({ userId: res.userId, isLoggedIn: true, is_admin: res.is_admin, activePage: 'swipe' });
    return res;
  },

  async logout() {
    try {
      await http('POST', '/logout');
    } catch (e) {
      void e; // negeer fout (bv. server was al down)
    }
    clearSession();
  },


  getSession() {
    return loadSession(); // { userId, isLoggedIn, activePage }
  },

  setActivePage(page) {
    const s = loadSession();
    saveSession({ ...s, activePage: page });
  },

  /* -------- Profiel -------- */
  async getMe(userId) {
    // Zorg dat backend dit endpoint heeft:
    // GET /me?userId=123  -> { id, email, username, bio, gender, birthdate, location, photo }
    return http('GET', `/me?userId=${encodeURIComponent(userId)}`);
  },

  async updateProfile(payload) {
    // payload: { userId, username?, bio?, gender?, birthdate?, location? }
    return http('PUT', '/update-profile', payload);
  },

  /* -------- Discovery / Swipe / Matches / Chat -------- */
  async getProfiles({ userId, gender, min_age, max_age }) {
    const q = new URLSearchParams({
      userId,
      ...(gender ? { gender } : {}),
      ...(min_age ? { min_age } : {}),
      ...(max_age ? { max_age } : {})
    }).toString();
    return http('GET', `/profiles?${q}`);
  },

  async swipe({ swiperId, targetId, direction }) {
    // direction: 'left' | 'right'
    return http('POST', '/swipe', { swiperId, targetId, direction });
  },

  async getMatches({ userId }) {
    const q = new URLSearchParams({ userId }).toString();
    return http('GET', `/matches?${q}`);
  },

  async getMessages({ matchId, userId }) {
    const q = new URLSearchParams({ matchId, userId }).toString();
    return http('GET', `/messages?${q}`);
  },

  async sendMessage({ matchId, senderId, content }) {
    return http('POST', `/messages`, { matchId, senderId, content });
  },

  async uploadPhoto(userId, file) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('userId', userId);
    const res = await fetch(`${BASE}/upload-photo`, {
      method: 'POST',
      body: fd,
      credentials: 'include' // voor sessie-cookie
      // Belangrijk: géén Content-Type header zelf zetten bij FormData!
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json(); // { url: '/images/....', filename, photoId }
  },

  // 🔐 ADMIN API

// ✅ Alle users ophalen
  async getAllUsers(adminId) {
  const res = await fetch(`${BASE}/admin/users?adminId=${adminId}`, {
    credentials: 'include'
  });
  return res.json();
},

// ✅ User verifiëren
  async verifyUser(userId) {
    const res = await fetch(`${BASE}/admin/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

// ✅ User bannen
  async banUser(userId) {
    const res = await fetch(`${BASE}/admin/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

// ✅ User verwijderen
  async deleteUser(userId) {
    const res = await fetch(`${BASE}/admin/user/${userId}`, {
      method: 'DELETE'
    });
    return res.json();
  },


  imgUrl(nameOrPath) {
    // helper om foto’s te tonen
    if (!nameOrPath) return '';
    if (nameOrPath.startsWith('http')) return nameOrPath;
    if (nameOrPath.startsWith('/images/')) return `${BASE}${nameOrPath}`;
    return `${BASE}/images/${nameOrPath}`;
  }
};