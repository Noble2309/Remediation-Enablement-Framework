  function renderDocumentation() {
    renderPage(`
      <section class="page-section">
        <div class="content-width">
          <div class="page-heading-row">
            <div>
              <div class="eyebrow">Reference documentation</div>
              <h1>Framework documents</h1>
              <p class="lead">The prototype implements the platform-neutral v1.0 design described in these three project artefacts.</p>
            </div>
          </div>

          <div class="doc-grid">
            <a class="doc-card" href="docs/project-overview.pdf" target="_blank" rel="noopener">
              <span class="doc-type">PDF · Project overview</span>
              <h2>Remediation Enablement Framework</h2>
              <p>Overall problem, design principles, project evolution, current modules and future maturity path.</p>
              <span class="doc-link">Open PDF <span aria-hidden="true">↗</span></span>
            </a>
            <a class="doc-card" href="docs/risk-acceptance-framework.pdf" target="_blank" rel="noopener">
              <span class="doc-type">PDF · Module 01</span>
              <h2>Risk Acceptance for Security Findings</h2>
              <p>Structured risk ownership, minimum acceptance record, review lifecycle and platform-neutral reference workflow.</p>
              <span class="doc-link">Open PDF <span aria-hidden="true">↗</span></span>
            </a>
            <a class="doc-card" href="docs/retest-readiness-framework.pdf" target="_blank" rel="noopener">
              <span class="doc-type">PDF · Module 02</span>
              <h2>Retest Readiness and Evidence</h2>
              <p>Preparation context, evidence guidance, responsibility boundary, retest states and independent validation workflow.</p>
              <span class="doc-link">Open PDF <span aria-hidden="true">↗</span></span>
            </a>
          </div>

          <div class="architecture-card card">
            <div>
              <div class="eyebrow">Prototype implementation</div>
              <h2>Deliberately static and inspectable</h2>
              <p>The prototype uses HTML, CSS and vanilla JavaScript. Fictional findings are defined locally, workflow state is stored in browser localStorage, evidence uploads are simulated as filename/size metadata, and no external services are contacted.</p>
            </div>
            <div class="architecture-flow" aria-label="Prototype architecture">
              <span>Fictional finding data</span><b>→</b><span>Browser workflow</span><b>→</b><span>localStorage state</span>
            </div>
          </div>
        </div>
      </section>
    `, { nav: 'documentation' });
  }

  function renderNotFound() {
    renderPage(`
      <section class="page-section">
        <div class="narrow-width empty-page">
          <div class="eyebrow">404</div>
          <h1>Page not found</h1>
          <p>The requested prototype view does not exist.</p>
          <a class="button button-primary" href="#/overview">Return to overview</a>
        </div>
      </section>
    `);
  }

  function renderRoute() {
    const parts = routeParts();
    if (parts[0] === 'overview') return renderOverview();
    if (parts[0] === 'findings') return renderFindings(parts[1] || 'all');
    if (parts[0] === 'documentation') return renderDocumentation();
    if (parts[0] === 'finding' && parts[1]) {
      const id = decodeURIComponent(parts[1]);
      if (parts.length === 2) return renderFindingDetail(id);
      if (parts[2] === 'accept') return renderAcceptance(id, parts[3] || 'form');
      if (parts[2] === 'acceptance-review') return renderAcceptanceReview(id);
      if (parts[2] === 'retest') return renderRetest(id, parts[3] || 'form');
      if (parts[2] === 'review') return renderConsultantReview(id);
    }
    return renderNotFound();
  }

  resetButton.addEventListener('click', () => {
    const confirmed = window.confirm('Reset all prototype workflow changes and restore the fictional default state?');
    if (!confirmed) return;
    stateApi.reset();
    acceptanceDrafts.clear();
    retestDrafts.clear();
    reviewDrafts.clear();
    showToast('Demo state reset.');
    renderRoute();
  });

  window.addEventListener('hashchange', renderRoute);
  window.addEventListener('DOMContentLoaded', () => {
    if (!window.location.hash) window.location.hash = '#/overview';
    renderRoute();
  });
