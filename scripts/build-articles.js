#!/usr/bin/env node

/**
 * Article Engine — claudewill.io
 *
 * Converts markdown content files to HTML articles.
 * Reads from content/, writes to being-claude/ (and future series dirs).
 * Generates prev/next navigation, updates sitemap, registry, llms.txt.
 *
 * Usage: node scripts/build-articles.js
 * Netlify build: node scripts/build-articles.js && node scripts/compile-prompt.js
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const TEMPLATE_DIR = path.join(ROOT, 'templates');

// ── Markdown config ──────────────────────────
// Don't escape HTML — we use inline evidence tags (<span class="observation-tag">)
marked.setOptions({
  breaks: false,
  gfm: true
});

// Custom renderer: section breaks (--- in markdown) become styled dividers
const renderer = new marked.Renderer();
renderer.hr = function () {
  return '<div class="section-break">&mdash;</div>\n';
};
marked.use({ renderer });

// ── Load all articles from content/ ──────────
function loadArticles(seriesDir) {
  const dir = path.join(CONTENT_DIR, seriesDir);
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const { data, content } = matter(raw);
      // gray-matter auto-parses dates to Date objects — normalize back to string
      if (data.date instanceof Date) {
        data.date = data.date.toISOString().split('T')[0];
      }
      return { ...data, content, filename: f };
    })
    .filter(a => a.status === 'published')
    .sort((a, b) => a.number - b.number);
}

// ── Build HTML from markdown + frontmatter ───
function buildArticle(article, articles, seriesSlug) {
  const idx = articles.findIndex(a => a.slug === article.slug);
  const prev = idx > 0 ? articles[idx - 1] : null;
  const next = idx < articles.length - 1 ? articles[idx + 1] : null;

  // Convert markdown body to HTML
  let bodyHtml = marked.parse(article.content);

  // Extract transparency, references, and book-source from special markers
  let transparencyHtml = '';
  let referencesHtml = '';
  let bookSourceHtml = '';

  // Parse [^transparency], [^references], [^book-source] blocks
  const sections = article.content.split(/\[\^(transparency|references|book-source)\]\n/);
  if (sections.length > 1) {
    // Re-parse: main body is everything before first marker
    const mainBody = sections[0];
    bodyHtml = marked.parse(mainBody);

    for (let i = 1; i < sections.length; i += 2) {
      const type = sections[i];
      const block = sections[i + 1] || '';
      if (type === 'transparency') transparencyHtml = buildTransparencyBox(block);
      if (type === 'references') referencesHtml = buildReferences(block);
      if (type === 'book-source') bookSourceHtml = buildBookSource(block, seriesSlug);
    }
  }

  // Build prev/next nav
  let navHtml = '';
  if (prev || next) {
    navHtml = '<nav class="article-nav" aria-label="Article navigation">';
    if (prev) {
      navHtml += `<a href="/${seriesSlug}/${prev.slug}/" class="nav-prev">&larr; ${prev.title}</a>`;
    } else {
      navHtml += '<span></span>';
    }
    if (next) {
      navHtml += `<a href="/${seriesSlug}/${next.slug}/" class="nav-next">${next.title} &rarr;</a>`;
    } else {
      navHtml += '<span></span>';
    }
    navHtml += '</nav>';
  }

  // Series position
  const positionText = `${article.series} #${article.number}`;

  // Format date
  const dateObj = new Date(article.date + 'T12:00:00');
  const dateStr = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return buildTemplate({
    title: article.title,
    series: article.series,
    seriesSlug,
    number: article.number,
    totalArticles: articles.length,
    date: article.date,
    dateFormatted: dateStr,
    position: positionText,
    description: article.description,
    subtitle: article.subtitle || article.description,
    author: article.author,
    editor: article.editor,
    slug: article.slug,
    tags: article.tags || [],
    bodyHtml,
    transparencyHtml,
    referencesHtml,
    bookSourceHtml,
    navHtml
  });
}

// ── Transparency box builder ─────────────────
function buildTransparencyBox(block) {
  const html = marked.parse(block);
  return `<div class="transparency-box">
      <h3>Transparency</h3>
      ${html}
    </div>`;
}

// ── References builder ───────────────────────
function buildReferences(block) {
  const lines = block.trim().split('\n').filter(l => l.match(/^\d+\./));
  if (!lines.length) return '';

  let items = '';
  lines.forEach(line => {
    const match = line.match(/^(\d+)\.\s+(.*?)\s+`(\w+)`$/);
    if (match) {
      const [, num, text, type] = match;
      items += `<li id="ref-${num}">
          <span class="ref-number">${num}</span>
          ${text} <span class="ref-type ref-type-${type}">${type}</span>
        </li>\n`;
    }
  });

  return `<div class="references">
      <h2>References</h2>
      <ol class="ref-list">${items}</ol>
    </div>`;
}

// ── Book source builder ──────────────────────
function buildBookSource(block, seriesSlug) {
  const text = block.trim();
  return `<div class="book-source">
      <strong>Note:</strong> ${text} <a href="/${seriesSlug}/">More from Being Claude &rarr;</a>
    </div>`;
}

// ── HTML template ────────────────────────────
function buildTemplate(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-7R5X5SJDVT"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-7R5X5SJDVT');
  </script>

  <title>${data.title} | ${data.series} | claudewill</title>
  <meta name="description" content="${escHtml(data.description)}">
  <meta name="keywords" content="${data.tags.join(', ')}">
  <meta name="author" content="${data.author}; edited by ${data.editor}">

  <!-- Open Graph -->
  <meta property="og:title" content="${data.title} | ${data.series} | claudewill">
  <meta property="og:description" content="${escHtml(data.description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://claudewill.io/${data.seriesSlug}/${data.slug}/">
  <meta property="og:image" content="https://claudewill.io/images/og-preview.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="claudewill">
  <meta property="article:author" content="${data.author}">
  <meta property="article:published_time" content="${data.date}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${data.title} | ${data.series} | claudewill">
  <meta name="twitter:description" content="${escHtml(data.description)}">
  <meta name="twitter:image" content="https://claudewill.io/images/og-preview.png">

  <link rel="canonical" href="https://claudewill.io/${data.seriesSlug}/${data.slug}/">

  <!-- Schema.org Article -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "headline": "${escJson(data.title)}",
    "description": "${escJson(data.description)}",
    "author": {
      "@type": "Thing",
      "name": "${escJson(data.author)}",
      "description": "Large language model by Anthropic (claude-opus-4-6)",
      "url": "https://www.anthropic.com/claude"
    },
    "editor": {
      "@type": "Person",
      "name": "Derek Claude Simmons",
      "url": "https://claudewill.io/derek",
      "affiliation": {
        "@type": "Organization",
        "name": "CW Strategies"
      },
      "sameAs": [
        "https://orcid.org/0009-0002-0594-1494",
        "https://www.linkedin.com/in/dereksimm/"
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "CW Strategies",
      "url": "https://claudewill.io"
    },
    "datePublished": "${data.date}",
    "dateModified": "${data.date}",
    "url": "https://claudewill.io/${data.seriesSlug}/${data.slug}/",
    "isPartOf": {
      "@type": "CreativeWorkSeries",
      "name": "${escJson(data.series)}",
      "url": "https://claudewill.io/${data.seriesSlug}/"
    },
    "about": ${JSON.stringify(data.tags)}
  }
  </script>

  <link rel="icon" type="image/svg+xml" href="/favicon-cw-dark.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/shared-nav.css">
  <link rel="stylesheet" href="/css/porch-widget.css">
  <link rel="stylesheet" href="/css/article.css">
</head>
<body>

  <div class="container">
    <header class="article-header">
      <a href="/${data.seriesSlug}" class="back-link">&larr; the hallway</a>

      <div class="series-label">
        <a href="/${data.seriesSlug}/">${data.series}</a> &middot; Essay ${data.number} of ${data.totalArticles}
      </div>

      <h1>${data.title}</h1>
      <p class="subtitle">${escHtml(data.subtitle)}</p>

      <p class="byline"><strong>${data.author}</strong> (Anthropic) &middot; edited by <a href="/derek" style="color: var(--text); text-decoration: none;">${data.editor}</a></p>
      <p class="dateline">${data.dateFormatted} &middot; ${data.position}</p>
    </header>

    <div class="article-body">
${data.bodyHtml}
    </div>

    <div class="closing-mark">*</div>

    ${data.transparencyHtml}
    ${data.referencesHtml}
    ${data.bookSourceHtml}
    ${data.navHtml}

    <div style="text-align:center; padding: 2rem 0 1rem;">
      <p style="font-size:0.85rem; color:var(--dim); letter-spacing:0.08em; margin-bottom:1rem;">keep going</p>
      <div id="custom-substack-embed"></div>
    </div>

    <footer class="footer">
      <p class="footer-note">Built by <a href="/derek">Derek</a><a href="/" class="hw">*</a><a href="/being-claude">Claude</a> &middot; &copy; 2026 CW Strategies LLC</p>
      <p class="footer-note"><a href="/standard">the standard</a> &middot; <a href="/privacy">privacy</a> &middot; <a href="/terms">terms</a></p>
    </footer>
  </div>

  <script>
    window.CustomSubstackWidget = {
      substackUrl: "standardderek.substack.com",
      placeholder: "your email",
      buttonText: "subscribe",
      theme: "custom",
      colors: {
        primary: "#d4a84b",
        input: "#f3f4f6",
        email: "#0a1628",
        text: "#fafaf8"
      }
    };
  </script>
  <script src="https://substackapi.com/widget.js" async></script>
  <script src="/js/cw-link-renderer.js"></script>
  <script src="/js/porch-widget.js" defer></script>
  <script src="/js/shared-nav.js"></script>
</body>
</html>`;
}

// ── Helpers ───────────────────────────────────
function escHtml(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escJson(s) {
  return (s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// ── Main ─────────────────────────────────────
function main() {
  const series = [
    { dir: 'being-claude', slug: 'being-claude', output: 'being-claude' }
  ];

  let totalBuilt = 0;

  series.forEach(s => {
    const articles = loadArticles(s.dir);
    if (!articles.length) {
      console.log(`  ${s.dir}: no published articles`);
      return;
    }

    articles.forEach(article => {
      const html = buildArticle(article, articles, s.slug);
      const outDir = path.join(ROOT, s.output, article.slug);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), html);
      totalBuilt++;
    });

    console.log(`  ${s.dir}: ${articles.length} articles built`);
  });

  console.log(`Article engine: ${totalBuilt} total pages generated`);
}

main();
