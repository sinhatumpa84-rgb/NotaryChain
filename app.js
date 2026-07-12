/* ═══════════════════════════════════════════════════════
   NOTARYCHAIN — ENTERPRISE DASHBOARD LOGIC (app.js)
═══════════════════════════════════════════════════════ */

// ── STATE MANAGEMENT ──────────────────────────────────
const state = {
  currentRole: 'company', // company, notary, bank, admin
  currentUser: {
    first_name: 'Rajesh',
    last_name: 'Kumar',
    email: 'rajesh@techcorp.in',
    role: 'company',
    avatar: 'RK'
  },
  documents: [
    {
      id: 'doc-1',
      name: 'HDFC_Loan_Agreement.pdf',
      number: 'NC-DOC-94827',
      type: 'loan_application',
      size: '2.4 MB',
      uploadedBy: 'Rajesh Kumar',
      uploadedAt: '2026-07-12 10:15',
      status: 'verified_by_bank',
      ocrText: 'LOAN AGREEMENT between TechCorp Solutions and HDFC Bank. Amount: ₹50,000,000. Interest Rate: 8.5% p.a. Term: 60 Months.',
      ocrConfidence: 99.4,
      fraudScore: 0.12,
      fraudFlags: [],
      isSigned: true,
      signedAt: '2026-07-12 11:30',
      signedBy: 'Rajesh Kumar',
      notarySealApplied: true,
      sealTimestamp: '2026-07-12 12:00',
      notaryName: 'Adv. Suresh Mehta',
      notaryLicense: 'NC-NOTARY-84920',
      certificateNumber: 'NC-CERT-88402',
      blockchainHash: '0x3bf5c8d20fa49b827e8a939c0fef93021bc4e1b82cf4b92b67f1ad37e94f92bc',
      qrData: 'NotaryChain Verified | Doc ID: doc-1 | Hash: 0x3bf5c8d2...'
    },
    {
      id: 'doc-2',
      name: 'MOA_TechCorp_2026.pdf',
      number: 'NC-DOC-10294',
      type: 'incorporation_certificate',
      size: '4.8 MB',
      uploadedBy: 'Rajesh Kumar',
      uploadedAt: '2026-07-12 14:22',
      status: 'pending_notary',
      ocrText: 'MEMORANDUM OF ASSOCIATION OF TECHCORP SOLUTIONS PRIVATE LIMITED. Incorporated under Companies Act, 2013.',
      ocrConfidence: 98.1,
      fraudScore: 0.28,
      fraudFlags: [],
      isSigned: true,
      signedAt: '2026-07-12 14:30',
      signedBy: 'Rajesh Kumar',
      notarySealApplied: false,
      blockchainHash: '0x7e8a939c0fef93021bc4e1b82cf4b92b67f1ad37e94f92bc3bf5c8d20fa49b8'
    },
    {
      id: 'doc-3',
      name: 'Property_Deed_Mumbai.pdf',
      number: 'NC-DOC-38472',
      type: 'agreement',
      size: '8.1 MB',
      uploadedBy: 'Rajesh Kumar',
      uploadedAt: '2026-07-12 16:05',
      status: 'ocr_completed',
      ocrText: 'SALE DEED. Property located at Flat 402, Sea Breeze Apartments, Bandra, Mumbai. Seller: Amit Sharma. Buyer: TechCorp Solutions.',
      ocrConfidence: 97.5,
      fraudScore: 0.85,
      fraudFlags: ['Modified Metadata Detect', 'Signature Mismatch Suspected'],
      isSigned: false,
      notarySealApplied: false,
      blockchainHash: '0x939c0fef93021bc4e1b82cf4b92b67f1ad37e94f92bc3bf5c8d20fa49b87e8a'
    }
  ],
  notaryRequests: [
    {
      id: 'req-1',
      requestNumber: 'NC-REQ-20394',
      documentId: 'doc-2',
      requestedBy: 'Rajesh Kumar',
      company: 'TechCorp Solutions',
      status: 'pending',
      priority: 'high',
      createdAt: '2026-07-12 14:25'
    },
    {
      id: 'req-2',
      requestNumber: 'NC-REQ-10294',
      documentId: 'doc-1',
      requestedBy: 'Rajesh Kumar',
      company: 'TechCorp Solutions',
      status: 'completed',
      priority: 'normal',
      createdAt: '2026-07-12 10:20',
      notaryId: 'Adv. Suresh Mehta',
      notaryNotes: 'Identity confirmed via Aadhaar eKYC. Digital seal & signature appended.'
    }
  ],
  users: [
    { id: 'usr-1', name: 'Rajesh Kumar', email: 'rajesh@techcorp.in', role: 'company', status: 'Active', verification: 'Verified' },
    { id: 'usr-2', name: 'Adv. Suresh Mehta', email: 'suresh@mehtalaw.in', role: 'notary', status: 'Active', verification: 'Verified' },
    { id: 'usr-3', name: 'Bank Officer HDFC', email: 'officer@hdfc.com', role: 'bank', status: 'Active', verification: 'Verified' },
    { id: 'usr-4', name: 'Compliance Monitor', email: 'admin@notarychain.io', role: 'admin', status: 'Active', verification: 'Verified' }
  ],
  notifications: [
    { id: 'n-1', title: 'Document Verified by Bank', desc: 'HDFC_Loan_Agreement.pdf has been approved by HDFC Bank.', time: '10 mins ago', unread: true },
    { id: 'n-2', title: 'Notary Request Update', desc: 'Adv. Suresh Mehta reviewed MOA_TechCorp_2026.pdf.', time: '1 hour ago', unread: true },
    { id: 'n-3', title: 'MFA Enabled Successfully', desc: 'Secure two-factor auth has been configured for your profile.', time: '2 hours ago', unread: false },
    { id: 'n-4', title: 'New Login Detected', desc: 'Login from IP 103.48.22.9 (Chrome, Windows).', time: '4 hours ago', unread: false }
  ],
  auditLogs: [
    { id: 'a-1', action: 'LOAN_APPROVED', details: 'HDFC Bank approved loan request NC-REQ-10294', user: 'Bank Officer HDFC', time: '2026-07-12 13:10', hash: '0xf8e92a839c0fef93021bc4e1b82cf4b92b67f1ad37e94f92bc3bf5c8d20fa49b' },
    { id: 'a-2', action: 'NOTARY_SEAL_APPLIED', details: 'Applied seal on HDFC_Loan_Agreement.pdf', user: 'Adv. Suresh Mehta', time: '2026-07-12 12:00', hash: '0x3bf5c8d20fa49b827e8a939c0fef93021bc4e1b82cf4b92b67f1ad37e94f92bc' },
    { id: 'a-3', action: 'DOCUMENT_SIGNED', details: 'Rajesh Kumar digitally signed HDFC_Loan_Agreement.pdf', user: 'Rajesh Kumar', time: '2026-07-12 11:30', hash: '0x7e8a939c0fef93021bc4e1b82cf4b92b67f1ad37e94f92bc3bf5c8d20fa49b87e8a' },
    { id: 'a-4', action: 'KYC_COMPLETED', details: 'Aadhaar eKYC completed for Rajesh Kumar', user: 'System AI', time: '2026-07-12 10:10', hash: '0x939c0fef93021bc4e1b82cf4b92b67f1ad37e94f92bc3bf5c8d20fa49b87e8a93e' }
  ]
};

