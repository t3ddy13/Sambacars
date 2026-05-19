// =============================================
// sambacars - Frontend JavaScript
// =============================================

const API = '';

// =============================================
// STATE
// =============================================
// utilizador autenticado
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let carrinhoCount = 0;

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  initSession();
  initNavbar();
  initAuthModal();

  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'carros') initCarros();
  if (page === 'detalhe') initDetalhe();
  if (page === 'carrinho') initCarrinho();
  if (page === 'admin') initAdmin();
});

// =============================================
// SESSION
// =============================================
async function initSession() {
  try {
    const res = await fetch('/api/session');
    const data = await res.json();
    if (data.loggedIn) {
      currentUser = data.cliente;
      updateAuthUI();
      updateCartBadge();
    }
  } catch (e) {}
}

function updateAuthUI() {
  const loginBtn = document.getElementById('btn-login');
  const registerBtn = document.getElementById('btn-register');
  const clienteInfo = document.getElementById('cliente-info');
  const clienteName = document.getElementById('cliente-name-display');
  const adminLink = document.getElementById('nav-admin-link');
  const carrinhoIcon = document.getElementById('carrinho-icon-wrap');

  if (currentUser) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (clienteInfo) clienteInfo.style.display = 'flex';
    if (clienteName) clienteName.textContent = currentUser.name.split(' ')[0];
    if (carrinhoIcon) carrinhoIcon.style.display = 'flex';
    if (adminLink && currentUser.role === 'admin') adminLink.style.display = 'inline';
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (registerBtn) registerBtn.style.display = 'inline-flex';
    if (clienteInfo) clienteInfo.style.display = 'none';
    if (carrinhoIcon) carrinhoIcon.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
  }
}

async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  currentUser = null;
  updateAuthUI();
  showToast('Sessão terminada', 'Até breve!', 'info');
  setTimeout(() => window.location.href = '/', 1000);
}

async function updateCartBadge() {
  if (!currentUser) return;
  try {
    const res = await fetch('/api/carrinho');
    const data = await res.json();
    if (data.success) {
      carrinhoCount = data.items.length;
      const badge = document.getElementById('carrinho-badge');
      if (badge) {
        badge.textContent = carrinhoCount;
        badge.style.display = carrinhoCount > 0 ? 'flex' : 'none';
      }
    }
  } catch (e) {}
}

// =============================================
// NAVBAR
// =============================================
function initNavbar() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // Active link
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(l => {
    if (l.href === window.location.href || window.location.pathname === new URL(l.href).pathname) {
      l.classList.add('active');
    }
  });
}

// =============================================
// AUTH MODAL
// =============================================
function initAuthModal() {
  const overlay = document.getElementById('auth-overlay');
  const loginBtn = document.getElementById('btn-login');
  const registerBtn = document.getElementById('btn-register');
  const closeBtns = document.querySelectorAll('.close-auth');
  const tabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginBtn) loginBtn.addEventListener('click', () => openAuth('login'));
  if (registerBtn) registerBtn.addEventListener('click', () => openAuth('register'));

  closeBtns.forEach(b => b.addEventListener('click', closeAuth));
  if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeAuth(); });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const mode = tab.dataset.tab;
      if (loginForm) loginForm.style.display = mode === 'login' ? 'block' : 'none';
      if (registerForm) registerForm.style.display = mode === 'register' ? 'block' : 'none';
    });
  });

  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (registerForm) registerForm.addEventListener('submit', handleRegister);
}

function openAuth(mode = 'login') {
  const overlay = document.getElementById('auth-overlay');
  const tabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (!overlay) return;
  overlay.classList.add('open');
  tabs.forEach(t => {
    t.classList.toggle('active', t.dataset.tab === mode);
  });
  if (loginForm) loginForm.style.display = mode === 'login' ? 'block' : 'none';
  if (registerForm) registerForm.style.display = mode === 'register' ? 'block' : 'none';
}

