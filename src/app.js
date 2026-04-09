"use strict";

document.addEventListener("DOMContentLoaded", () => {

let currentUser = null;

/* ---------------- API ---------------- */

async function api(path, options = {}) {
    const res = await fetch(path, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        ...options,
    });
    return res.json();
}

function showSection(id, show) {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? '' : 'none';
}

function renderUserInfo() {
const info = document.getElementById('user-info');
const name = document.getElementById('profile-name');
const logoutBtn = document.getElementById('logout-btn');


if (currentUser) {

    const icon = currentUser.role === 'admin'
        ? 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
        : 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

    if (info) {
        info.innerHTML =
            '<span style="display:flex;align-items:center;gap:6px;">' +
            '<img src="' + icon + '" style="width:18px;height:18px;border-radius:50%;">' +
            ' Logged in as ' + currentUser.username + ' (' + currentUser.role + ')' +
            '</span>';
    }

    if (name) name.textContent = currentUser.username;

    if (logoutBtn) {
        logoutBtn.style.display = 'inline-block';

        // ✅ FIX: attach click HERE (no errors)
        logoutBtn.onclick = function () {

            currentUser = null;

            showSection('app-section', false);
            showSection('login-section', true);

            renderUserInfo();
        };
    }

} else {
    if (info) info.innerHTML = '';
    if (name) name.textContent = 'User';

    if (logoutBtn) {
        logoutBtn.style.display = 'none';
    }
}


}



/* ---------------- LOAD VISITORS ---------------- */

async function loadVisitors(filter = {}) {

let url = '/api/visitors';
const params = new URLSearchParams();

if (filter.name) params.set('name', filter.name);
if (filter.date) params.set('date', filter.date);

if ([...params].length) url += '?' + params.toString();

const visitors = await api(url);

const tbody = document.querySelector('#visitor-table tbody');
if (!tbody) return;

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
<td>
${v.timeOut ? '' : `<button data-id="${v.id}" class="checkout">Time-out</button>`}
</td>
`;

tbody.appendChild(tr);

});


document.querySelectorAll('.checkout').forEach((btn) => {

btn.addEventListener('click', async (e) => {

const id = e.currentTarget.getAttribute('data-id');
if (!id) return;

const now = new Date();
const t = now.toTimeString().slice(0,5);

await api(`/api/visitors/${id}/timeout`, {
method: 'PUT',
body: JSON.stringify({ timeOut: t }),
});

loadVisitors(filter);
loadDashboard();

});

});

}



/* ---------------- DASHBOARD ---------------- */

async function loadDashboard(){

const visitors = await api('/api/visitors');

let today = new Date().toISOString().split("T")[0];

let todayCount = 0;
let inside = 0;
let out = 0;

visitors.forEach(v => {

if(v.date === today) todayCount++;

if(!v.timeOut) inside++;
else out++;

});

const statToday = document.getElementById("stat-today");
const statInside = document.getElementById("stat-inside");
const statOut = document.getElementById("stat-out");
const statTotal = document.getElementById("stat-total");

if(statToday) statToday.textContent = todayCount;
if(statInside) statInside.textContent = inside;
if(statOut) statOut.textContent = out;
if(statTotal) statTotal.textContent = visitors.length;


/* -------- Recent Visitors -------- */

const recentTable = document.getElementById("recent-visitors");

if(recentTable){

recentTable.innerHTML = "";

visitors.slice(-5).reverse().forEach(v => {

let status = v.timeOut
? '<span class="badge red">Out</span>'
: '<span class="badge green">Inside</span>';

recentTable.innerHTML += `
<tr>
<td>${v.name}</td>
<td>${status}</td>
</tr>
`;

});

}


/* -------- Chart -------- */

const ctx = document.getElementById("visitorChart");

if(ctx){

new Chart(ctx,{
type:'line',
data:{
labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
datasets:[{
label:'Visitors',
data:[5,8,6,10,12,7,9],
fill:true,
tension:0.3
}]
}
});

}

}



/* ---------- SIGNUP / LOGIN LINK ---------- */

const showLoginLink = document.getElementById('show-login');
const showSignupLink = document.getElementById('show-signup');

if(showSignupLink){
showSignupLink.style.cursor = "pointer";
showSignupLink.addEventListener('click', function(e){
e.preventDefault();
showSection('login-section', false);
showSection('signup-section', true);
});
}

if(showLoginLink){
showLoginLink.style.cursor = "pointer";
showLoginLink.addEventListener('click', function(e){
e.preventDefault();
showSection('signup-section', false);
showSection('login-section', true);
});
}



/* ---------- LOGIN ---------- */

const loginForm = document.getElementById('login-form');

if(loginForm){

loginForm.addEventListener('submit', async (e) => {

e.preventDefault();

const u = document.getElementById('login-username').value;
const p = document.getElementById('login-password').value;

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
loadDashboard();


const panels = document.querySelectorAll(".panel");
panels.forEach(panel => panel.style.display = "none");

const defaultPanel = document.getElementById("panel-dashboard");
if(defaultPanel) defaultPanel.style.display = "block";

} else {

alert('Login failed');

}

} catch {

alert('Login error');

}

});

}



/* ---------- SIGNUP ---------- */

const signupForm = document.getElementById('signup-form');

if(signupForm){

signupForm.addEventListener('submit', async (e) => {

e.preventDefault();

const u = document.getElementById('signup-username').value;
const p = document.getElementById('signup-password').value;
const r = document.getElementById('signup-role').value;

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

} catch {

alert('Sign up error');

}

});

}



/* ---------- VISITOR REGISTRATION ---------- */

const visitorForm = document.getElementById('visitor-form');

if(visitorForm){

visitorForm.addEventListener('submit', async (e) => {

e.preventDefault();

const body = {
name: document.getElementById('name').value,
address: document.getElementById('address').value,
contact: document.getElementById('contact').value,
purpose: document.getElementById('purpose').value,
personToVisit: document.getElementById('person').value,
date: document.getElementById('date').value,
timeIn: document.getElementById('timein').value,
};

await api('/api/visitors', { method: 'POST', body: JSON.stringify(body) });

visitorForm.reset();

loadVisitors();
loadDashboard();

});

}



/* ---------- SEARCH ---------- */

const searchForm = document.getElementById('search-form');

if(searchForm){

searchForm.addEventListener('submit', (e) => {

e.preventDefault();

const filter = {};

const name = document.getElementById('search-name').value;
const date = document.getElementById('search-date').value;

if (name) filter.name = name;
if (date) filter.date = date;

loadVisitors(filter);

});

}



/* ---------- REPORTS ---------- */
const reportForm = document.getElementById('report-form');
const reportFrom = document.getElementById('report-from');
const reportTo = document.getElementById('report-to');
const reportStatus = document.getElementById('report-status');
const reportSearch = document.getElementById('report-search');
const reportTableBody = document.querySelector('#report-table tbody');
const reportLoading = document.getElementById('report-loading');
const reportEmpty = document.getElementById('report-empty');
const exportExcelBtn = document.getElementById('export-excel-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const exportPrintBtn = document.getElementById('export-print-btn');
const reportPrevBtn = document.getElementById('report-prev-btn');
const reportNextBtn = document.getElementById('report-next-btn');
const reportPageInfo = document.getElementById('report-page-info');

let reportRows = [];
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

function sortReportRows(rows) {
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
  if (reportPrevBtn) reportPrevBtn.disabled = reportPage <= 1;
  if (reportNextBtn) reportNextBtn.disabled = reportPage >= totalPages;
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
  if (!window.XLSX) {
    alert('Excel export is unavailable.');
    return;
  }

  const sheet = XLSX.utils.json_to_sheet(getReportExportRows());
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Visitor Reports');
  XLSX.writeFile(workbook, `visitor-reports-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function exportReportsToPdf() {
  const jsPDF = window.jspdf?.jsPDF;
  if (!jsPDF) {
    alert('PDF export is unavailable.');
    return;
  }

  const doc = new jsPDF();
  if (typeof doc.autoTable !== 'function') {
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


/* ---------- SIDEBAR NAVIGATION ---------- */

const sidebarLinks = document.querySelectorAll("#sidebar a[data-panel]");
const panels = document.querySelectorAll(".panel");

sidebarLinks.forEach(link => {

link.addEventListener("click", (e) => {

e.preventDefault();

const targetPanelId = link.getAttribute("data-panel");

panels.forEach(panel => panel.style.display = "none");

const targetPanel = document.getElementById(targetPanelId);
if (targetPanel) targetPanel.style.display = "block";
if (targetPanelId === 'panel-reports') {
  loadReports();
}

});

});

});