// ── INITIALIZATION ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initCharts();
  renderNotifications();
  setupRoleTheme();
});

// ── PARTICLE BACKGROUND ────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = (canvas.width = window.innerWidth);
    height = (canvas.height = window.innerHeight);
  });

  const particles = [];
  const maxParticles = 60;

  for (let i = 0; i < maxParticles; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw lines between nearby particles
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// ── TOAST NOTIFICATIONS ────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-msg">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ── AUTHENTICATION NAVIGATION FLOW ────────────────────
function showAuth(mode) {
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('auth').classList.remove('hidden');

  if (mode === 'login') {
    document.getElementById('loginPanel').classList.remove('hidden');
    document.getElementById('registerPanel').classList.add('hidden');
    document.getElementById('mfaPanel').classList.add('hidden');
  } else {
    document.getElementById('loginPanel').classList.add('hidden');
    document.getElementById('registerPanel').classList.remove('hidden');
    document.getElementById('mfaPanel').classList.add('hidden');
  }
}

function showLanding() {
  document.getElementById('landing').classList.remove('hidden');
  document.getElementById('auth').classList.add('hidden');
  document.getElementById('app').classList.add('hidden');
}

let selectedLoginRole = 'company';

function selectRole(role, btn) {
  selectedLoginRole = role;
  const buttons = btn.parentElement.querySelectorAll('.rs-btn');
  buttons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function otpNext(elem, nextId) {
  if (elem.value.length >= elem.maxLength) {
    document.getElementById(nextId)?.focus();
  }
}

function quickLogin(role) {
  state.currentRole = role;
  if (role === 'company') {
    state.currentUser = { first_name: 'Rajesh', last_name: 'Kumar', email: 'rajesh@techcorp.in', role: 'company', avatar: 'RK' };
  } else if (role === 'notary') {
    state.currentUser = { first_name: 'Suresh', last_name: 'Mehta', email: 'suresh@mehtalaw.in', role: 'notary', avatar: 'SM' };
  } else if (role === 'bank') {
    state.currentUser = { first_name: 'Amit', last_name: 'Shah', email: 'amit.shah@hdfc.com', role: 'bank', avatar: 'AS' };
  } else if (role === 'admin') {
    state.currentUser = { first_name: 'Super', last_name: 'Admin', email: 'admin@notarychain.io', role: 'admin', avatar: 'SA' };
  }
  
  showAuth('login');
  // Auto-fill and transition to MFA to show security flow
  setTimeout(() => {
    handleLogin();
  }, 300);
}

function handleLogin() {
  // Move to MFA Panel to simulate strict 2FA
  document.getElementById('loginPanel').classList.add('hidden');
  document.getElementById('registerPanel').classList.add('hidden');
  document.getElementById('mfaPanel').classList.remove('hidden');
  showToast('OTP sent via SMS and Email!', 'info');
}

function handleRegister() {
  showToast('Organization registered! Please verify email & phone.', 'success');
  showAuth('login');
}

function verifyOTP() {
  // Simulate face scanning check (liveness detection)
  document.getElementById('mfaPanel').innerHTML = `
    <h3 class="auth-form-title">Facial Liveness Check</h3>
    <p class="auth-form-sub">Looking for user profile authentication...</p>
    <div class="face-scan-wrap">
      <div class="face-scan-circle">
        👤
        <div class="scan-line"></div>
      </div>
      <p style="font-size:13px; color:var(--text-secondary)">Scanning face... Keep steady</p>
    </div>
  `;

  setTimeout(() => {
    showToast('Face recognition matching: 99.8%', 'success');
    showToast('Biometric Liveness Verification Passed!', 'success');
    enterApp();
  }, 2200);
}

function otpSubmit() {
  verifyOTP();
}

function enterApp() {
  document.getElementById('auth').classList.add('hidden');
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  // Update sidebar info
  document.getElementById('suAvatar').innerText = state.currentUser.avatar;
  document.getElementById('suName').innerText = `${state.currentUser.first_name} ${state.currentUser.last_name}`;
  document.getElementById('suEmail').innerText = state.currentUser.email;

  const roleLabel = document.getElementById('roleLabel');
  roleLabel.innerText = state.currentRole.toUpperCase();

  setupSidebarNav();
  setupRoleTheme();
  loadPanel('dashboard');
  showToast(`Logged in securely as ${state.currentRole.toUpperCase()}`, 'success');
}

function logout() {
  showToast('Logged out successfully', 'info');
  showLanding();
}

// ── SIDEBAR NAVIGATION BUILDER ────────────────────────
function setupSidebarNav() {
  const nav = document.getElementById('sidebarNav');
  nav.innerHTML = '';

  const role = state.currentRole;

  let menuItems = [];
  if (role === 'company') {
    menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'upload', label: 'Upload Documents', icon: '📁' },
      { id: 'my-docs', label: 'My Documents', icon: '📄' },
      { id: 'tracking', label: 'Loan Tracker', icon: '🏦' }
    ];
  } else if (role === 'notary') {
    menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'requests', label: 'Pending Requests', icon: '⚖️', badge: 1 },
      { id: 'history', label: 'Verification Logs', icon: '📋' }
    ];
  } else if (role === 'bank') {
    menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'bank-docs', label: 'Incoming Documents', icon: '📥', badge: 2 },
      { id: 'loans', label: 'Loan Applications', icon: '💵' }
    ];
  } else if (role === 'admin') {
    menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'users', label: 'User Management', icon: '👥' },
      { id: 'fraud', label: 'Fraud Alerts', icon: '🚨', badge: 1 },
      { id: 'audit', label: 'Immutable Audit Log', icon: '🛡️' }
    ];
  }

  menuItems.forEach((item) => {
    const el = document.createElement('div');
    el.className = `nav-item ${item.id === 'dashboard' ? 'active' : ''}`;
    el.onclick = () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      el.classList.add('active');
      loadPanel(item.id);
    };

    let badgeHtml = '';
    if (item.badge) {
      badgeHtml = `<span class="nav-badge">${item.badge}</span>`;
    }

    el.innerHTML = `
      <span class="nav-icon">${item.icon}</span>
      <span>${item.label}</span>
      ${badgeHtml}
    `;
    nav.appendChild(el);
  });
}

