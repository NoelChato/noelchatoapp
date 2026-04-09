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
  const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement | null;
  if (info) {
    if (currentUser) {
      info.textContent = `Logged in as ${currentUser.username} (${currentUser.role})`;
      if (logoutBtn) logoutBtn.style.display = '';
    } else {
      info.textContent = '';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }
}

// handle logout button click
const logoutBtn = document.getElementById('logout-btn');
logoutBtn?.addEventListener('click', () => {
  currentUser = null;
  showSection('app-section', false);
  showSection('login-section', true);
  renderUserInfo();
});

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

// panel switching for sidebar
function showPanel(panelId: string) {
  document.querySelectorAll('#main-content .panel').forEach((p) => {
    (p as HTMLElement).style.display = 'none';
  });
  const panel = document.getElementById(panelId) as HTMLElement;
  if (panel) {
    panel.style.display = '';
  }
  // update active link
  document.querySelectorAll('#sidebar a').forEach((a) => {
    if ((a as HTMLAnchorElement).dataset.panel === panelId) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}

document.querySelectorAll('#sidebar a').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = (e.currentTarget as HTMLAnchorElement).dataset.panel;
    if (target) showPanel(target);
  });
});

// default panel when entering app
function goToDashboard() {
  showPanel('panel-register');
}


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
      goToDashboard();
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

// reports
const reportForm = document.getElementById('report-form') as HTMLFormElement;
const reportFrom = document.getElementById('report-from') as HTMLInputElement;
const reportTo = document.getElementById('report-to') as HTMLInputElement;
const reportStatus = document.getElementById('report-status') as HTMLSelectElement;
const reportSearch = document.getElementById('report-search') as HTMLInputElement;
const reportTableBody = document.querySelector('#report-table tbody') as HTMLElement;
const reportLoading = document.getElementById('report-loading') as HTMLElement;
const reportEmpty = document.getElementById('report-empty') as HTMLElement;
const exportExcelBtn = document.getElementById('export-excel-btn') as HTMLElement;
const exportPdfBtn = document.getElementById('export-pdf-btn') as HTMLElement;
const exportPrintBtn = document.getElementById('export-print-btn') as HTMLElement;
const reportPrevBtn = document.getElementById('report-prev-btn') as HTMLElement;
const reportNextBtn = document.getElementById('report-next-btn') as HTMLElement;
const reportPageInfo = document.getElementById('report-page-info') as HTMLElement;

let reportRows: any[] = [];
let reportPage = 1;
const reportPageSize = 8;
let reportSortKey = 'name';
let reportSortDirection = 1;

function getReportFilterParams() {
  const params = new URLSearchParams();
  if (reportFrom?.value) params.set('from', reportFrom.value);
  if (reportTo?.value) params.set('to', reportTo.value);
  if (reportStatus?.value) params.set('status', reportStatus.value);
  return params.toString();
}

function getFilteredReports() {
  const searchValue = reportSearch?.value.trim().toLowerCase() || '';
  return reportRows.filter((row) => {
    if (!searchValue) return true;
    return (
      row.name.toLowerCase().includes(searchValue) ||
      row.purpose.toLowerCase().includes(searchValue)
    );
  });
}

function sortReportRows(rows: any[]) {
  return rows.slice().sort((a, b) => {
    const valueA = a[reportSortKey] || '';
    const valueB = b[reportSortKey] || '';
    if (valueA < valueB) return -1 * reportSortDirection;
    if (valueA > valueB) return 1 * reportSortDirection;
    return 0;
  });
}

