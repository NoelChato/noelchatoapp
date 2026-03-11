"use strict";

// visitor logbook front-end logic

document.addEventListener("DOMContentLoaded", () => {

let currentUser = null;

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
    if (info && currentUser) {
        info.textContent = `Logged in as ${currentUser.username} (${currentUser.role})`;
    }
}

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

        });

    });

}


/* ---------- FIX FOR SIGNUP / LOGIN CLICK ---------- */

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

/* -------------------------------------------------- */


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

        } else {

            alert('Login failed');

        }

    } catch {

        alert('Login error');

    }

});
}

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

});
}

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

});