function setupRoleTheme() {
  const roleLabel = document.getElementById('roleLabel');
  if (!roleLabel) return;
  roleLabel.className = 'role-pill';

  if (state.currentRole === 'company') roleLabel.classList.add('blue-badge');
  if (state.currentRole === 'notary') roleLabel.classList.add('purple-badge');
  if (state.currentRole === 'bank') roleLabel.classList.add('green-badge');
  if (state.currentRole === 'admin') roleLabel.classList.add('red-badge');
}

// ── DYNAMIC PANEL LOADER ──────────────────────────────
function loadPanel(panelId) {
  const area = document.getElementById('contentArea');
  const title = document.getElementById('pageTitle');
  
  title.innerText = panelId.charAt(0).toUpperCase() + panelId.slice(1).replace('-', ' ');

  // Standard views
  if (panelId === 'dashboard') {
    renderDashboard(area);
  } else if (panelId === 'upload') {
    renderUploadPanel(area);
  } else if (panelId === 'my-docs') {
    renderMyDocsPanel(area);
  } else if (panelId === 'tracking') {
    renderTrackingPanel(area);
  } else if (panelId === 'requests') {
    renderRequestsPanel(area);
  } else if (panelId === 'history') {
    renderHistoryPanel(area);
  } else if (panelId === 'bank-docs') {
    renderBankDocsPanel(area);
  } else if (panelId === 'loans') {
    renderLoansPanel(area);
  } else if (panelId === 'users') {
    renderUsersPanel(area);
  } else if (panelId === 'fraud') {
    renderFraudPanel(area);
  } else if (panelId === 'audit') {
    renderAuditPanel(area);
  }
}

// ── CHARTS GENERATOR ──────────────────────────────────
let currentChart = null;

function initCharts() {
  // We will build dynamic chart renderers in specific panels
}

