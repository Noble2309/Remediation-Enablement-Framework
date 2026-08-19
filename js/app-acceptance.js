  function renderAcceptance(id, stage = 'form') {
    const finding = findingById(id);
    const workflow = stateApi.getFinding(id);
    if (!finding || !workflow) return renderNotFound();

    if (stage === 'review') return renderAcceptanceConfirmation(id);

    const existing = workflow.acceptance || {};
    const draft = acceptanceDrafts.get(id) || {
      reason: existing.reason || '',
      owner: existing.owner || '',
      compensatingControls: existing.compensatingControls || '',
      plannedRemediation: existing.plannedRemediation || '',
      reviewDate: '',
      notes: existing.notes || ''
    };

    renderPage(`
      <section class="page-section workflow-section">
        <div class="narrow-width">
          <div class="breadcrumb"><a href="#/finding/${encodeURIComponent(id)}">${escapeHtml(id)} · Finding</a><span>›</span><span>Risk acceptance</span></div>
          <div class="workflow-heading">
            <div class="workflow-icon">RA</div>
            <div>
              <div class="eyebrow">Remediation enablement workflow</div>
              <h1>Structured risk acceptance</h1>
              <p class="lead">Record a client-owned decision to tolerate unresolved risk without presenting the finding as remediated or closed.</p>
            </div>
          </div>

          <div class="principle-banner warning-banner">
            <strong>The vulnerability remains present.</strong>
            <span>Risk acceptance records a business decision. It does not change the original severity or technical conclusion.</span>
          </div>

          <div class="workflow-finding-summary card">
            <div>
              <span>${escapeHtml(finding.id)}</span>
              <strong>${escapeHtml(finding.title)}</strong>
            </div>
            ${badgeSeverity(finding.severity)}
          </div>

          <form id="acceptance-form" class="workflow-form card" novalidate>
            <div class="form-section-heading">
              <span class="step-number">1</span>
              <div><h2>Acceptance record</h2><p>Capture enough information to make the decision understandable and reviewable.</p></div>
            </div>

            <div class="form-field">
              <label for="accept-reason">Reason for acceptance <span aria-hidden="true">*</span></label>
              <textarea id="accept-reason" name="reason" rows="4" maxlength="800" required>${escapeHtml(draft.reason)}</textarea>
              <span class="field-help">Why is remediation not being completed now?</span>
            </div>

            <div class="form-grid-two">
              <div class="form-field">
                <label for="accept-owner">Risk owner <span aria-hidden="true">*</span></label>
                <input id="accept-owner" name="owner" type="text" maxlength="120" value="${escapeHtml(draft.owner)}" required>
                <span class="field-help">Client-side role authorised to own the business risk.</span>
              </div>
              <div class="form-field">
                <label for="accept-review">Review date <span aria-hidden="true">*</span></label>
                <input id="accept-review" name="reviewDate" type="date" min="${todayInput()}" value="${escapeHtml(draft.reviewDate)}" required>
                <span class="field-help">Prevents acceptance becoming indefinite by default.</span>
              </div>
            </div>

            <div class="form-field">
              <label for="accept-controls">Compensating controls <span aria-hidden="true">*</span></label>
              <textarea id="accept-controls" name="compensatingControls" rows="3" maxlength="800" required>${escapeHtml(draft.compensatingControls)}</textarea>
              <span class="field-help">Record client-supplied controls or mitigations. Enter “None identified” if no compensating controls apply. Do not imply independent assurance unless separately assessed.</span>
            </div>

            <div class="form-field">
              <label for="accept-plan">Planned remediation or replacement <span aria-hidden="true">*</span></label>
              <textarea id="accept-plan" name="plannedRemediation" rows="3" maxlength="800" required>${escapeHtml(draft.plannedRemediation)}</textarea>
              <span class="field-help">Enter “None planned” if there is no current remediation or replacement activity.</span>
            </div>

            <div class="form-field">
              <label for="accept-notes">Supporting notes <span aria-hidden="true">*</span></label>
              <textarea id="accept-notes" name="notes" rows="3" maxlength="800" required>${escapeHtml(draft.notes)}</textarea>
              <span class="field-help">Enter “None” if there are no additional notes. Avoid credentials, personal data or unnecessary sensitive configuration information.</span>
            </div>

            <div class="form-actions">
              <a class="button button-ghost" href="#/finding/${encodeURIComponent(id)}">Cancel</a>
              <button class="button button-primary" type="submit">Review acceptance</button>
            </div>
          </form>
        </div>
      </section>
    `, { nav: 'findings' });

    const form = document.getElementById('acceptance-form');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      clearErrors(form);
      const formData = new FormData(form);
      const draftNext = {
        reason: String(formData.get('reason') || '').trim(),
        owner: String(formData.get('owner') || '').trim(),
        reviewDate: String(formData.get('reviewDate') || '').trim(),
        compensatingControls: String(formData.get('compensatingControls') || '').trim(),
        plannedRemediation: String(formData.get('plannedRemediation') || '').trim(),
        notes: String(formData.get('notes') || '').trim()
      };
      let valid = true;
      if (draftNext.reason.length < 10) { fieldError('accept-reason', 'Provide a meaningful reason for acceptance.'); valid = false; }
      if (draftNext.owner.length < 2) { fieldError('accept-owner', 'Identify the authorised client-side risk owner or role.'); valid = false; }
      if (!draftNext.reviewDate) { fieldError('accept-review', 'Set a review date for this demonstration.'); valid = false; }
      if (draftNext.compensatingControls.length < 2) { fieldError('accept-controls', 'Record the compensating controls, or enter “None identified”.'); valid = false; }
      if (draftNext.plannedRemediation.length < 2) { fieldError('accept-plan', 'Record the planned remediation or replacement, or enter “None planned”.'); valid = false; }
      if (draftNext.notes.length < 2) { fieldError('accept-notes', 'Add supporting notes, or enter “None”.'); valid = false; }
      if (!valid) return;
      acceptanceDrafts.set(id, draftNext);
      goto(`/finding/${encodeURIComponent(id)}/accept/review`);
    });
  }

  function renderAcceptanceConfirmation(id) {
    const finding = findingById(id);
    const draft = acceptanceDrafts.get(id);
    if (!finding || !draft) return renderAcceptance(id, 'form');

    renderPage(`
      <section class="page-section workflow-section">
        <div class="narrow-width">
          <div class="breadcrumb"><a href="#/finding/${encodeURIComponent(id)}/accept">Risk acceptance</a><span>›</span><span>Review</span></div>
          <div class="workflow-heading">
            <div class="workflow-icon">RA</div>
            <div>
              <div class="eyebrow">Step 2 of 2</div>
              <h1>Confirm the acceptance record</h1>
              <p class="lead">Review the information before recording the client-owned decision.</p>
            </div>
          </div>

          <div class="review-card card">
            <div class="review-status-row">
              <div>
                <span>${escapeHtml(finding.id)}</span>
                <h2>${escapeHtml(finding.title)}</h2>
              </div>
              ${badgeSeverity(finding.severity)}
            </div>
            <div class="review-grid">
              <div><span>Reason for acceptance</span><strong>${escapeHtml(draft.reason)}</strong></div>
              <div><span>Risk owner</span><strong>${escapeHtml(draft.owner)}</strong></div>
              <div><span>Review date</span><strong>${escapeHtml(inputDateToDisplay(draft.reviewDate))}</strong></div>
              <div><span>Compensating controls</span><strong>${escapeHtml(draft.compensatingControls || 'None recorded')}</strong></div>
              <div><span>Planned remediation</span><strong>${escapeHtml(draft.plannedRemediation || 'Not recorded')}</strong></div>
              <div><span>Supporting notes</span><strong>${escapeHtml(draft.notes || 'None')}</strong></div>
            </div>
          </div>

          <form id="accept-confirm-form" class="confirmation-panel card">
            <label class="confirmation-check">
              <input id="accept-confirm" type="checkbox">
              <span>I confirm that this record represents a decision by the appropriate client-side risk owner and that the underlying vulnerability remains unresolved.</span>
            </label>
            <div class="principle-banner warning-banner compact-banner">
              <strong>Recorded state</strong>
              <span>Risk Accepted · Vulnerability Remains Present</span>
            </div>
            <div class="form-actions">
              <a class="button button-ghost" href="#/finding/${encodeURIComponent(id)}/accept">Back</a>
              <button class="button button-primary" type="submit">Confirm risk acceptance</button>
            </div>
          </form>
        </div>
      </section>
    `, { nav: 'findings' });

    document.getElementById('accept-confirm-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const checkbox = document.getElementById('accept-confirm');
      if (!checkbox.checked) {
        checkbox.focus();
        showToast('Confirmation is required before the record can be saved.', 'warning');
        return;
      }
      stateApi.updateFinding(id, (item) => {
        item.status = 'Risk Accepted';
        item.acceptance = {
          ...draft,
          acceptanceDate: todayDisplay(),
          reviewDate: inputDateToDisplay(draft.reviewDate)
        };
        item.retest = null;
        item.history.push({
          date: todayDisplay(),
          title: 'Risk acceptance recorded',
          detail: `Risk accepted by ${draft.owner}. Vulnerability remains present; review due ${inputDateToDisplay(draft.reviewDate)}.`
        });
        return item;
      });
      acceptanceDrafts.delete(id);
      showToast('Risk acceptance recorded. The finding remains technically unresolved.');
      goto(`/finding/${encodeURIComponent(id)}`);
    });
  }

  function renderAcceptanceReview(id) {
    const finding = findingById(id);
    const workflow = stateApi.getFinding(id);
    if (!finding || !workflow?.acceptance) return renderFindingDetail(id);
    const acceptance = workflow.acceptance;

    renderPage(`
      <section class="page-section workflow-section">
        <div class="narrow-width">
          <div class="breadcrumb"><a href="#/finding/${encodeURIComponent(id)}">${escapeHtml(id)} · Finding</a><span>›</span><span>Acceptance review</span></div>
          <div class="workflow-heading">
            <div class="workflow-icon">RA</div>
            <div>
              <div class="eyebrow">Lifecycle review</div>
              <h1>Review risk acceptance</h1>
              <p class="lead">Risk acceptance should not become permanent by accident. Select the appropriate next lifecycle action.</p>
            </div>
          </div>

          <div class="review-card card">
            <div class="review-status-row">
              <div><span>${escapeHtml(finding.id)}</span><h2>${escapeHtml(finding.title)}</h2></div>
              ${badgeStatus('Risk Accepted', finding.severity)}
            </div>
            <div class="review-grid">
              <div><span>Risk owner</span><strong>${escapeHtml(acceptance.owner)}</strong></div>
              <div><span>Review date</span><strong>${escapeHtml(acceptance.reviewDate)}</strong></div>
              <div><span>Reason</span><strong>${escapeHtml(acceptance.reason)}</strong></div>
              <div><span>Planned remediation</span><strong>${escapeHtml(acceptance.plannedRemediation || 'Not recorded')}</strong></div>
            </div>
          </div>

          <div class="choice-grid">
            <button class="choice-card" type="button" data-accept-action="continue">
              <span class="choice-kicker">Continue</span>
              <strong>Continue acceptance</strong>
              <p>Rationale remains valid. Record a new review date.</p>
            </button>
            <button class="choice-card" type="button" data-accept-action="remediate">
              <span class="choice-kicker">Remediate</span>
              <strong>Begin remediation</strong>
              <p>Return the finding to an open technical state.</p>
            </button>
            <button class="choice-card" type="button" data-accept-action="reassess">
              <span class="choice-kicker">Reassess</span>
              <strong>Reassess decision</strong>
              <p>Record that wider risk review is required.</p>
            </button>
            <a class="choice-card" href="#/finding/${encodeURIComponent(id)}/retest">
              <span class="choice-kicker">Validate</span>
              <strong>Prepare for retest</strong>
              <p>Use when remediation has now been implemented.</p>
            </a>
          </div>

          <div id="accept-review-extra"></div>
          <div class="form-actions standalone-actions"><a class="button button-ghost" href="#/finding/${encodeURIComponent(id)}">Back to finding</a></div>
        </div>
      </section>
    `, { nav: 'findings' });

    document.querySelectorAll('[data-accept-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.acceptAction;
        if (action === 'continue') {
          document.getElementById('accept-review-extra').innerHTML = `
            <form id="continue-acceptance" class="workflow-form card compact-form">
              <div class="form-field">
                <label for="new-review-date">New review date</label>
                <input id="new-review-date" type="date" min="${todayInput()}" required>
              </div>
              <div class="form-actions"><button class="button button-primary" type="submit">Continue acceptance</button></div>
            </form>
          `;
          document.getElementById('continue-acceptance').addEventListener('submit', (event) => {
            event.preventDefault();
            const value = document.getElementById('new-review-date').value;
            if (!value) return;
            stateApi.updateFinding(id, (item) => {
              item.acceptance.reviewDate = inputDateToDisplay(value);
              item.history.push({ date: todayDisplay(), title: 'Risk acceptance reviewed', detail: `Acceptance continued; next review set for ${inputDateToDisplay(value)}.` });
              return item;
            });
            showToast('Acceptance reviewed and a new review date recorded.');
            goto(`/finding/${encodeURIComponent(id)}`);
          });
        } else if (action === 'remediate') {
          stateApi.updateFinding(id, (item) => {
            item.status = 'Open';
            item.history.push({ date: todayDisplay(), title: 'Acceptance ended · remediation reopened', detail: 'Client moved the finding back into active remediation.' });
            return item;
          });
          showToast('Finding returned to active remediation.');
          goto(`/finding/${encodeURIComponent(id)}`);
        } else if (action === 'reassess') {
          stateApi.updateFinding(id, (item) => {
            item.status = 'Open';
            item.history.push({ date: todayDisplay(), title: 'Risk decision requires reassessment', detail: 'New information requires wider review before treatment is confirmed.' });
            return item;
          });
          showToast('Reassessment requirement recorded.');
          goto(`/finding/${encodeURIComponent(id)}`);
        }
      });
    });
  }