function closeAuth() {
  const overlay = document.getElementById('auth-overlay');
  if (overlay) overlay.classList.remove('open');
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const btn = e.target.querySelector('button[type="submit"]');

  btn.disabled = true;
  btn.textContent = 'A entrar...';

  try {

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    btn.disabled = false;
    btn.textContent = 'Entrar';

    if (data.success && data.cliente) {

      // guardar utilizador
      currentUser = data.cliente;
      window.currentUser = data.cliente;

      // guardar sessão local
      localStorage.setItem(
        'currentUser',
        JSON.stringify(data.cliente)
      );

      closeAuth();

      updateAuthUI();
      updateCartBadge();

      showToast(
        'Bem-vindo!',
        `Olá, ${currentUser.name.split(' ')[0]}!`,
        'success'
      );

      // redirecionar admin
      if (currentUser.role === 'admin') {

        setTimeout(() => {
          window.location.href = '/admin.html';
        }, 800);

      }

    } else {

      showToast(
        'Erro',
        data.message || 'Email ou password inválidos',
        'error'
      );

    }

  } catch (err) {

    btn.disabled = false;
    btn.textContent = 'Entrar';

    showToast(
      'Erro',
      'Falha ao ligar ao servidor',
      'error'
    );

    console.error(err);

  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true; btn.textContent = 'A registar...';

  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  btn.disabled = false; btn.textContent = 'Criar Conta';

  if (data.success) {
    showToast('Conta criada!', 'Agora pode fazer login.', 'success');
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === 'login'));
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    document.getElementById('login-email').value = email;
  } else {
    showToast('Erro', data.message, 'error');
  }
}

// =============================================
// HOME PAGE
// =============================================
function initHome() {
  loadFeaturedCars();
}

async function loadFeaturedCars() {
  const grid = document.getElementById('featured-carros-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  const res = await fetch('/api/carros/featured');
  const data = await res.json();

  if (!data.success || !data.carros.length) {
    grid.innerHTML = '<div class="empty-state"><span class="ico">🚗</span><h3>Sem carros em destaque</h3><p>Adicione carros no painel admin.</p></div>';
    return;
  }

  grid.innerHTML = data.carros.map(car => carCardHTML(car)).join('');
}

// =============================================
// CARROS PAGE
// =============================================
function initCarros() {
  loadCarros();

  document.getElementById('btn-filtrar')?.addEventListener('click', loadCarros);
  document.getElementById('btn-limpar')?.addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-brand').value = '';
    document.getElementById('filter-fuel').value = '';
    document.getElementById('filter-transmission').value = '';
    document.getElementById('filter-min-price').value = '';
    document.getElementById('filter-max-price').value = '';
    loadCarros();
  });
}

async function loadCarros() {
  const grid = document.getElementById('carros-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  const params = new URLSearchParams();
  const search = document.getElementById('search-input')?.value;
  const brand = document.getElementById('filter-brand')?.value;
  const fuel = document.getElementById('filter-fuel')?.value;
  const transmission = document.getElementById('filter-transmission')?.value;
  const minPrice = document.getElementById('filter-min-price')?.value;
  const maxPrice = document.getElementById('filter-max-price')?.value;

  if (search) params.set('search', search);
  if (brand) params.set('brand', brand);
  if (fuel) params.set('fuel', fuel);
  if (transmission) params.set('transmission', transmission);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);

  const res = await fetch('/api/carros?' + params.toString());
  const data = await res.json();

  const countEl = document.getElementById('carros-count');
  if (countEl) countEl.textContent = data.carros ? `${data.carros.length} veículo(s) encontrado(s)` : '';

  if (!data.success || !data.carros.length) {
    grid.innerHTML = '<div class="empty-state"><span class="ico">🔍</span><h3>Nenhum carro encontrado</h3><p>Tente outros filtros de pesquisa.</p></div>';
    return;
  }

  grid.innerHTML = data.carros.map(car => carCardHTML(car)).join('');
}

// =============================================
// DETALHE PAGE
// =============================================
function initDetalhe() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { window.location.href = '/carros'; return; }
  loadCarDetalhe(id);
}

