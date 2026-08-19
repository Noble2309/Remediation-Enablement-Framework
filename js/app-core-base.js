  'use strict';

  const data = window.PROTOTYPE_DATA;
  const stateApi = window.DemoState;
  const main = document.getElementById('main-content');
  const toastRegion = document.getElementById('toast-region');
  const resetButton = document.getElementById('reset-demo');

  const acceptanceDrafts = new Map();
  const retestDrafts = new Map();
  const reviewDrafts = new Map();

  const STATUS_LABELS = {
    'Open': 'Open',
    'Risk Accepted': 'Risk Accepted · Vulnerability Remains',
    'Retest Requested': 'Retest Requested · Awaiting Validation',
    'Verified / Remediated': 'Verified · Vulnerability Remediated',
    'Partially Remediated': 'Partially Remediated',
    'Unresolved': 'Unresolved',
    'Unable to Validate': 'Unable to Validate',
    'Changed Condition': 'Changed Condition'
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function formatBytes(bytes) {
    const value = Number(bytes || 0);
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  function todayDisplay() {
    const now = new Date();
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(now);
  }

  function todayInput() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function inputDateToDisplay(value) {
    if (!value) return '';
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return value;
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(y, m - 1, d));
  }

  function findingById(id) {
    return data.findings.find((finding) => finding.id === id) || null;
  }

  function currentStatus(id) {
    return stateApi.getFinding(id)?.status || 'Open';
  }

  function statusClass(status) {
    const map = {
      'Open': 'status-open',
      'Risk Accepted': 'status-accepted',
      'Retest Requested': 'status-retest',
      'Verified / Remediated': 'status-verified',
      'Partially Remediated': 'status-partial',
      'Unresolved': 'status-unresolved',
      'Unable to Validate': 'status-unable',
      'Changed Condition': 'status-changed'
    };
    return map[status] || 'status-open';
  }

  function severityClass(severity) {
    return `severity-${String(severity).toLowerCase()}`;
  }

  function badgeStatus(status, severity = null) {
    const severityDriven = ['Open', 'Risk Accepted', 'Retest Requested', 'Partially Remediated', 'Unresolved'].includes(status) && severity;
    const cssClass = severityDriven
      ? `status-severity-${String(severity).toLowerCase()}`
      : statusClass(status);
    return `<span class="status-badge ${cssClass}">${escapeHtml(STATUS_LABELS[status] || status)}</span>`;
  }

  function badgeSeverity(severity) {
    return `<span class="severity-badge ${severityClass(severity)}">${escapeHtml(severity)}</span>`;
  }

  function showToast(message, kind = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${kind}`;
    toast.textContent = message;
    toastRegion.appendChild(toast);
    window.setTimeout(() => toast.classList.add('toast-visible'), 10);
    window.setTimeout(() => {
      toast.classList.remove('toast-visible');
      window.setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  function setActiveNav(section) {
    document.querySelectorAll('[data-nav]').forEach((item) => {
      item.classList.toggle('active', item.dataset.nav === section);
    });
  }

  function routeParts() {
    const raw = window.location.hash.replace(/^#\/?/, '');
    return raw ? raw.split('/').filter(Boolean) : ['overview'];
  }

  function goto(path) {
    window.location.hash = path.startsWith('/') ? `#${path}` : `#/${path}`;
  }

  function renderPage(content, options = {}) {
    main.innerHTML = content;
    setActiveNav(options.nav || '');
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function metricCard(label, value, detail) {
    return `
      <div class="metric-card">
        <span class="metric-label">${escapeHtml(label)}</span>
        <strong class="metric-value">${escapeHtml(value)}</strong>
        <span class="metric-detail">${escapeHtml(detail)}</span>
      </div>
    `;
  }

  function counts() {
    const workflow = stateApi.getAll();
    const result = { open: 0, accepted: 0, retest: 0, verified: 0, other: 0 };
    Object.values(workflow).forEach((item) => {
      if (item.status === 'Open') result.open += 1;
      else if (item.status === 'Risk Accepted') result.accepted += 1;
      else if (item.status === 'Retest Requested') result.retest += 1;
      else if (item.status === 'Verified / Remediated') result.verified += 1;
      else result.other += 1;
    });
    return result;
  }
