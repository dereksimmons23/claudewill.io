/**
 * Spend Dashboard — Tech budget transparency
 * Fetches live data from /.netlify/functions/spend-data
 * Falls back to defaults if API unavailable
 */

const MONTHLY_REVENUE = 10000;
const FIVE_PERCENT_THRESHOLD = MONTHLY_REVENUE * 0.05; // $500

// Service metadata — updated with real costs from API
const SERVICE_META = {
  anthropic: {
    name: 'Anthropic',
    plan: 'Max + API',
    status: 'active',
    notes: 'Claude Max: $100/month + API usage',
  },
  stripe: {
    name: 'Stripe',
    plan: 'Pay-per-transaction',
    status: 'active',
    notes: 'Coach D transactions: 2.2% + $0.30',
  },
  netlify: {
    name: 'Netlify',
    plan: 'Free',
    status: 'active',
    notes: 'Functions + static hosting, free tier',
  },
  supabase: {
    name: 'Supabase',
    plan: 'Free',
    status: 'active',
    notes: 'PostgreSQL, ~250MB, free tier',
  },
  cloudflare: {
    name: 'Cloudflare',
    plan: 'Free',
    status: 'active',
    notes: 'Workers + Pages, free tier',
  },
  github: {
    name: 'GitHub',
    plan: 'Free',
    status: 'active',
    notes: 'Repos + Actions, free tier',
  },
  gemini: {
    name: 'Google Gemini',
    plan: 'Free tier',
    status: 'active',
    notes: 'Overnight agents, quota-limited',
  },
  perplexity: {
    name: 'Perplexity',
    plan: 'API',
    status: 'active',
    notes: 'Overnight agents, manual verification',
  },
  mistral: {
    name: 'Mistral',
    plan: 'API',
    status: 'active',
    notes: 'Overnight agents, manual verification',
  },
  cohere: {
    name: 'Cohere',
    plan: 'Free tier',
    status: 'active',
    notes: 'Reranking, free tier',
  },
  huggingface: {
    name: 'HuggingFace',
    plan: 'Free tier',
    status: 'active',
    notes: 'Inference + training, free tier',
  },
};

let SERVICES = {};

// ═══════════════════════════════════════════════════════════════════════════
// DATA AGGREGATION
// ═══════════════════════════════════════════════════════════════════════════

function calculateMetrics() {
  const totalSpend = Object.values(SERVICES).reduce((sum, s) => sum + s.cost, 0);
  const budgetPct = Math.round((totalSpend / FIVE_PERCENT_THRESHOLD) * 100);
  const remaining = FIVE_PERCENT_THRESHOLD - totalSpend;
  const isOverBudget = remaining < 0;

  return {
    totalSpend,
    threshold: FIVE_PERCENT_THRESHOLD,
    remaining,
    budgetPct,
    isOverBudget,
  };
}

function getServiceStatus(service) {
  const status = service.status || 'unknown';
  if (status === 'active') return { dot: 'dot-green', label: 'Active' };
  if (status === 'inactive') return { dot: 'dot-dim', label: 'Inactive' };
  return { dot: 'dot-amber', label: 'Unknown' };
}

// ═══════════════════════════════════════════════════════════════════════════
// DOM RENDERING (safe methods)
// ═══════════════════════════════════════════════════════════════════════════

function renderDate() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  document.getElementById('topbar-date').textContent = dateStr + ' at ' + timeStr;
}

function renderMetrics() {
  const metrics = calculateMetrics();
  const totalEl = document.getElementById('total-spend');
  const thresholdEl = document.getElementById('threshold-status');
  const budgetEl = document.getElementById('budget-pct');

  totalEl.textContent = '$' + metrics.totalSpend.toFixed(2);
  totalEl.className = metrics.isOverBudget ? 'm-value red' : 'm-value gold';

  document.getElementById('total-sub').textContent = Object.keys(SERVICES).length + ' services';

  thresholdEl.textContent = '$' + metrics.threshold.toFixed(2);
  const thresholdPct = Math.round((metrics.totalSpend / metrics.threshold) * 100);
  document.getElementById('threshold-sub').textContent = thresholdPct + '% of 5% cap';

  budgetEl.textContent = metrics.budgetPct + '%';
  budgetEl.className = metrics.isOverBudget ? 'm-value red' : 'm-value green';
  document.getElementById('budget-sub').textContent = metrics.isOverBudget
    ? 'over by $' + Math.abs(metrics.remaining).toFixed(2)
    : '$' + metrics.remaining.toFixed(2) + ' remaining';
}

function renderAlerts() {
  const metrics = calculateMetrics();
  const container = document.getElementById('alerts-container');
  container.textContent = '';

  if (metrics.isOverBudget) {
    const alert = document.createElement('div');
    alert.className = 'alert-box';
    const label = document.createElement('div');
    label.className = 'alert-label';
    label.textContent = '⚠️ Over Budget';
    alert.appendChild(label);
    const msg = document.createElement('div');
    msg.textContent = 'Monthly spend ($' + metrics.totalSpend.toFixed(2) + ') exceeds 5% threshold ($' + metrics.threshold.toFixed(2) + '). Over by $' + Math.abs(metrics.remaining).toFixed(2) + '.';
    alert.appendChild(msg);
    container.appendChild(alert);
  }

  const budgetUsage = (metrics.totalSpend / metrics.threshold) * 100;
  if (budgetUsage >= 80 && budgetUsage < 100) {
    const alert = document.createElement('div');
    alert.className = 'alert-box warning';
    const label = document.createElement('div');
    label.className = 'alert-label';
    label.textContent = '⚡ Approaching Budget';
    alert.appendChild(label);
    const msg = document.createElement('div');
    msg.textContent = 'Using ' + budgetUsage.toFixed(0) + '% of monthly tech budget. $' + metrics.remaining.toFixed(2) + ' remaining.';
    alert.appendChild(msg);
    container.appendChild(alert);
  }

  // Check for unverified external APIs
  const unverified = ['Perplexity', 'Mistral'];
  const hasUnverified = unverified.some(s => Object.values(SERVICES).some(svc => svc.name.includes(s)));
  if (hasUnverified) {
    const alert = document.createElement('div');
    alert.className = 'alert-box warning';
    const label = document.createElement('div');
    label.className = 'alert-label';
    label.textContent = 'ℹ️ No Spend Caps Set';
    alert.appendChild(label);
    const msg = document.createElement('div');
    msg.textContent = 'Perplexity and Mistral have no spend caps configured. Review account settings to prevent overages.';
    alert.appendChild(msg);
    container.appendChild(alert);
  }
}