async function loadCarDetalhe(id) {
  const container = document.getElementById('detalhe-container');
  if (!container) return;
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  const res = await fetch(`/api/carros/${id}`);
  const data = await res.json();

  if (!data.success) {
    container.innerHTML = '<div class="empty-state"><span class="ico">❌</span><h3>Carro não encontrado</h3></div>';
    return;
  }

  const car = data.car;
  document.title = `${car.brand} ${car.model} - sambacars`;

  container.innerHTML = `
    <div class="detalhe-grid">
      <div>
        <div class="breadcrumb">
          <a href="/">Início</a>
          <span>›</span>
          <a href="/carros">Carros</a>
          <span>›</span>
          <span>${car.brand} ${car.model}</span>
        </div>
        <div class="detalhe-img-main">
          ${car.image
            ? `<img src="${car.image}" alt="${car.brand} ${car.model}">`
            : `<div class="car-img-placeholder"><span class="icon">🚗</span><p>${car.brand} ${car.model}</p></div>`}
        </div>
        <div style="margin-top:28px;">
          <h3 style="color:var(--white);font-size:1rem;font-weight:700;margin-bottom:12px;">Descrição</h3>
          <p style="color:var(--text-muted);line-height:1.8;font-size:0.93rem;">${car.description || 'Sem descrição disponível.'}</p>
        </div>
      </div>
      <div class="detalhe-info">
        <div class="detalhe-card">
          <div class="detalhe-brand">${car.brand}</div>
          <div class="detalhe-title">${car.model}</div>
          <div class="detalhe-year">${car.year} · ${car.color}</div>
          <div class="detalhe-price">${formatPrice(car.price)}</div>
          <div class="detalhe-specs">
            <div class="detalhe-spec">
              <div class="detalhe-spec-label">Quilometragem</div>
              <div class="detalhe-spec-value">${Number(car.mileage).toLocaleString()} km</div>
            </div>
            <div class="detalhe-spec">
              <div class="detalhe-spec-label">Combustível</div>
              <div class="detalhe-spec-value">${car.fuel}</div>
            </div>
            <div class="detalhe-spec">
              <div class="detalhe-spec-label">Transmissão</div>
              <div class="detalhe-spec-value">${car.transmission}</div>
            </div>
            <div class="detalhe-spec">
              <div class="detalhe-spec-label">Cor</div>
              <div class="detalhe-spec-value">${car.color}</div>
            </div>
          </div>
          <div style="margin-bottom:16px;">
            <span class="${car.available ? 'status-badge status-confirmado' : 'status-badge status-cancelado'}">
              ${car.available ? '✓ Disponível' : '✗ Vendido'}
            </span>
          </div>
          <div class="detalhe-actions">
            ${car.available ? `
              <button class="btn btn-primary btn-lg" onclick="addToCart(${car.id})">
                Adicionar ao Carrinho
              </button>
              <button class="btn btn-success btn-lg" onclick="buyNow(${car.id})">
                Comprar Agora
              </button>
            ` : '<button class="btn btn-outline btn-lg" disabled>Indisponível</button>'}
            <a href="/carros" class="btn btn-ghost">← Voltar aos Carros</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// =============================================
// CART
// =============================================
function initCarrinho() {
  loadCarrinho();
}

async function loadCarrinho() {
  const itemsEl = document.getElementById('carrinho-items');
  const summaryEl = document.getElementById('carrinho-summary-wrap');

  if (!currentUser) {
    if (itemsEl) itemsEl.innerHTML = `
      <div class="empty-state">
        <span class="ico">🔐</span>
        <h3>Login necessário</h3>
        <p>Faça login para ver o seu carrinho.</p>
        <button class="btn btn-primary" style="margin-top:16px;" onclick="openAuth('login')">Fazer Login</button>
      </div>`;
    return;
  }

  if (itemsEl) itemsEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  const res = await fetch('/api/carrinho');
  const data = await res.json();

  if (!data.success || !data.items.length) {
    if (itemsEl) itemsEl.innerHTML = `
      <div class="empty-state">
        <span class="ico">🛒</span>
        <h3>Carrinho vazio</h3>
        <p>Adicione carros ao seu carrinho para continuar.</p>
        <a href="/carros" class="btn btn-primary" style="margin-top:16px;">Ver Carros</a>
      </div>`;
    renderCartSummary([], summaryEl);
    return;
  }

  const items = data.items;
  if (itemsEl) {
    itemsEl.innerHTML = items.map(item => `
      <div class="carrinho-item" id="carrinho-item-${item.id}">
        <div class="carrinho-item-img">
          ${item.image
            ? `<img src="${item.image}" alt="${item.brand} ${item.model}">`
            : `<span style="font-size:1.5rem;">🚗</span>`}
        </div>
        <div class="carrinho-item-info">
          <div class="carrinho-item-name">${item.brand} ${item.model}</div>
          <div class="carrinho-item-detail">${item.year} · ${item.color} · ${item.fuel}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end;">
          <button class="btn btn-success btn-sm" onclick="purchaseItem(${item.id})">Comprar</button>
          <button class="btn btn-outline btn-sm" onclick="removeFromCart(${item.id})">Remover</button>
        </div>
      </div>
    `).join('');
  }

  renderCartSummary(items, summaryEl);
}

function renderCartSummary(items, summaryEl) {
  if (!summaryEl) return;
  const total = items.reduce((sum, i) => sum + Number(i.price), 0);
  summaryEl.innerHTML = `
    <h3>Resumo</h3>
    ${items.map(i => `
      <div class="summary-line">
        <span>${i.brand} ${i.model}</span>
        <span>${formatPrice(i.price)}</span>
      </div>`).join('')}
    <div class="summary-total">
      <span>Total</span>
      <span>${formatPrice(total)}</span>
    </div>
    ${items.length ? `<button class="btn btn-primary" onclick="purchaseAll()">Confirmar Todas as Compras</button>` : ''}
  `;
}

async function addToCart(carId) {
  if (!currentUser) { openAuth('login'); return; }

  const res = await fetch('/api/carrinho', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ car_id: carId })
  });
  const data = await res.json();

  if (data.success) {
    showToast('Adicionado!', 'Carro adicionado ao carrinho.', 'success');
    updateCartBadge();
  } else {
    showToast('Aviso', data.message, 'warning');
  }
}

async function removeFromCart(carId) {
  const res = await fetch(`/api/carrinho/${carId}`, { method: 'DELETE' });
  const data = await res.json();
  if (data.success) {
    showToast('Removido', 'Carro removido do carrinho.', 'info');
    loadCarrinho();
    updateCartBadge();
  }
}

async function purchaseItem(carId) {
  if (!confirm('Confirma a compra deste veículo?')) return;

  const res = await fetch('/api/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ car_id: carId })
  });
  const data = await res.json();

  if (data.success) {
    showToast('Compra realizada!', 'Parabéns pela sua aquisição!', 'success');
    loadCarrinho();
    updateCartBadge();
  } else {
    showToast('Erro', data.message, 'error');
  }
}

async function purchaseAll() {
  const res = await fetch('/api/carrinho');
  const data = await res.json();
  if (!data.success || !data.items.length) return;

  if (!confirm(`Confirma a compra de ${data.items.length} veículo(s)?`)) return;

  for (const item of data.items) {
    await fetch('/api/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ car_id: item.id })
    });
  }

  showToast('Compras concluídas!', 'Todos os veículos foram comprados.', 'success');
  loadCarrinho();
  updateCartBadge();
}

async function buyNow(carId) {
  if (!currentUser) { openAuth('login'); return; }
  if (!confirm('Confirma a compra deste veículo?')) return;

  const res = await fetch('/api/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ car_id: carId })
  });
  const data = await res.json();

  if (data.success) {
    showToast('Compra realizada!', 'Parabéns pela sua aquisição!', 'success');
    setTimeout(() => window.location.href = '/carros', 1500);
  } else {
    showToast('Erro', data.message, 'error');
  }
}

// =============================================
// ADMIN PAGE
// =============================================
function initAdmin() {

  // garantir que o utilizador vem do localStorage
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  console.log('ADMIN CHECK:', currentUser);

  if (!currentUser || currentUser.role !== 'admin') {
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:16px;color:var(--text-muted);">
        <span style="font-size:3rem;">🔐</span>
        <h2 style="color:var(--white);">Acesso Restrito</h2>
        <p>Precisa de ser administrador para aceder a esta página.</p>
        <a href="/" class="btn btn-primary">Voltar ao Início</a>
      </div>`;
    return;
  }

  loadAdminStats();
  loadAdminCars();
  setupAdminNav();
  setupCarForm();
}