function renderReportTable() {
  if (!reportTableBody || !reportEmpty || !reportPageInfo) return;

  const rows = sortReportRows(getFilteredReports());
  const totalPages = Math.max(1, Math.ceil(rows.length / reportPageSize));
  if (reportPage > totalPages) reportPage = totalPages;

  const start = (reportPage - 1) * reportPageSize;
  const visibleRows = rows.slice(start, start + reportPageSize);

  reportTableBody.innerHTML = '';

  if (!visibleRows.length) {
    reportEmpty.style.display = 'block';
  } else {
    reportEmpty.style.display = 'none';
    visibleRows.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.name}</td>
        <td>${row.purpose}</td>
        <td>${row.timeIn}</td>
        <td>${row.timeOut}</td>
        <td>${row.duration}</td>
        <td>${row.status}</td>
      `;
      reportTableBody.appendChild(tr);
    });
  }

  reportPageInfo.textContent = `Page ${reportPage} of ${totalPages}`;
  if (reportPrevBtn) (reportPrevBtn as HTMLButtonElement).disabled = reportPage <= 1;
  if (reportNextBtn) (reportNextBtn as HTMLButtonElement).disabled = reportPage >= totalPages;
}

async function loadReports() {
  if (!reportLoading || !reportEmpty || !reportTableBody) return;

  reportLoading.style.display = 'block';
  reportEmpty.style.display = 'none';
  reportTableBody.innerHTML = '';

  try {
    const query = getReportFilterParams();
    const url = `/api/reports${query ? `?${query}` : ''}`;
    const data = await api(url);
    reportRows = Array.isArray(data) ? data : [];
    reportPage = 1;
    renderReportTable();
  } catch (error) {
    reportEmpty.textContent = 'Unable to load report data.';
    reportEmpty.style.display = 'block';
  } finally {
    reportLoading.style.display = 'none';
  }
}

function getReportExportRows() {
  return getFilteredReports().map((row) => ({
    'Visitor Name': row.name,
    Purpose: row.purpose,
    'Time In': row.timeIn,
    'Time Out': row.timeOut,
    Duration: row.duration,
    Status: row.status,
    Date: row.date,
  }));
}

function exportReportsToExcel() {
  const xlsx = (window as any).XLSX;
  if (!xlsx) {
    alert('Excel export is unavailable.');
    return;
  }

  const sheet = xlsx.utils.json_to_sheet(getReportExportRows());
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, sheet, 'Visitor Reports');
  xlsx.writeFile(workbook, `visitor-reports-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function exportReportsToPdf() {
  const jspdfLib = (window as any).jspdf;
  const jsPDF = jspdfLib?.jsPDF;
  if (!jsPDF) {
    alert('PDF export is unavailable.');
    return;
  }

  const doc = new jsPDF();
  if (typeof (doc as any).autoTable !== 'function') {
    alert('PDF export is unavailable.');
    return;
  }
  const rows = getFilteredReports().map((row) => [
    row.name,
    row.purpose,
    row.timeIn,
    row.timeOut,
    row.duration,
    row.status,
  ]);

  doc.setFontSize(14);
  doc.text('Visitor Reports', 14, 20);
  doc.autoTable({
    head: [['Visitor Name', 'Purpose', 'Time In', 'Time Out', 'Duration', 'Status']],
    body: rows,
    startY: 28,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [74, 144, 226] },
  });
  doc.save(`visitor-reports-${new Date().toISOString().slice(0, 10)}.pdf`);
}

function exportReportsToPrint() {
  window.print();
}

reportForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  await loadReports();
});

reportSearch?.addEventListener('input', () => {
  reportPage = 1;
  renderReportTable();
});

reportPrevBtn?.addEventListener('click', () => {
  if (reportPage > 1) {
    reportPage -= 1;
    renderReportTable();
  }
});

reportNextBtn?.addEventListener('click', () => {
  reportPage += 1;
  renderReportTable();
});

exportExcelBtn?.addEventListener('click', exportReportsToExcel);
exportPdfBtn?.addEventListener('click', exportReportsToPdf);
exportPrintBtn?.addEventListener('click', exportReportsToPrint);

document.querySelectorAll('#report-table th.sortable').forEach((th) => {
  th.addEventListener('click', () => {
    const key = th.getAttribute('data-sort-key');
    if (!key) return;
    if (reportSortKey === key) {
      reportSortDirection *= -1;
    } else {
      reportSortKey = key;
      reportSortDirection = 1;
    }
    renderReportTable();
  });
});