// ── DASHBOARD RENDERING ───────────────────────────────
function renderDashboard(target) {
  const role = state.currentRole;

  if (role === 'company') {
    target.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="sc-header">
            <span class="sc-label">Total Documents</span>
            <span class="sc-icon blue-icon">📄</span>
          </div>
          <div class="sc-num">${state.documents.length}</div>
          <div class="sc-trend trend-up">▲ 100% cloud secure</div>
        </div>
        <div class="stat-card">
          <div class="sc-header">
            <span class="sc-label">Notarized Docs</span>
            <span class="sc-icon green-icon">⚖️</span>
          </div>
          <div class="sc-num">${state.documents.filter(d => d.status === 'verified_by_bank' || d.status === 'notarized').length}</div>
          <div class="sc-trend trend-up">▲ Instant Verification QR Ready</div>
        </div>
        <div class="stat-card">
          <div class="sc-header">
            <span class="sc-label">Pending Notary</span>
            <span class="sc-icon amber-icon">⏳</span>
          </div>
          <div class="sc-num">${state.documents.filter(d => d.status === 'pending_notary').length}</div>
          <div class="sc-trend">In Queue review</div>
        </div>
        <div class="stat-card">
          <div class="sc-header">
            <span class="sc-label">Fraud Checks Passed</span>
            <span class="sc-icon purple-icon">🛡️</span>
          </div>
          <div class="sc-num">${state.documents.filter(d => d.fraudScore < 0.7).length}</div>
          <div class="sc-trend trend-up">▲ 100% verified AI integrity</div>
        </div>
      </div>

      <div class="content-grid-2">
        <div class="panel-card">
          <div class="pc-header"><span class="pc-title">Recent Document Status</span></div>
          <div class="pc-body">
            <table class="doc-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>ID Number</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${state.documents.map(d => `
                  <tr>
                    <td>
                      <div class="doc-name">
                        <div class="doc-file-icon">📄</div>
                        <div>${d.name}</div>
                      </div>
                    </td>
                    <td><code style="font-family:'JetBrains Mono'">${d.number}</code></td>
                    <td><span class="badge badge-${d.status.replace(/_/g, '-')}">${d.status.replace(/_/g, ' ')}</span></td>
                    <td>
                      <button class="btn-sm btn-blue" onclick="viewDocDetails('${d.id}')">View</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel-card">
          <div class="pc-header"><span class="pc-title">Quick Notarization Process</span></div>
          <div class="pc-body" style="display:flex; flex-direction:column; gap:16px;">
            <p style="font-size:13px; color:var(--text-secondary)">Need instant authentication for business contracts, properties or loans? Follow NotaryChain's secure zero-paper workflow.</p>
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--glass-border); padding:16px; border-radius:8px;">
              <h4 style="font-size:13px; margin-bottom:8px;">Workflow Milestones</h4>
              <div style="display:flex; flex-direction:column; gap:8px; font-size:12px; color:var(--text-secondary);">
                <div>📁 1. Secure Cryptographic Upload</div>
                <div>🤖 2. OCR Scanning & Forgery Risk Score</div>
                <div>👁️ 3. Video / Liveness Identity Match</div>
                <div>⚖️ 4. Licensed Notary Signature Stamp</div>
              </div>
            </div>
            <button class="btn-primary" onclick="loadPanel('upload')">Request New Notary Request →</button>
          </div>
        </div>
      </div>
    `;
  }

  else if (role === 'notary') {
    target.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="sc-header">
            <span class="sc-label">Pending Requests</span>
            <span class="sc-icon purple-icon">⚖️</span>
          </div>
          <div class="sc-num">${state.notaryRequests.filter(r => r.status === 'pending').length}</div>
          <div class="sc-trend trend-down">Needs Review</div>
        </div>
        <div class="stat-card">
          <div class="sc-header">
            <span class="sc-label">Completed Seals</span>
            <span class="sc-icon green-icon">⚡</span>
          </div>
          <div class="sc-num">${state.notaryRequests.filter(r => r.status === 'completed').length}</div>
          <div class="sc-trend trend-up">▲ 100% compliant logs</div>
        </div>
        <div class="stat-card">
          <div class="sc-header">
            <span class="sc-label">Aadhaar eKYC Checks</span>
            <span class="sc-icon blue-icon">🆔</span>
          </div>
          <div class="sc-num">142</div>
          <div class="sc-trend trend-up">▲ Biometrics match active</div>
        </div>
        <div class="stat-card">
          <div class="sc-header">
            <span class="sc-label">Total Earnings</span>
            <span class="sc-icon amber-icon">₹</span>
          </div>
          <div class="sc-num">₹28,400</div>
          <div class="sc-trend trend-up">▲ This month</div>
        </div>
      </div>

      <div class="content-grid-2">
        <div class="panel-card">
          <div class="pc-header"><span class="pc-title">Pending Verification Queue</span></div>
          <div class="pc-body">
            <table class="doc-table">
              <thead>
                <tr>
                  <th>Request Number</th>
                  <th>Organization</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${state.notaryRequests.filter(r => r.status === 'pending').map(r => `
                  <tr>
                    <td><code style="font-family:'JetBrains Mono'">${r.requestNumber}</code></td>
                    <td><strong>${r.company}</strong></td>
                    <td><span class="badge badge-review">${r.priority.toUpperCase()}</span></td>
                    <td>
                      <button class="btn-sm btn-purple" onclick="openNotaryReview('${r.id}')">Perform eKYC & Notarize</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel-card">
          <div class="pc-header"><span class="pc-title">Verification Operations</span></div>
          <div class="pc-body" style="display:flex; flex-direction:column; gap:16px;">
            <div class="health-grid">
              <div class="health-item">
                <div class="health-status">🟢</div>
                <div class="health-label">eSign Engine</div>
              </div>
              <div class="health-item">
                <div class="health-status">🟢</div>
                <div class="health-label">Liveness API</div>
              </div>
              <div class="health-item">
                <div class="health-status">🟢</div>
                <div class="health-label">UIDAI eKYC</div>
              </div>
            </div>
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--glass-border); padding:16px; border-radius:8px; font-size:12px;">
              <h4 style="font-weight:700; margin-bottom:8px;">Compliance Alert</h4>
              <p style="color:var(--text-secondary); line-height:1.5;">Verify all liveness scores and face matches. Legal guidelines dictate a minimum face match score of 95% before digital sealing.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  else if (role === 'bank') {
    target.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="sc-header">
            <span class="sc-label">Verified Copies Received</span>
            <span class="sc-icon green-icon">📥</span>
          </div>
          <div class="sc-num">${state.documents.filter(d => d.status === 'verified_by_bank' || d.status === 'notarized').length}</div>
          <div class="sc-trend trend-up">▲ Cryptographically signed</div>
        </div>
        <div class="stat-card">
          <div class="sc-header">
            <span class="sc-label">Pending Approval</span>
            <span class="sc-icon amber-icon">⏳</span>
          </div>
          <div class="sc-num">1</div>
          <div class="sc-trend">Ready for audit check</div>
        </div>
        <div class="stat-card">
          <div class="sc-header">
            <span class="sc-label">Approved Loans</span>
            <span class="sc-icon blue-icon">🏦</span>
          </div>
          <div class="sc-num">18</div>
          <div class="sc-trend trend-up">▲ Fast-tracked workflow</div>
        </div>
        <div class="stat-card">
          <div class="sc-header">
            <span class="sc-label">Audit Clearance</span>
            <span class="sc-icon purple-icon">🛡️</span>
          </div>
          <div class="sc-num">100%</div>
          <div class="sc-trend">Zero compliance errors</div>
        </div>
      </div>

      <div class="content-grid-2">
        <div class="panel-card">
          <div class="pc-header"><span class="pc-title">Incoming Certified Copies</span></div>
          <div class="pc-body">
            <table class="doc-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Notary License</th>
                  <th>Authenticity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${state.documents.filter(d => d.notarySealApplied).map(d => `
                  <tr>
                    <td>
                      <div class="doc-name">
                        <div class="doc-file-icon">📄</div>
                        <div>${d.name}</div>
                      </div>
                    </td>
                    <td><code style="font-family:'JetBrains Mono'">${d.notaryLicense}</code></td>
                    <td><span class="badge badge-verified">QR VALIDATED</span></td>
                    <td>
                      <button class="btn-sm btn-green" onclick="openBankReview('${d.id}')">Review & Approve Loan</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel-card">
          <div class="pc-header"><span class="pc-title">Bank Verification Tool</span></div>
          <div class="pc-body" style="display:flex; flex-direction:column; gap:16px;">
            <p style="font-size:12px; color:var(--text-secondary)">Scan or verify any document hash against our immutable ledger storage system to confirm it has not been modified after notarization.</p>
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--glass-border); padding:16px; border-radius:8px; display:flex; flex-direction:column; gap:8px;">
              <input type="text" placeholder="Enter SHA256 Doc Hash..." class="otp-input" style="width:100% !important; text-align:left; font-size:12px; padding:12px;" />
              <button class="btn-primary" onclick="showToast('Querying ledger... Hash match found: Legally sealed!', 'success')">Verify Instant Authenticity</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  else if (role === 'admin') {
    target.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="sc-header">
            <span class="sc-label">Suspicious Alerts</span>
            <span class="sc-icon red-icon">🚨</span>
          </div>
          <div class="sc-num">1</div>
          <div class="sc-trend trend-down">High risk score detected</div>
        </div>
        <div class="stat-card">
          <div class="sc-header">
            <span class="sc-label">Ledger Blocks</span>
            <span class="sc-icon blue-icon">⛓️</span>
          </div>
          <div class="sc-num">482</div>
          <div class="sc-trend trend-up">▲ Immutable entries synced</div>
        </div>
        <div class="stat-card">
          <div class="sc-header">
            <span class="sc-label">Identity Liveness Match</span>
            <span class="sc-icon green-icon">👤</span>
          </div>
          <div class="sc-num">98.9%</div>
          <div class="sc-trend">System average</div>
        </div>
        <div class="stat-card">
          <div class="sc-header">
            <span class="sc-label">Notaries Registered</span>
            <span class="sc-icon amber-icon">⚖️</span>
          </div>
          <div class="sc-num">42</div>
          <div class="sc-trend trend-up">▲ Licensed in system</div>
        </div>
      </div>

      <div class="content-grid-2">
        <div class="panel-card">
          <div class="pc-header"><span class="pc-title">Fraud Risk Analysis Feed</span></div>
          <div class="pc-body">
            <div class="fraud-feed">
              <div class="fraud-item high">
                <span class="fi-sev sev-high">High Risk</span>
                <span class="fi-text"><strong>Property_Deed_Mumbai.pdf</strong>: Image Manipulation / Forgery Detection score is 85%</span>
                <span class="fi-time">5 mins ago</span>
              </div>
              <div class="fraud-item medium">
                <span class="fi-sev sev-medium">Medium Risk</span>
                <span class="fi-text">Multiple login attempts for Rajesh Kumar from new location (Delhi)</span>
                <span class="fi-time">2 hours ago</span>
              </div>
              <div class="fraud-item low">
                <span class="fi-sev sev-low">Resolved</span>
                <span class="fi-text">Aadhaar Verification Face Match mismatch resolved via manual review.</span>
                <span class="fi-time">1 day ago</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-card">
          <div class="pc-header"><span class="pc-title">Admin Controls</span></div>
          <div class="pc-body" style="display:flex; flex-direction:column; gap:16px;">
            <button class="btn-primary" onclick="loadPanel('users')">Manage System Users</button>
            <button class="btn-ghost" onclick="loadPanel('audit')">View Full Audit Ledger</button>
          </div>
        </div>
      </div>
    `;
  }
}

// ── COMPANY DASHBOARD PANELS ──────────────────────────
function renderUploadPanel(target) {
  target.innerHTML = `
    <div class="panel-card">
      <div class="pc-header"><span class="pc-title">Upload New Documents for Digital Notarization</span></div>
      <div class="pc-body">
        <div class="upload-zone" id="uploadZone" onclick="simulateUpload()">
          <div class="upload-icon">📁</div>
          <div class="upload-title">Drag & drop your files here, or browse</div>
          <div class="upload-sub">Supports PDF, DOCX, PNG, JPG, JPEG (Max 50MB)</div>
          <div class="upload-formats">
            <span class="uf-tag">PDF</span>
            <span class="uf-tag">DOCX</span>
            <span class="uf-tag">IMAGE</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function simulateUpload() {
  const zone = document.getElementById('uploadZone');
  if (!zone) return;

  zone.innerHTML = `
    <div class="upload-icon">🔄</div>
    <div class="upload-title" style="color:var(--blue-400)">Uploading to Secure AWS S3 Object Storage...</div>
    <div class="progress-bar-wrap" style="width: 80%; margin: 20px auto;">
      <div class="progress-bar">
        <div class="progress-fill" id="uploadProgress" style="width: 0%; background:var(--blue-500)"></div>
      </div>
    </div>
    <div class="upload-sub" id="uploadStatusText">Encrypting with AES-256...</div>
  `;

  let progress = 0;
  const interval = setInterval(() => {
    progress += 20;
    const bar = document.getElementById('uploadProgress');
    const text = document.getElementById('uploadStatusText');
    if (bar) bar.style.width = `${progress}%`;
    
    if (progress === 40 && text) {
      text.innerText = 'Calculating document checksum SHA256...';
    }
    if (progress === 80 && text) {
      text.innerText = 'Initializing AI OCR Extract Engine...';
    }

    if (progress >= 100) {
      clearInterval(interval);
      finalizeUpload();
    }
  }, 400);
}

function finalizeUpload() {
  const newDoc = {
    id: `doc-${Date.now()}`,
    name: 'Business_Partner_Agreement.pdf',
    number: `NC-DOC-${Math.floor(10000 + Math.random() * 90000)}`,
    type: 'agreement',
    size: '1.8 MB',
    uploadedBy: 'Rajesh Kumar',
    uploadedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    status: 'ocr_completed',
    ocrText: 'BUSINESS PARTNER AGREEMENT. Confirmed partner: HDFC Legal group and TechCorp Solutions. Effective July 2026.',
    ocrConfidence: 98.9,
    fraudScore: 0.05,
    fraudFlags: [],
    isSigned: false,
    notarySealApplied: false,
    blockchainHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')
  };

  state.documents.push(newDoc);
  
  // Add Notary Request too
  const newReq = {
    id: `req-${Date.now()}`,
    requestNumber: `NC-REQ-${Math.floor(10000 + Math.random() * 90000)}`,
    documentId: newDoc.id,
    requestedBy: 'Rajesh Kumar',
    company: 'TechCorp Solutions',
    status: 'pending',
    priority: 'normal',
    createdAt: newDoc.uploadedAt
  };
  state.notaryRequests.push(newReq);

  // Add Notification
  state.notifications.unshift({
    id: `n-${Date.now()}`,
    title: 'Document Uploaded Successfully',
    desc: `${newDoc.name} is uploaded, encrypted, and indexed.`,
    time: 'Just now',
    unread: true
  });
  renderNotifications();

  showToast('Document uploaded and encrypted!', 'success');
  showToast('AI OCR Analysis complete!', 'success');
  loadPanel('my-docs');
}

function renderMyDocsPanel(target) {
  target.innerHTML = `
    <div class="panel-card">
      <div class="pc-header"><span class="pc-title">Corporate Document Directory</span></div>
      <div class="pc-body">
        <table class="doc-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>SHA256 File Hash</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${state.documents.map(d => `
              <tr>
                <td>
                  <div class="doc-name">
                    <div class="doc-file-icon">📄</div>
                    <div>
                      <strong>${d.name}</strong><br/>
                      <small style="color:var(--text-muted)">${d.size} · Uploaded ${d.uploadedAt}</small>
                    </div>
                  </div>
                </td>
                <td><code style="font-family:'JetBrains Mono'; font-size:11px;">${d.blockchainHash.slice(0, 18)}...</code></td>
                <td><span class="badge badge-${d.status.replace(/_/g, '-')}">${d.status.replace(/_/g, ' ')}</span></td>
                <td>
                  <button class="btn-sm btn-blue" onclick="viewDocDetails('${d.id}')">Open Details & Certificate</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderTrackingPanel(target) {
  target.innerHTML = `
    <div class="panel-card">
      <div class="pc-header"><span class="pc-title">Active Loan Application Tracking</span></div>
      <div class="pc-body">
        <div class="loan-tracker">
          <div class="lt-step">
            <div class="lt-icon-wrap">
              <div class="lt-icon done">✓</div>
              <div class="lt-connector"></div>
            </div>
            <div class="lt-info">
              <div class="lt-title">eKYC & Identity Verified</div>
              <div class="lt-time">2026-07-12 10:10</div>
            </div>
          </div>
          
          <div class="lt-step">
            <div class="lt-icon-wrap">
              <div class="lt-icon done">✓</div>
              <div class="lt-connector"></div>
            </div>
            <div class="lt-info">
              <div class="lt-title">AI Authenticity & Fraud Risk Check Passed</div>
              <div class="lt-time">2026-07-12 10:16</div>
            </div>
          </div>

          <div class="lt-step">
            <div class="lt-icon-wrap">
              <div class="lt-icon done">✓</div>
              <div class="lt-connector"></div>
            </div>
            <div class="lt-info">
              <div class="lt-title">Notary Review & Signature Approved</div>
              <div class="lt-time">2026-07-12 12:00</div>
            </div>
          </div>

          <div class="lt-step">
            <div class="lt-icon-wrap">
              <div class="lt-icon done">✓</div>
              <div class="lt-connector"></div>
            </div>
            <div class="lt-info">
              <div class="lt-title">Digital Seal & QR Code Appended</div>
              <div class="lt-time">2026-07-12 12:05</div>
            </div>
          </div>

          <div class="lt-step">
            <div class="lt-icon-wrap">
              <div class="lt-icon current">⏳</div>
              <div class="lt-connector"></div>
            </div>
            <div class="lt-info">
              <div class="lt-title">Sent Secure Copy to Bank</div>
              <div class="lt-time">2026-07-12 12:10</div>
            </div>
          </div>

          <div class="lt-step">
            <div class="lt-icon-wrap">
              <div class="lt-icon pending-lt">✓</div>
            </div>
            <div class="lt-info">
              <div class="lt-title">Loan Approval & Fund Disbursement</div>
              <div class="lt-time">Pending Bank confirmation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── NOTARY DASHBOARD PANELS ───────────────────────────
function renderRequestsPanel(target) {
  target.innerHTML = `
    <div class="panel-card">
      <div class="pc-header"><span class="pc-title">Pending Document Notarization Requests</span></div>
      <div class="pc-body">
        <table class="doc-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Company</th>
              <th>Document</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${state.notaryRequests.filter(r => r.status === 'pending').map(r => {
              const doc = state.documents.find(d => d.id === r.documentId);
              return `
                <tr>
                  <td><code style="font-family:'JetBrains Mono'">${r.requestNumber}</code></td>
                  <td><strong>${r.company}</strong></td>
                  <td>${doc ? doc.name : 'Unknown File'}</td>
                  <td>${r.createdAt}</td>
                  <td>
                    <button class="btn-sm btn-purple" onclick="openNotaryReview('${r.id}')">Perform Verification</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openNotaryReview(reqId) {
  const req = state.notaryRequests.find(r => r.id === reqId);
  const doc = state.documents.find(d => d.id === req.documentId);

  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <h3 style="margin-bottom:20px; font-weight:800;">⚖️ Legal Document Notary Review</h3>
    
    <div class="content-grid-2" style="margin-bottom:20px;">
      <div class="panel-card" style="padding:16px;">
        <h4 style="margin-bottom:12px; font-size:13px;">AI Analysis Panel</h4>
        <div class="ai-status-bar">
          <div class="ai-check pass"><span class="ai-check-icon">✓</span>Face Match: 99.8%</div>
          <div class="ai-check pass"><span class="ai-check-icon">✓</span>Liveness Check: PASS</div>
          <div class="ai-check pass"><span class="ai-check-icon">✓</span>Forgery Detection: CLEAR</div>
          <div class="ai-check proc"><span class="ai-check-icon">⚡</span>Risk Score: ${doc.fraudScore * 100}%</div>
        </div>
        <p style="font-size:12px; color:var(--text-secondary); margin-top:12px;"><strong>OCR Summary:</strong> ${doc.ocrText}</p>
      </div>

      <div class="panel-card" style="padding:16px;">
        <h4 style="margin-bottom:12px; font-size:13px;">Seal Configuration</h4>
        <div class="form-group">
          <label>Add Seal Notes</label>
          <textarea id="notaryNotesInput" placeholder="Verify signature matching Aadhaar and PAN database..." class="input-wrap" style="width:100%; height:60px; font-family:inherit; font-size:12px; padding:8px; border-radius:6px; background:rgba(255,255,255,0.02); color:white; resize:none;"></textarea>
        </div>
        <div class="form-group">
          <label>Sign Digitally (Type signature to simulate key certificate)</label>
          <input type="text" id="signerNameSim" placeholder="Adv. Suresh Mehta" class="input-wrap" style="width:100%; font-family:inherit; font-size:12px; padding:8px; border-radius:6px; background:rgba(255,255,255,0.02); color:white;" />
        </div>
      </div>
    </div>

    <div class="doc-viewer" style="margin-bottom:20px;">
      <div class="doc-viewer-header">
        <strong>📄 DOCUMENT: ${doc.name}</strong>
      </div>
      <div class="doc-watermark">NOTARYCHAIN SECURE</div>
      <div class="doc-page-sim">
        <h4>${doc.name.replace(/_/g, ' ').replace('.pdf', '')}</h4>
        <p>${doc.ocrText}</p>
        <div class="doc-highlight">This document is digitally analyzed for legal signatures.</div>
      </div>
    </div>

    <div style="display:flex; justify-content:flex-end; gap:12px;">
      <button class="btn-ghost-sm" onclick="closeModal()">Cancel</button>
      <button class="btn-sm btn-purple" onclick="approveRequest('${req.id}')">Approve & Sign Digitally</button>
    </div>
  `;
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function approveRequest(reqId) {
  const req = state.notaryRequests.find(r => r.id === reqId);
  const doc = state.documents.find(d => d.id === req.documentId);
  const notes = document.getElementById('notaryNotesInput').value || 'Legal verification passed.';

  // Update request state
  req.status = 'completed';
  req.notaryNotes = notes;
  req.notaryId = 'Adv. Suresh Mehta';

  // Update doc status
  doc.status = 'notarized';
  doc.notarySealApplied = true;
  doc.sealTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  doc.notaryLicense = 'NC-NOTARY-84920';
  doc.certificateNumber = `NC-CERT-${Math.floor(10000 + Math.random() * 90000)}`;
  doc.qrData = `Verified Notary Copy | Cert: ${doc.certificateNumber} | Notary: Adv. Suresh Mehta`;

  // Audit trail entry
  state.auditLogs.unshift({
    id: `a-${Date.now()}`,
    action: 'NOTARY_SEAL_APPLIED',
    details: `Applied seal on ${doc.name}`,
    user: 'Adv. Suresh Mehta',
    time: doc.sealTimestamp,
    hash: doc.blockchainHash
  });

  // Notification
  state.notifications.unshift({
    id: `n-${Date.now()}`,
    title: 'Notary Seal Appended',
    desc: `${doc.name} is digitally sealed and signed by Suresh Mehta.`,
    time: 'Just now',
    unread: true
  });
  renderNotifications();

  closeModal();
  showToast('Document digitally sealed and signed!', 'success');
  loadPanel('dashboard');
}

function renderHistoryPanel(target) {
  target.innerHTML = `
    <div class="panel-card">
      <div class="pc-header"><span class="pc-title">Verification Logs & Certificates</span></div>
      <div class="pc-body">
        <table class="doc-table">
          <thead>
            <tr>
              <th>Certificate ID</th>
              <th>Document</th>
              <th>Company</th>
              <th>Sealed Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${state.notaryRequests.filter(r => r.status === 'completed').map(r => {
              const doc = state.documents.find(d => d.id === r.documentId);
              return `
                <tr>
                  <td><code style="font-family:'JetBrains Mono'">${doc ? doc.certificateNumber : 'N/A'}</code></td>
                  <td>${doc ? doc.name : 'Unknown'}</td>
                  <td>${r.company}</td>
                  <td>${doc ? doc.sealTimestamp : 'N/A'}</td>
                  <td><span class="badge badge-verified">SEALED & CERTIFIED</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── BANK DASHBOARD PANELS ─────────────────────────────
function renderBankDocsPanel(target) {
  target.innerHTML = `
    <div class="panel-card">
      <div class="pc-header"><span class="pc-title">Certified Notary Documents Received</span></div>
      <div class="pc-body">
        <table class="doc-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Notary Certificate</th>
              <th>Audit Verification</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${state.documents.filter(d => d.notarySealApplied).map(d => `
              <tr>
                <td>
                  <div class="doc-name">
                    <div class="doc-file-icon">📄</div>
                    <div>
                      <strong>${d.name}</strong><br/>
                      <small style="color:var(--text-muted)">Uploaded by ${d.uploadedBy}</small>
                    </div>
                  </div>
                </td>
                <td><code style="font-family:'JetBrains Mono'">${d.certificateNumber}</code></td>
                <td><span class="badge badge-verified">✓ AUTHENTIC</span></td>
                <td>
                  <button class="btn-sm btn-green" onclick="openBankReview('${d.id}')">Perform Loan Review</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openBankReview(docId) {
  const doc = state.documents.find(d => d.id === docId);

  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <h3 style="margin-bottom:20px; font-weight:800;">🏦 Loan Application Bank Review</h3>
    
    <div class="content-grid-2" style="margin-bottom:20px;">
      <div class="panel-card" style="padding:16px;">
        <h4 style="margin-bottom:12px; font-size:13px;">Digital Seals & Identity</h4>
        <p style="font-size:12px; color:var(--text-secondary); margin-bottom:8px;"><strong>Notary:</strong> ${doc.notaryName}</p>
        <p style="font-size:12px; color:var(--text-secondary); margin-bottom:8px;"><strong>License:</strong> ${doc.notaryLicense}</p>
        <p style="font-size:12px; color:var(--text-secondary); margin-bottom:8px;"><strong>Sealed Timestamp:</strong> ${doc.sealTimestamp}</p>
        <p style="font-size:12px; color:var(--text-secondary); margin-bottom:8px;"><strong>Certificate:</strong> ${doc.certificateNumber}</p>
      </div>

      <div class="panel-card" style="padding:16px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
        <div class="seal-circle">
          <span>APPROVED</span>
          <span>NC SECURE</span>
        </div>
        <div class="seal-id">ID: NC-84902</div>
      </div>
    </div>

    <div class="doc-viewer" style="margin-bottom:20px;">
      <div class="doc-viewer-header">
        <strong>📄 PREVIEW: ${doc.name}</strong>
      </div>
      <div class="doc-watermark">HDFC LEGAL AUDIT</div>
      <div class="doc-page-sim">
        <h4>${doc.name.replace(/_/g, ' ').replace('.pdf', '')}</h4>
        <p>${doc.ocrText}</p>
        <div class="doc-highlight">Notary Seal validated dynamically. Cryptographic hash matches immutable ledger.</div>
      </div>
    </div>

    <div style="display:flex; justify-content:flex-end; gap:12px;">
      <button class="btn-ghost-sm" onclick="closeModal()">Cancel</button>
      <button class="btn-sm btn-green" onclick="approveLoan('${doc.id}')">Verify & Approve Loan</button>
    </div>
  `;
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function approveLoan(docId) {
  const doc = state.documents.find(d => d.id === docId);
  doc.status = 'verified_by_bank';

  // Audit Log
  state.auditLogs.unshift({
    id: `a-${Date.now()}`,
    action: 'LOAN_APPROVED',
    details: `HDFC Bank approved loan request NC-REQ-10294 using verified ${doc.name}`,
    user: 'Bank Officer HDFC',
    time: new Date().toISOString().slice(0, 19).replace('T', ' '),
    hash: doc.blockchainHash
  });

  // Notification
  state.notifications.unshift({
    id: `n-${Date.now()}`,
    title: 'Loan Approved',
    desc: `Loan linked to ${doc.name} has been processed successfully.`,
    time: 'Just now',
    unread: true
  });
  renderNotifications();

  closeModal();
  showToast('Loan approved! Notifications sent to Company.', 'success');
  loadPanel('dashboard');
}

function renderLoansPanel(target) {
  target.innerHTML = `
    <div class="panel-card">
      <div class="pc-header"><span class="pc-title">Processed Loan Records</span></div>
      <div class="pc-body">
        <table class="doc-table">
          <thead>
            <tr>
              <th>Loan Reference</th>
              <th>Applicant</th>
              <th>Verification Method</th>
              <th>Disbursement Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>NC-LN-84920</code></td>
              <td>TechCorp Solutions Pvt. Ltd.</td>
              <td><span class="badge badge-verified">QR VERIFIED</span></td>
              <td><span class="badge badge-approved">DISBURSED</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── SUPER ADMIN DASHBOARD PANELS ──────────────────────
function renderUsersPanel(target) {
  target.innerHTML = `
    <div class="panel-card">
      <div class="pc-header"><span class="pc-title">System User Management</span></div>
      <div class="pc-body">
        <table class="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Verification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${state.users.map(u => `
              <tr>
                <td>
                  <div style="display:flex; align-items:center; gap:10px;">
                    <div class="user-avatar-sm" style="background:var(--blue-600)">${u.name.split(' ').map(n=>n[0]).join('')}</div>
                    <strong>${u.name}</strong>
                  </div>
                </td>
                <td>${u.email}</td>
                <td><span class="badge badge-${u.role === 'admin' ? 'rejected' : 'pending'}">${u.role.toUpperCase()}</span></td>
                <td><span class="badge badge-verified">${u.verification}</span></td>
                <td>
                  <button class="btn-sm btn-ghost-sm" onclick="showToast('User profile settings active', 'info')">Modify</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderFraudPanel(target) {
  target.innerHTML = `
    <div class="panel-card">
      <div class="pc-header"><span class="pc-title">AI Real-time Fraud Monitor Feed</span></div>
      <div class="pc-body">
        <div class="fraud-feed" style="max-height:none;">
          <div class="fraud-item high" style="margin-bottom:12px; padding:20px;">
            <div style="display:flex; justify-content:between; margin-bottom:8px;">
              <span class="fi-sev sev-high">High Risk Score (85%)</span>
              <strong style="margin-left:auto;">Target: Property_Deed_Mumbai.pdf</strong>
            </div>
            <p style="margin-bottom:12px;">AI analysis matched signatures against government databases and detected a high probability of layout modification/tampering.</p>
            <div style="display:flex; gap:8px;">
              <button class="btn-sm btn-red" onclick="showToast('Document flagged & blocked', 'error')">Flag & Block File</button>
              <button class="btn-sm btn-blue" onclick="showToast('Manually marked safe', 'success')">Dismiss Flag</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAuditPanel(target) {
  target.innerHTML = `
    <div class="panel-card">
      <div class="pc-header"><span class="pc-title">Immutable Audit Ledger Storage</span></div>
      <div class="pc-body">
        <div class="audit-timeline">
          ${state.auditLogs.map(log => `
            <div class="audit-item">
              <div class="ai-dot-wrap">
                <div class="ai-dot" style="background:var(--blue-500)"></div>
                <div class="ai-line"></div>
              </div>
              <div class="ai-content">
                <div class="ai-title"><strong>${log.action.replace(/_/g, ' ')}</strong></div>
                <div class="ai-desc">${log.details}</div>
                <div class="ai-time">Performed by: ${log.user} · ${log.time}</div>
                <div class="hash-display" style="margin-top:6px;">BLOCK HASH: ${log.hash}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ── UTILITY VIEWER ────────────────────────────────────
function viewDocDetails(docId) {
  const doc = state.documents.find(d => d.id === docId);
  if (!doc) return;

  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <h3 style="margin-bottom:20px; font-weight:800;">📄 Document Integrity Details</h3>
    
    <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px;">
      <p><strong>Name:</strong> ${doc.name}</p>
      <p><strong>SHA256 File Hash:</strong> <code style="font-family:'JetBrains Mono'">${doc.blockchainHash}</code></p>
      <p><strong>Size:</strong> ${doc.size}</p>
      <p><strong>Status:</strong> <span class="badge badge-${doc.status.replace(/_/g, '-')}">${doc.status.replace(/_/g, ' ')}</span></p>
    </div>

    ${doc.notarySealApplied ? `
      <div style="background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.2); padding:16px; border-radius:8px; margin-bottom:20px;">
        <h4 style="color:var(--green-400); margin-bottom:8px; font-size:14px;">✓ Legally Sealed & Certified</h4>
        <p style="font-size:12px; color:var(--text-secondary); margin-bottom:6px;"><strong>Notary Signature:</strong> ${doc.notaryName}</p>
        <p style="font-size:12px; color:var(--text-secondary); margin-bottom:6px;"><strong>License Number:</strong> ${doc.notaryLicense}</p>
        <p style="font-size:12px; color:var(--text-secondary); margin-bottom:6px;"><strong>Certificate Number:</strong> ${doc.certificateNumber}</p>
        <p style="font-size:12px; color:var(--text-secondary);"><strong>Timestamp:</strong> ${doc.sealTimestamp}</p>
      </div>
      
      <div class="qr-display">
        <div class="qr-code-svg">
          [QR SECURE]
        </div>
        <p style="font-size:11px; color:var(--text-muted)">Scan to verify authenticity instantly on NotaryChain Ledger</p>
      </div>
    ` : `
      <div style="background:rgba(245,158,11,0.05); border:1px solid rgba(245,158,11,0.2); padding:16px; border-radius:8px;">
        <h4 style="color:var(--amber-400); margin-bottom:8px; font-size:14px;">⏳ Awaiting Notary Seal</h4>
        <p style="font-size:12px; color:var(--text-secondary);">This document is signed and validated by AI, awaiting formal notary authentication stamp.</p>
      </div>
    `}

    <div style="display:flex; justify-content:flex-end; margin-top:20px;">
      <button class="btn-primary" onclick="closeModal()">Close Details</button>
    </div>
  `;
  document.getElementById('modalOverlay').classList.remove('hidden');
}

// ── NOTIFICATIONS RENDER ──────────────────────────────
function showNotifications() {
  document.getElementById('notificationPanel').classList.remove('hidden');
}

function closeNotifications() {
  document.getElementById('notificationPanel').classList.add('hidden');
}

function renderNotifications() {
  const list = document.getElementById('notifList');
  if (!list) return;
  list.innerHTML = '';

  state.notifications.forEach(n => {
    const item = document.createElement('div');
    item.className = `notif-item ${n.unread ? 'unread' : ''}`;
    item.innerHTML = `
      <div class="ni-icon">🔔</div>
      <div class="ni-body">
        <div class="ni-title">${n.title}</div>
        <div class="ni-desc">${n.desc}</div>
        <div class="ni-time">${n.time}</div>
      </div>
    `;
    list.appendChild(item);
  });
}

function showSettings() {
  showToast('Settings configuration dashboard loaded', 'info');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}
