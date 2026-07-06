// =====================================================================
// CONFIGURE THIS: paste the Web app URL from your Apps Script deployment.
// It must look like: https://script.google.com/macros/s/AKfycb.../exec
// =====================================================================
const API_URL = 'https://script.google.com/macros/s/AKfycby5g5EEn5giO41JGNiGrjq-ldrAcemKkbluyisXnqzyryA8QvDMgSAxAVgjCLjY7RXk/exec';

const SUBSCRIPTION_PRICE = 50;
const TILL_NUMBER = '6817863';

// ---------------------------------------------------------------------
// Core API call — every page uses this to talk to the Apps Script backend.
// ---------------------------------------------------------------------
async function api(action, payload) {
  if (!API_URL || API_URL.indexOf('PASTE_YOUR') === 0) {
    const msg = 'Setup needed: API_URL in assets/app.js is still the placeholder text. ' +
      'Paste your deployed Apps Script Web app URL there (see README Part 3).';
    console.error(msg);
    showGlobalError(msg);
    return { ok: false, error: msg };
  }

  let res;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight
      body: JSON.stringify({ action, ...payload })
    });
  } catch (err) {
    const msg = 'Could not reach the server. Check your internet connection, ' +
      'or that API_URL in app.js is correct and the Apps Script is deployed with ' +
      '"Who has access: Anyone".';
    console.error(msg, err);
    showGlobalError(msg);
    return { ok: false, error: msg };
  }

  if (!res.ok) {
    const msg = `Server responded with an error (HTTP ${res.status}). ` +
      'Make sure the Apps Script is deployed as a Web app with access set to "Anyone".';
    console.error(msg);
    showGlobalError(msg);
    return { ok: false, error: msg };
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    const msg = 'The server sent back something that was not valid JSON. ' +
      'Open your Apps Script deployment URL directly in a new tab to check for errors.';
    console.error(msg, err);
    showGlobalError(msg);
    return { ok: false, error: msg };
  }

  return data;
}

// Shows a small dismissible banner at the top of the page for setup/connection
// errors, so they're visible even on pages that don't have their own <div id="msg">.
function showGlobalError(message) {
  let banner = document.getElementById('globalErrorBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'globalErrorBanner';
    banner.style.cssText = 'position:sticky;top:0;z-index:9999;background:#B4483A;' +
      'color:#fff;padding:12px 20px;font-family:sans-serif;font-size:14px;';
    document.body.prepend(banner);
  }
  banner.textContent = message;
}

// ---------------------------------------------------------------------
// Session helpers (stored in the browser only — not sent anywhere else)
// ---------------------------------------------------------------------
function saveSession(user) {
  localStorage.setItem('bc_user', JSON.stringify(user));
}
function getSession() {
  try {
    return JSON.parse(localStorage.getItem('bc_user'));
  } catch (e) {
    return null;
  }
}
function clearSession() {
  localStorage.removeItem('bc_user');
}
function requireLogin() {
  const u = getSession();
  if (!u) {
    window.location.href = 'login.html';
    return null;
  }
  return u;
}

// ---------------------------------------------------------------------
// Small display helpers used across pages
// ---------------------------------------------------------------------
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderAccessStatus(el, access) {
  if (!el) return;
  if (!access) { el.innerHTML = ''; return; }
  if (access.allowed) {
    const label = access.reason === 'trial' ? 'Free trial active' : 'Subscription active';
    el.innerHTML = `<span class="status-dot"></span> ${label} — until ${formatDate(access.until)}`;
  } else {
    el.innerHTML = `<span class="status-dot expired"></span> Access expired — pay ${SUBSCRIPTION_PRICE} KES to continue reading`;
  }
}

function renderNav() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  const u = getSession();
  if (u) {
    nav.innerHTML = `
      <a href="dashboard.html">Library</a>
      <a href="payment.html">Pay / renew</a>
      <a href="#" id="logoutLink">Log out (${(u.name || '').split(' ')[0]})</a>
    `;
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        clearSession();
        window.location.href = 'index.html';
      });
    }
  } else {
    nav.innerHTML = `<a href="login.html">Log in</a><a href="register.html">Sign up</a>`;
  }
}

document.addEventListener('DOMContentLoaded', renderNav);