function setupAdminNav() {
  const links = document.querySelectorAll('.sidebar-link');
  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const section = link.dataset.section;
      document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${section}`)?.classList.add('active');
      if (section === 'carros') loadAdminCars();
      if (section === 'cliente') loadAdminUsers();
      if (section === 'compras') loadAdminPurchases();
    });
  });
}

async function loadAdminStats() {
  const res = await fetch('/api/admin/stats');
  const data = await res.json();
  if (!data.success) return;
  const { stats } = data;
  document.getElementById('stat-carros').textContent = stats.carros;
  document.getElementById('stat-cliente').textContent = stats.cliente;
  document.getElementById('stat-compras').textContent = stats.compras;
  document.getElementById('stat-revenue').textContent = formatPrice(stats.revenue);
}

async function loadAdminCars() {
  const tbody = document.getElementById('admin-carros-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-muted);">A carregar...</td></tr>';

  const res = await fetch('/api/carros');
  const data = await res.json();
  if (!data.success || !data.carros.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-muted);">Sem carros registados.</td></tr>';
    return;
  }

  tbody.innerHTML = data.carros.map(car => `
    <tr>
      <td>${car.id}</td>
      <td><strong style="color:var(--white);">${car.brand} ${car.model}</strong></td>
      <td>${car.year}</td>
      <td style="color:var(--accent-light);font-weight:600;">${formatPrice(car.price)}</td>
      <td>${Number(car.mileage).toLocaleString()} km</td>
      <td>${car.fuel}</td>
      <td><span class="${car.available ? 'status-badge status-confirmado' : 'status-badge status-cancelado'}">${car.available ? 'Disponível' : 'Vendido'}</span></td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-outline btn-sm" onclick="editCar(${JSON.stringify(car).replace(/"/g, '&quot;')})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCar(${car.id})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function loadAdminUsers() {
  const tbody = document.getElementById('admin-cliente-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-muted);">A carregar...</td></tr>';

  const res = await fetch('/api/admin/cliente');
  const data = await res.json();
  if (!data.success || !data.cliente.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;">Sem utilizadores.</td></tr>';
    return;
  }

  tbody.innerHTML = data.cliente.map(u => `
    <tr>
      <td>${u.id}</td>
      <td><strong style="color:var(--white);">${u.name}</strong></td>
      <td>${u.email}</td>
      <td><span class="status-badge ${u.role === 'admin' ? 'status-pendente' : 'status-confirmado'}">${u.role}</span></td>
      <td>${new Date(u.created_at).toLocaleDateString('pt-AO')}</td>
    </tr>
  `).join('');
}

async function loadAdminPurchases() {
  const tbody = document.getElementById('admin-compras-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">A carregar...</td></tr>';

  const res = await fetch('/api/admin/compras');
  const data = await res.json();
  if (!data.success || !data.compras.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;">Sem compras registadas.</td></tr>';
    return;
  }

  tbody.innerHTML = data.compras.map(p => `
    <tr>
      <td>${p.id}</td>
      <td><strong style="color:var(--white);">${p.cliente_name}</strong><br><small style="color:var(--text-muted);">${p.cliente_email}</small></td>
      <td>${p.brand} ${p.model}</td>
      <td>${p.year}</td>
      <td style="color:var(--accent-light);font-weight:600;">${formatPrice(p.total_price)}</td>
      <td>${new Date(p.purchase_date).toLocaleDateString('pt-AO')}</td>
      <td><span class="status-badge status-${p.status}">${p.status}</span></td>
    </tr>
  `).join('');
}

// Car Form
let editingCarId = null;

function setupCarForm() {
  document.getElementById('btn-add-car')?.addEventListener('click', () => {
    editingCarId = null;
    document.getElementById('car-form').reset();
    document.getElementById('car-modal-title').textContent = 'Adicionar Carro';
    document.getElementById('car-modal').classList.add('open');
  });

  document.getElementById('car-form')?.addEventListener('submit', handleCarSubmit);
  document.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', closeModal));
}

function editCar(car) {
  editingCarId = car.id;
  document.getElementById('car-modal-title').textContent = 'Editar Carro';
  document.getElementById('f-brand').value = car.brand;
  document.getElementById('f-model').value = car.model;
  document.getElementById('f-year').value = car.year;
  document.getElementById('f-price').value = car.price;
  document.getElementById('f-mileage').value = car.mileage;
  document.getElementById('f-fuel').value = car.fuel;
  document.getElementById('f-transmission').value = car.transmission;
  document.getElementById('f-color').value = car.color;
  document.getElementById('f-description').value = car.description || '';
  document.getElementById('f-image').value = car.image || '';
  document.getElementById('f-available').checked = car.available;
  document.getElementById('f-featured').checked = car.featured;
  document.getElementById('car-modal').classList.add('open');
}

function closeModal() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}

async function handleCarSubmit(e) {
  e.preventDefault();
  const body = {
    brand: document.getElementById('f-brand').value,
    model: document.getElementById('f-model').value,
    year: document.getElementById('f-year').value,
    price: document.getElementById('f-price').value,
    mileage: document.getElementById('f-mileage').value,
    fuel: document.getElementById('f-fuel').value,
    transmission: document.getElementById('f-transmission').value,
    color: document.getElementById('f-color').value,
    description: document.getElementById('f-description').value,
    image: document.getElementById('f-image').value,
    available: document.getElementById('f-available').checked,
    featured: document.getElementById('f-featured').checked,
  };

  const url = editingCarId ? `/api/carros/${editingCarId}` : '/api/carros';
  const method = editingCarId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();

  if (data.success) {
    showToast('Guardado!', editingCarId ? 'Carro atualizado.' : 'Carro adicionado.', 'success');
    closeModal();
    loadAdminCars();
    loadAdminStats();
  } else {
    showToast('Erro', data.message, 'error');
  }
}

async function deleteCar(id) {
  if (!confirm('Tem certeza que deseja eliminar este carro?')) return;
  const res = await fetch(`/api/carros/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (data.success) {
    showToast('Eliminado!', 'Carro removido com sucesso.', 'success');
    loadAdminCars();
    loadAdminStats();
  } else {
    showToast('Erro', data.message, 'error');
  }
}

// Contact form
document.getElementById('contact-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  showToast('Mensagem enviada!', 'Entraremos em contacto brevemente.', 'success');
  e.target.reset();
});

// =============================================
// UTILITIES
// =============================================
function carCardHTML(car) {
  return `
    <div class="car-card">
      <div class="car-card-img">
        ${car.image
          ? `<img src="${car.image}" alt="${car.brand} ${car.model}">`
          : `<div class="car-img-placeholder"><span class="icon">🚗</span><span style="font-size:0.8rem;color:var(--text-dark);">${car.brand} ${car.model}</span></div>`}
        <span class="car-badge ${car.available ? 'badge-available' : 'badge-sold'}">
          ${car.available ? 'Disponível' : 'Vendido'}
        </span>
      </div>
      <div class="car-card-body">
        <div class="car-card-title">${car.brand} ${car.model}</div>
        <div class="car-card-year">${car.year}</div>
        <div class="car-card-specs">
          <div class="spec-item"><span class="ico">⛽</span> ${car.fuel}</div>
          <div class="spec-item"><span class="ico">⚙️</span> ${car.transmission}</div>
          <div class="spec-item"><span class="ico">📍</span> ${Number(car.mileage).toLocaleString()} km</div>
        </div>
        <div class="car-card-price">$${Number(car.price).toLocaleString('pt-AO')}</div>
        <div class="car-card-actions">
          <a href="/detalhe?id=${car.id}" class="btn btn-outline btn-sm">Detalhes</a>
          ${car.available ? `<button class="btn btn-primary btn-sm" onclick="addToCart(${car.id})">🛒 Carrinho</button>` : ''}
        </div>
      </div>
    </div>
  `;
}

function showToast(title, msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function formatPrice(val) {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0
  }).format(Number(val));
}

// =============================================
// CSV EXPORT
// =============================================
function exportCSV(type) {
  const labels = {
    compras: 'Compras',
    carros: 'Inventário',
    cliente: 'Utilizadores'
  };
  showToast('A exportar...', `A gerar CSV de ${labels[type] || type}.`, 'info');
  window.location.href = `/api/admin/export/${type}`;
}