function renderServiceStatus() {
  const container = document.getElementById('service-status');
  container.textContent = '';

  Object.entries(SERVICES).forEach(function(entry) {
    const key = entry[0];
    const service = entry[1];
    const status = getServiceStatus(service);
    const cell = document.createElement('div');
    cell.className = 'status-cell';

    const dot = document.createElement('div');
    dot.className = 'dot ' + status.dot;
    cell.appendChild(dot);

    const label = document.createElement('div');
    label.className = 's-label';
    label.textContent = service.name;
    cell.appendChild(label);

    const detail = document.createElement('div');
    detail.className = 's-detail';
    detail.textContent = '$' + service.cost.toFixed(0);
    cell.appendChild(detail);

    container.appendChild(cell);
  });
}

function renderServiceTable() {
  const tbody = document.getElementById('service-table-body');
  tbody.textContent = '';

  Object.entries(SERVICES).forEach(function(entry) {
    const key = entry[0];
    const service = entry[1];
    const status = getServiceStatus(service);
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.className = 'service-name';
    nameCell.textContent = service.name;
    row.appendChild(nameCell);

    const planCell = document.createElement('td');
    planCell.textContent = service.plan;
    row.appendChild(planCell);

    const costCell = document.createElement('td');
    costCell.className = 'service-cost';
    costCell.textContent = '$' + service.cost.toFixed(2);
    row.appendChild(costCell);

    const statusCell = document.createElement('td');
    statusCell.className = 'service-status';
    const dot = document.createElement('div');
    dot.className = 'dot ' + status.dot;
    dot.style.margin = '0 auto';
    statusCell.appendChild(dot);
    row.appendChild(statusCell);

    const notesCell = document.createElement('td');
    notesCell.style.fontSize = '0.75rem';
    notesCell.style.color = 'var(--text-dim)';
    notesCell.textContent = service.notes;
    row.appendChild(notesCell);

    tbody.appendChild(row);
  });
}

function renderSparklines() {
  // Placeholder: actual implementation would fetch Anthropic CSV
  const section = document.getElementById('anthropic-section');
  section.style.display = 'block';

  // Mock daily data (7 days, Max and API)
  const maxDays = [100, 100, 100, 100, 100, 100, 100];
  const apiDays = [5, 8, 12, 6, 15, 10, 8];

  renderSparkline('spark-max', maxDays);
  renderSparkline('spark-api', apiDays);

  const maxSum = maxDays.reduce(function(a, b) { return a + b; }, 0);
  const apiSum = apiDays.reduce(function(a, b) { return a + b; }, 0);

  document.getElementById('spark-max-total').textContent = '$' + maxSum.toFixed(2);
  document.getElementById('spark-api-total').textContent = '$' + apiSum.toFixed(2);
}

function renderSparkline(elementId, data) {
  const container = document.getElementById(elementId);
  if (!container) return;
  container.textContent = '';

  const max = Math.max.apply(null, data);
  const height = 20;

  data.forEach(function(value) {
    const bar = document.createElement('div');
    bar.className = value === 0 ? 'spark-bar zero' : 'spark-bar';
    if (value > 0) {
      bar.style.height = (value / max) * height + 'px';
    }
    container.appendChild(bar);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// FETCH LIVE DATA
// ═══════════════════════════════════════════════════════════════════════════

async function fetchSpendData() {
  try {
    const res = await fetch('/.netlify/functions/spend-data');
    if (!res.ok) throw new Error('API error: ' + res.status);

    const data = await res.json();
    const liveSpend = data.services || {};

    // Merge API costs with metadata
    Object.keys(SERVICE_META).forEach(function(key) {
      const cost = liveSpend[key];
      SERVICES[key] = Object.assign(
        {},
        SERVICE_META[key],
        { cost: cost !== null && cost !== undefined ? cost : 0 }
      );
    });

    return true;
  } catch (error) {
    console.warn('Spend API failed, using defaults:', error.message);

    // Fallback: zero costs (all free tier)
    Object.keys(SERVICE_META).forEach(function(key) {
      SERVICES[key] = Object.assign({}, SERVICE_META[key], { cost: 0 });
    });

    // Add back Anthropic Max cost manually since it doesn't come from API
    if (SERVICES.anthropic) {
      SERVICES.anthropic.cost = 100;
    }

    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════

async function init() {
  await fetchSpendData();

  renderDate();
  renderMetrics();
  renderAlerts();
  renderServiceStatus();
  renderServiceTable();
  renderSparklines();

  // Update date/time every minute
  setInterval(function() { renderDate(); }, 60000);

  // Refresh spend data every 5 minutes
  setInterval(function() {
    fetchSpendData().then(function() {
      renderMetrics();
      renderAlerts();
      renderServiceStatus();
      renderServiceTable();
    });
  }, 5 * 60 * 1000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
