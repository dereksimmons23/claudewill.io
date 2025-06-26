import React from 'react';

const DocNavigation = () => {
  return (
    <nav className="docs-nav">
      <div className="nav-section">
        <h3>Main Site</h3>
        <ul>
          <li><a href="/pages/documentation.html">Main Documentation</a></li>
          <li><a href="/pages/about.html">About Derek</a></li>
          <li><a href="/pages/contact.html">Contact</a></li>
        </ul>
      </div>
      <div className="nav-section">
        <h3>Resume Engine</h3>
        <ul>
          <li><a href="/resume-engine/docs/index.html">Documentation Home</a></li>
          <li><a href="/resume-engine/docs/GETTING_STARTED.md">Getting Started</a></li>
          <li><a href="/resume-engine/docs/API.md">API Reference</a></li>
          <li><a href="/resume-engine/docs/BEST_PRACTICES.md">Best Practices</a></li>
          <li><a href="/resume-engine/docs/FAQ.md">FAQ</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default DocNavigation; 