// ---- CONFIGURE THIS ----
// Paste the Web app URL you get after deploying the Apps Script (Code.gs).
const API_URL = 'https://script.google.com/macros/s/AKfycby5g5EEn5giO41JGNiGrjq-ldrAcemKkbluyisXnqzyryA8QvDMgSAxAVgjCLjY7RXk/exec';
// -------------------------

const SUBSCRIPTION_PRICE = 50;
const TILL_NUMBER = '6817863';


async function api(action, payload) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight
    body: JSON.stringify({ action, ...payload })
  });
  return res.json();
}

function saveSession(user) {
  localStorage.setItem('bc_user', JSON.stringify(user));
}
function getSession() {
  try { return JSON.parse(localStorage.getItem('bc_user')); } catch (e) { return null; }
}
function clearSession() {
  localStorage.removeItem('bc_user');
}
function requireLogin() {
  const u = getSession();
  if (!u) { window.location.href = 'login.html'; return null; }
  return u;
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderAccessStatus(el, access) {
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
      <a href="#" id="logoutLink">Log out (${u.name.split(' ')[0]})</a>
    `;
    document.getElementById('logoutLink').addEventListener('click', (e) => {
      e.preventDefault(); clearSession(); window.location.href = 'index.html';
    });
  } else {
    nav.innerHTML = `<a href="login.html">Log in</a><a href="register.html">Sign up</a>`;
  }
}

document.addEventListener('DOMContentLoaded', renderNav);
