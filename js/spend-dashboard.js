/**
 * Spend Dashboard — Tech budget transparency
 * Aggregates all services, APIs, and subscriptions
 * Data sources: Anthropic, Netlify, Supabase, Cloudflare, Stripe, external APIs
 */

// ═══════════════════════════════════════════════════════════════════════════
// HARDCODED DATA (until live API wiring)
// ═══════════════════════════════════════════════════════════════════════════

const MONTHLY_REVENUE = 10000; // Conservative estimate for 5% calculation
const FIVE_PERCENT_THRESHOLD = MONTHLY_REVENUE * 0.05; // $500

const SERVICES = {
  anthropic: {
    name: 'Anthropic',
    plan: 'Max + API',
    cost: 100,
    status: 'active',
    notes: 'Max: $100/month, API: ~$5-15/month, Haiku for ops, research varies',
  },
  netlify: {
    name: 'Netlify',
    plan: 'Free',
    cost: 0,
    status: 'active',
    notes: 'Functions + static hosting, under free tier limits',
  },
  supabase: {
    name: 'Supabase',
    plan: 'Free',
    cost: 0,
    status: 'active',
    notes: 'PostgreSQL, ~250MB, session_memories, under 1GB free limit',
  },
  cloudflare: {
    name: 'Cloudflare',
    plan: 'Free',
    cost: 0,
    status: 'active',
    notes: 'Workers + Pages, no add-ons',
  },
  github: {
    name: 'GitHub',
    plan: 'Free',
    cost: 0,
    status: 'active',
    notes: 'Repos + Actions, private repos, under free limits',
  },
  stripe: {
    name: 'Stripe',
    plan: 'Pay-per-transaction',
    cost: 0,
    status: 'inactive',
    notes: 'Coach D only, ~2.2% + $0.30 per transaction, typically $0-5/month',
  },
  gemini: {
    name: 'Google Gemini',
    plan: 'Free tier',
    cost: 0,
    status: 'active',
    notes: 'Overnight agents, rate limited, no spend cap set',
  },
  perplexity: {
    name: 'Perplexity',
    plan: 'Unknown',
    cost: 0,
    status: 'active',
    notes: 'Overnight agents, no spend cap verified',
  },
  mistral: {
    name: 'Mistral',
    plan: 'Unknown',
    cost: 0,
    status: 'active',
    notes: 'Overnight agents, no spend cap verified',
  },
  cohere: {
    name: 'Cohere',
    plan: 'Free tier',
    cost: 0,
    status: 'active',
    notes: 'Overnight agents, reranking, under free limits',
  },
  huggingface: {
    name: 'HuggingFace',
    plan: 'Free tier',
    cost: 0,
    status: 'active',
    notes: 'Inference, training infrastructure, free tier',
  },
};

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
// INIT
// ═══════════════════════════════════════════════════════════════════════════

function init() {
  renderDate();
  renderMetrics();
  renderAlerts();
  renderServiceStatus();
  renderServiceTable();
  renderSparklines();

  // Update date/time every minute
  setInterval(function() { renderDate(); }, 60000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
