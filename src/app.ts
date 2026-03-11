// visitor logbook front‑end logic

interface Visitor {
  id: number;
  name: string;
  address: string;
  contact: string;
  purpose: string;
  personToVisit: string;
  date: string;
  timeIn: string;
  timeOut?: string;
}

let currentUser: { username: string; role: string } | null = null;

async function api(path: string, options: any = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...options,
  });
  return res.json();
}

function showSection(id: string, show: boolean) {
  const el = document.getElementById(id) as HTMLElement;
  el.style.display = show ? '' : 'none';
}

function renderUserInfo() {
  const info = document.getElementById('user-info');
  if (info && currentUser) {
    info.textContent = `Logged in as ${currentUser.username} (${currentUser.role})`;
  }
}

async function loadVisitors(filter: { name?: string; date?: string } = {}) {
  let url = '/api/visitors';
  const params = new URLSearchParams();
  if (filter.name) params.set('name', filter.name);
  if (filter.date) params.set('date', filter.date);
  if ([...params].length) url += '?' + params.toString();
  const visitors: Visitor[] = await api(url);
  const tbody = document.querySelector('#visitor-table tbody') as HTMLTableSectionElement;
  tbody.innerHTML = '';
  visitors.forEach((v) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${v.name}</td>
      <td>${v.address}</td>
      <td>${v.contact}</td>
      <td>${v.purpose}</td>
      <td>${v.personToVisit}</td>
      <td>${v.date}</td>
      <td>${v.timeIn}</td>
      <td>${v.timeOut || ''}</td>
      <td>$
        ${v.timeOut ? '' : `<button data-id="${v.id}" class="checkout">Time‑out</button>`}
      </td>
    `;
    tbody.appendChild(tr);
  });
  document.querySelectorAll('.checkout').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      if (!id) return;
      const now = new Date();
      const t = now.toTimeString().slice(0,5);
      await api(`/api/visitors/${id}/timeout`, {
        method: 'PUT',
        body: JSON.stringify({ timeOut: t }),
      });
      loadVisitors(filter);
    });
  });
}

// helpers for switching between login/sign‑up
const showLoginLink = document.getElementById('show-login');
const showSignupLink = document.getElementById('show-signup');
showSignupLink?.addEventListener('click', (e) => {
  e.preventDefault();
  showSection('login-section', false);
  showSection('signup-section', true);
});
showLoginLink?.addEventListener('click', (e) => {
  e.preventDefault();
  showSection('signup-section', false);
  showSection('login-section', true);
});

// login
const loginForm = document.getElementById('login-form') as HTMLFormElement;
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const u = (document.getElementById('login-username') as HTMLInputElement).value;
  const p = (document.getElementById('login-password') as HTMLInputElement).value;
  try {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: u, password: p }),
    });
    if (res.success) {
      currentUser = res.user;
      showSection('login-section', false);
      showSection('app-section', true);
      renderUserInfo();
      loadVisitors();
    } else {
      alert('Login failed');
    }
  } catch (err) {
    alert('Login error');
  }
});

// signup
const signupForm = document.getElementById('signup-form') as HTMLFormElement;
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const u = (document.getElementById('signup-username') as HTMLInputElement).value;
  const p = (document.getElementById('signup-password') as HTMLInputElement).value;
  const r = (document.getElementById('signup-role') as HTMLSelectElement).value;
  try {
    const res = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: u, password: p, role: r }),
    });
    if (res.success) {
      alert('Account created, please log in');
      showSection('signup-section', false);
      showSection('login-section', true);
    } else {
      alert('Sign up failed');
    }
  } catch (err) {
    alert('Sign up error');
  }
});

// register visitor
const visitorForm = document.getElementById('visitor-form') as HTMLFormElement;
visitorForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const body: any = {
    name: (document.getElementById('name') as HTMLInputElement).value,
    address: (document.getElementById('address') as HTMLInputElement).value,
    contact: (document.getElementById('contact') as HTMLInputElement).value,
    purpose: (document.getElementById('purpose') as HTMLInputElement).value,
    personToVisit: (document.getElementById('person') as HTMLInputElement).value,
    date: (document.getElementById('date') as HTMLInputElement).value,
    timeIn: (document.getElementById('timein') as HTMLInputElement).value,
  };
  await api('/api/visitors', { method: 'POST', body: JSON.stringify(body) });
  visitorForm.reset();
  loadVisitors();
});

// search
const searchForm = document.getElementById('search-form') as HTMLFormElement;
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const filter: any = {};
  const name = (document.getElementById('search-name') as HTMLInputElement).value;
  const date = (document.getElementById('search-date') as HTMLInputElement).value;
  if (name) filter.name = name;
  if (date) filter.date = date;
  loadVisitors(filter);
});
