  function renderOverview() {
    const c = counts();
    const high = data.findings.filter((f) => f.severity === 'High').length;
    const medium = data.findings.filter((f) => f.severity === 'Medium').length;

    const recent = [];
    const allState = stateApi.getAll();
    for (const finding of data.findings) {
      const history = allState[finding.id]?.history || [];
      history.forEach((event, index) => recent.push({ ...event, finding, index }));
    }
    recent.reverse();

    renderPage(`
      <section class="page-section hero-section">
        <div class="content-width">
          <div class="eyebrow">Fictional assessment · ${escapeHtml(data.assessment.id)}</div>
          <div class="hero-grid">
            <div>
              <h1>${escapeHtml(data.assessment.organisation)}</h1>
              <p class="hero-subtitle">${escapeHtml(data.assessment.title)}</p>
              <p class="hero-copy">${escapeHtml(data.assessment.summary)}</p>
              <div class="button-row">
                <a class="button button-primary" href="#/findings">View findings</a>
                <a class="button button-secondary" href="#/documentation">Read framework docs</a>
              </div>
            </div>
            <aside class="assessment-meta card">
              <div class="meta-row"><span>Assessment dates</span><strong>${escapeHtml(data.assessment.assessmentDates)}</strong></div>
              <div class="meta-row"><span>Report source</span><strong>${escapeHtml(data.assessment.reportVersion)}</strong></div>
              <div class="meta-row"><span>Findings</span><strong>${data.findings.length}</strong></div>
              <div class="meta-row"><span>Prototype mode</span><strong>Local browser state</strong></div>
            </aside>
          </div>
        </div>
      </section>

      <section class="page-section page-section-tight">
        <div class="content-width">
          <div class="section-heading">
            <div><div class="eyebrow">Current demo state</div><h2>Assessment lifecycle at a glance</h2></div>
          </div>
          <div class="metric-grid">
            ${metricCard('Findings', data.findings.length, `${high} high · ${medium} medium`)}
            ${metricCard('Open', c.open, 'Awaiting treatment or validation')}
            ${metricCard('Risk accepted', c.accepted, 'Vulnerability remains present')}
            ${metricCard('Retest requested', c.retest, 'Independent validation required')}
            ${metricCard('Verified', c.verified, 'Confirmed after validation')}
          </div>
        </div>
      </section>

      <section class="page-section">
        <div class="content-width two-column-layout">
          <div>
            <div class="section-heading compact"><div><div class="eyebrow">Core capability</div><h2>Two deliberately bounded workflows</h2></div></div>
            <div class="feature-grid">
              <article class="feature-card">
                <div class="feature-number">01</div>
                <h3>Structured risk acceptance</h3>
                <p>Records why unresolved risk is being tolerated, who owns the decision, what controls or future work are relevant, and when the decision should be reviewed.</p>
                <p class="principle">The assessor informs the decision. The client owns the decision.</p>
              </article>
              <article class="feature-card">
                <div class="feature-number">02</div>
                <h3>Retest readiness & evidence</h3>
                <p>Captures what changed, affected scope, known exceptions and supporting evidence before a finding is independently retested.</p>
                <p class="principle">Evidence supports the retest. It does not replace the retest.</p>
              </article>
            </div>
          </div>

          <aside>
            <div class="section-heading compact"><div><div class="eyebrow">Lifecycle</div><h2>Recent activity</h2></div></div>
            <div class="activity-list card">
              ${recent.slice(0, 5).map((event) => `
                <a class="activity-item" href="#/finding/${encodeURIComponent(event.finding.id)}">
                  <span class="activity-dot"></span>
                  <span class="activity-body">
                    <strong>${escapeHtml(event.title)}</strong>
                    <span>${escapeHtml(event.finding.id)} · ${escapeHtml(event.finding.title)}</span>
                    <small>${escapeHtml(event.date)}</small>
                  </span>
                </a>
              `).join('')}
            </div>
          </aside>
        </div>
      </section>
    `, { nav: 'overview' });
  }

  function findingRow(finding) {
    const status = currentStatus(finding.id);
    return `
      <a class="finding-row" href="#/finding/${encodeURIComponent(finding.id)}">
        <span class="finding-id">${escapeHtml(finding.id)}</span>
        <span class="finding-title-cell">
          <strong>${escapeHtml(finding.title)}</strong>
          <small>${escapeHtml(finding.category)} · ${escapeHtml(finding.affected.join(', '))}</small>
        </span>
        <span>${badgeSeverity(finding.severity)}</span>
        <span>${badgeStatus(status, finding.severity)}</span>
        <span class="row-chevron" aria-hidden="true">›</span>
      </a>
    `;
  }

  function renderFindings(filter = 'all') {
    const validFilters = ['all', 'open', 'accepted', 'retest', 'resolved'];
    const activeFilter = validFilters.includes(filter) ? filter : 'all';
    const filtered = data.findings.filter((finding) => {
      const status = currentStatus(finding.id);
      if (activeFilter === 'open') return status === 'Open' || status === 'Unresolved' || status === 'Partially Remediated';
      if (activeFilter === 'accepted') return status === 'Risk Accepted';
      if (activeFilter === 'retest') return status === 'Retest Requested';
      if (activeFilter === 'resolved') return status === 'Verified / Remediated';
      return true;
    });

    renderPage(`
      <section class="page-section">
        <div class="content-width">
          <div class="page-heading-row">
            <div>
              <div class="eyebrow">Assessment findings</div>
              <h1>Findings</h1>
              <p class="lead">Select a finding to view its technical context and demonstrate a remediation workflow.</p>
            </div>
            <div class="summary-chip">${filtered.length} shown</div>
          </div>

          <div class="filter-tabs" role="navigation" aria-label="Finding filters">
            <a class="${activeFilter === 'all' ? 'active' : ''}" href="#/findings/all">All</a>
            <a class="${activeFilter === 'open' ? 'active' : ''}" href="#/findings/open">Open</a>
            <a class="${activeFilter === 'accepted' ? 'active' : ''}" href="#/findings/accepted">Risk accepted</a>
            <a class="${activeFilter === 'retest' ? 'active' : ''}" href="#/findings/retest">Retest requested</a>
            <a class="${activeFilter === 'resolved' ? 'active' : ''}" href="#/findings/resolved">Verified</a>
          </div>

          <div class="findings-table" role="table" aria-label="Security findings">
            <div class="finding-row finding-row-header" role="row">
              <span>ID</span><span>Finding</span><span>Severity</span><span>Status</span><span></span>
            </div>
            ${filtered.length ? filtered.map(findingRow).join('') : `
              <div class="empty-state"><h3>No findings in this state</h3><p>Use another filter or reset the demonstration state.</p></div>
            `}
          </div>
        </div>
      </section>
    `, { nav: 'findings' });
  }

  function historyMarkup(history) {
    if (!history?.length) return '<p class="muted">No lifecycle events recorded.</p>';
    return history.slice().reverse().map((event) => `
      <div class="timeline-item">
        <span class="timeline-marker" aria-hidden="true"></span>
        <div>
          <strong>${escapeHtml(event.title)}</strong>
          <p>${escapeHtml(event.detail)}</p>
          <small>${escapeHtml(event.date)}</small>
        </div>
      </div>
    `).join('');
  }

  function actionPanel(finding, workflow) {
    const status = workflow.status;

    if (status === 'Verified / Remediated') {
      return `<div class="action-state action-state-success"><span class="action-state-label">Validated outcome</span><h3>Verified / Remediated</h3><p>Independent validation has recorded that the original condition is no longer present within the validated scope.</p></div>`;
    }

    if (status === 'Retest Requested') {
      return `<div class="action-state action-state-info"><span class="action-state-label">Client workflow complete</span><h3>Independent validation required</h3><p>The remediation claim and supporting context have been submitted. The finding must not be marked remediated until validation is complete.</p><a class="button button-primary button-block" href="#/finding/${encodeURIComponent(finding.id)}/review">Open consultant validation</a></div>`;
    }

    if (status === 'Risk Accepted') {
      return `<div class="action-state action-state-warning"><span class="action-state-label">Current lifecycle state</span><h3>Risk accepted · vulnerability remains</h3><p>This is a business-risk decision, not technical remediation. The finding remains visible and reviewable.</p><a class="button button-primary button-block" href="#/finding/${encodeURIComponent(finding.id)}/acceptance-review">Review acceptance</a><a class="button button-secondary button-block" href="#/finding/${encodeURIComponent(finding.id)}/retest">Prepare for retest</a></div>`;
    }

    if (['Partially Remediated', 'Unresolved', 'Unable to Validate'].includes(status)) {
      return `<div class="action-state action-state-warning"><span class="action-state-label">Validation outcome</span><h3>${escapeHtml(status)}</h3><p>The finding remains actionable. A new remediation attempt can be prepared for validation when appropriate.</p><a class="button button-primary button-block" href="#/finding/${encodeURIComponent(finding.id)}/retest">Prepare another retest</a><a class="button button-secondary button-block" href="#/finding/${encodeURIComponent(finding.id)}/accept">Consider risk acceptance</a></div>`;
    }

    if (status === 'Changed Condition') {
      return `<div class="action-state action-state-neutral"><span class="action-state-label">Validation outcome</span><h3>Changed condition</h3><p>The environment has changed enough that the original issue is no longer directly comparable. Normal assessment judgement is required before further lifecycle action.</p></div>`;
    }

    return `<div class="action-state"><span class="action-state-label">Available workflow actions</span><h3>Choose a treatment path</h3><p>Demonstrate either a structured client risk decision or preparation for independent remediation validation.</p><a class="button button-primary button-block" href="#/finding/${encodeURIComponent(finding.id)}/retest">Prepare for retest</a><a class="button button-secondary button-block" href="#/finding/${encodeURIComponent(finding.id)}/accept">Accept risk</a></div>`;
  }

  function renderFindingDetail(id) {
    const finding = findingById(id);
    const workflow = stateApi.getFinding(id);
    if (!finding || !workflow) return renderNotFound();

    const acceptance = workflow.acceptance;
    const retest = workflow.retest;

    renderPage(`
      <section class="page-section">
        <div class="content-width">
          <div class="breadcrumb"><a href="#/findings">Findings</a><span>›</span><span>${escapeHtml(finding.id)}</span></div>
          <div class="finding-header">
            <div>
              <div class="finding-header-meta"><span class="finding-id-large">${escapeHtml(finding.id)}</span>${badgeSeverity(finding.severity)}</div>
              <h1>${escapeHtml(finding.title)}</h1>
              <div class="status-line">${badgeStatus(workflow.status, finding.severity)}</div>
            </div>
            <div class="finding-asset card"><span>Affected scope</span>${finding.affected.map((asset) => `<strong>${escapeHtml(asset)}</strong>`).join('')}</div>
          </div>

          <div class="detail-layout">
            <div class="detail-main">
              <section class="detail-section card"><div class="detail-section-heading"><span>01</span><h2>Description</h2></div><p>${escapeHtml(finding.description)}</p></section>
              <section class="detail-section card"><div class="detail-section-heading"><span>02</span><h2>Impact</h2></div><p>${escapeHtml(finding.impact)}</p></section>
              <section class="detail-section card"><div class="detail-section-heading"><span>03</span><h2>Remediation</h2></div><p>${escapeHtml(finding.remediation)}</p></section>

              ${acceptance ? `
                <section class="detail-section card record-card">
                  <div class="detail-section-heading"><span>RA</span><h2>Risk acceptance record</h2></div>
                  <div class="record-grid">
                    <div><span>Reason</span><strong>${escapeHtml(acceptance.reason)}</strong></div>
                    <div><span>Risk owner</span><strong>${escapeHtml(acceptance.owner)}</strong></div>
                    <div><span>Review date</span><strong>${escapeHtml(acceptance.reviewDate)}</strong></div>
                    <div><span>Planned remediation</span><strong>${escapeHtml(acceptance.plannedRemediation || 'Not recorded')}</strong></div>
                    <div class="record-wide"><span>Compensating controls</span><strong>${escapeHtml(acceptance.compensatingControls || 'None recorded')}</strong></div>
                  </div>
                </section>
              ` : ''}

              ${retest ? `
                <section class="detail-section card record-card">
                  <div class="detail-section-heading"><span>RR</span><h2>Retest readiness record</h2></div>
                  <div class="record-grid">
                    <div><span>What changed</span><strong>${escapeHtml(retest.whatChanged)}</strong></div>
                    <div><span>Affected scope</span><strong>${escapeHtml(retest.affectedScope)}</strong></div>
                    <div><span>Known exceptions</span><strong>${escapeHtml(retest.exceptions || 'None reported')}</strong></div>
                    <div><span>Change reference</span><strong>${escapeHtml(retest.changeReference || 'Not supplied')}</strong></div>
                    <div class="record-wide"><span>Evidence metadata</span><strong>${retest.evidence?.length ? retest.evidence.map((item) => `${escapeHtml(item.name)} (${formatBytes(item.size)})`).join(' · ') : 'No supporting evidence supplied'}</strong></div>
                  </div>
                </section>
              ` : ''}

              <section class="detail-section card"><div class="detail-section-heading"><span>04</span><h2>Finding history</h2></div><div class="timeline">${historyMarkup(workflow.history)}</div></section>
            </div>

            <aside class="detail-aside">
              <div class="sticky-panel">
                ${actionPanel(finding, workflow)}
                <div class="boundary-note"><strong>Prototype boundary</strong><p>The original finding remains the authoritative technical record. Workflow actions do not rewrite severity, evidence, description or remediation advice.</p></div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    `, { nav: 'findings' });
  }

  function fieldError(id, message) {
    const el = document.getElementById(id);
    if (!el) return;
    const wrapper = el.closest('.form-field');
    if (wrapper) wrapper.classList.add('field-invalid');
    let msg = wrapper?.querySelector('.field-error');
    if (!msg && wrapper) {
      msg = document.createElement('span');
      msg.className = 'field-error';
      wrapper.appendChild(msg);
    }
    if (msg) msg.textContent = message;
  }

  function clearErrors(form) {
    form.querySelectorAll('.field-invalid').forEach((el) => el.classList.remove('field-invalid'));
    form.querySelectorAll('.field-error').forEach((el) => el.remove());
  }
