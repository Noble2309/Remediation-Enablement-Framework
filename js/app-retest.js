  function renderRetest(id, stage = 'form') {
    const finding = findingById(id);
    const workflow = stateApi.getFinding(id);
    if (!finding || !workflow) return renderNotFound();
    if (stage === 'review') return renderRetestConfirmation(id);

    const draft = retestDrafts.get(id) || {
      whatChanged: '',
      affectedScope: finding.affected.join(', '),
      exceptions: '',
      changeReference: '',
      evidence: []
    };

    renderPage(`
      <section class="page-section workflow-section">
        <div class="narrow-width">
          <div class="breadcrumb"><a href="#/finding/${encodeURIComponent(id)}">${escapeHtml(id)} · Finding</a><span>›</span><span>Retest readiness</span></div>
          <div class="workflow-heading">
            <div class="workflow-icon">RR</div>
            <div>
              <div class="eyebrow">Remediation enablement workflow</div>
              <h1>Prepare for retest</h1>
              <p class="lead">Describe what changed and provide useful context before independent technical validation.</p>
            </div>
          </div>

          <div class="principle-banner warning-banner">
            <strong>Evidence supports the retest; it does not replace the retest.</strong>
            <span>Submitting a screenshot, configuration or change record must never automatically mark a finding as remediated.</span>
          </div>

          <div class="workflow-finding-summary card">
            <div><span>${escapeHtml(finding.id)}</span><strong>${escapeHtml(finding.title)}</strong></div>
            ${badgeSeverity(finding.severity)}
          </div>

          <form id="retest-form" class="workflow-form card" novalidate>
            <div class="form-section-heading">
              <span class="step-number">1</span>
              <div><h2>Readiness information</h2><p>Help the assessor understand the remediation claim before validation begins.</p></div>
            </div>

            <div class="form-field">
              <label for="retest-changed">What changed? <span aria-hidden="true">*</span></label>
              <textarea id="retest-changed" name="whatChanged" rows="4" maxlength="1000" required>${escapeHtml(draft.whatChanged)}</textarea>
            </div>

            <div class="form-field">
              <label for="retest-scope">Affected scope addressed <span aria-hidden="true">*</span></label>
              <textarea id="retest-scope" name="affectedScope" rows="3" maxlength="700" required>${escapeHtml(draft.affectedScope)}</textarea>
              <span class="field-help">Identify which originally affected systems, users, applications or endpoints were changed.</span>
            </div>

            <div class="form-field">
              <label for="retest-exceptions">Known exceptions or partial remediation <span aria-hidden="true">*</span></label>
              <textarea id="retest-exceptions" name="exceptions" rows="3" maxlength="700" required>${escapeHtml(draft.exceptions)}</textarea>
              <span class="field-help">Record anything that remains excluded or unresolved. Enter “None known” if no exceptions are known.</span>
            </div>

            <div class="form-field">
              <label for="retest-change-ref">Change reference <span aria-hidden="true">*</span></label>
              <input id="retest-change-ref" name="changeReference" type="text" maxlength="120" value="${escapeHtml(draft.changeReference)}" required>
              <span class="field-help">Enter “N/A” if no formal change reference exists.</span>
            </div>

            <div class="evidence-suggestion-panel">
              <div class="evidence-heading"><div><span class="step-number">2</span><div><h2>Supporting evidence</h2><p>Optional and proportionate. Suggested examples for this finding:</p></div></div></div>
              <ul class="evidence-list">${finding.evidenceGuidance.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
              <div class="form-field file-field">
                <label for="retest-files">Add evidence metadata</label>
                <input id="retest-files" type="file" multiple>
                <span class="field-help">Demo only: file contents are not uploaded or stored. The prototype records names and sizes locally in your browser.</span>
              </div>
              <div id="selected-files" class="selected-files">${draft.evidence.length ? draft.evidence.map((item) => `<span class="file-chip">${escapeHtml(item.name)} · ${formatBytes(item.size)}</span>`).join('') : '<span class="muted">No evidence selected.</span>'}</div>
            </div>

            <div class="form-actions">
              <a class="button button-ghost" href="#/finding/${encodeURIComponent(id)}">Cancel</a>
              <button class="button button-primary" type="submit">Review retest request</button>
            </div>
          </form>
        </div>
      </section>
    `, { nav: 'findings' });

    let evidence = draft.evidence.slice();
    const fileInput = document.getElementById('retest-files');
    fileInput.addEventListener('change', () => {
      evidence = Array.from(fileInput.files || []).slice(0, 6).map((file) => ({ name: file.name, size: file.size }));
      const selected = document.getElementById('selected-files');
      selected.innerHTML = evidence.length
        ? evidence.map((item) => `<span class="file-chip">${escapeHtml(item.name)} · ${formatBytes(item.size)}</span>`).join('')
        : '<span class="muted">No evidence selected.</span>';
    });

    const form = document.getElementById('retest-form');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      clearErrors(form);
      const formData = new FormData(form);
      const next = {
        whatChanged: String(formData.get('whatChanged') || '').trim(),
        affectedScope: String(formData.get('affectedScope') || '').trim(),
        exceptions: String(formData.get('exceptions') || '').trim(),
        changeReference: String(formData.get('changeReference') || '').trim(),
        evidence
      };
      let valid = true;
      if (next.whatChanged.length < 10) { fieldError('retest-changed', 'Describe the remediation or mitigation that was implemented.'); valid = false; }
      if (next.affectedScope.length < 3) { fieldError('retest-scope', 'Identify the affected scope addressed by the change.'); valid = false; }
      if (next.exceptions.length < 2) { fieldError('retest-exceptions', 'Record known exceptions, or enter “None known”.'); valid = false; }
      if (next.changeReference.length < 2) { fieldError('retest-change-ref', 'Provide a change reference, or enter “N/A”.'); valid = false; }
      if (!valid) return;
      retestDrafts.set(id, next);
      goto(`/finding/${encodeURIComponent(id)}/retest/review`);
    });
  }

  function renderRetestConfirmation(id) {
    const finding = findingById(id);
    const draft = retestDrafts.get(id);
    if (!finding || !draft) return renderRetest(id, 'form');

    renderPage(`
      <section class="page-section workflow-section">
        <div class="narrow-width">
          <div class="breadcrumb"><a href="#/finding/${encodeURIComponent(id)}/retest">Retest readiness</a><span>›</span><span>Review</span></div>
          <div class="workflow-heading">
            <div class="workflow-icon">RR</div>
            <div>
              <div class="eyebrow">Step 2 of 2</div>
              <h1>Review the retest request</h1>
              <p class="lead">The information below is preparation context only. Independent technical validation is still required.</p>
            </div>
          </div>

          <div class="review-card card">
            <div class="review-status-row"><div><span>${escapeHtml(finding.id)}</span><h2>${escapeHtml(finding.title)}</h2></div>${badgeSeverity(finding.severity)}</div>
            <div class="review-grid">
              <div><span>What changed</span><strong>${escapeHtml(draft.whatChanged)}</strong></div>
              <div><span>Affected scope</span><strong>${escapeHtml(draft.affectedScope)}</strong></div>
              <div><span>Known exceptions</span><strong>${escapeHtml(draft.exceptions || 'None reported')}</strong></div>
              <div><span>Change reference</span><strong>${escapeHtml(draft.changeReference || 'Not supplied')}</strong></div>
              <div class="review-wide"><span>Supporting evidence</span><strong>${draft.evidence.length ? draft.evidence.map((item) => `${escapeHtml(item.name)} (${formatBytes(item.size)})`).join(' · ') : 'No supporting evidence supplied'}</strong></div>
            </div>
          </div>

          <form id="retest-confirm-form" class="confirmation-panel card">
            <label class="confirmation-check"><input id="retest-confirm" type="checkbox"><span>I confirm that the client believes the stated remediation is sufficiently complete for independent validation and that any known exceptions have been recorded.</span></label>
            <div class="principle-banner warning-banner compact-banner"><strong>Next state</strong><span>Retest Requested · Awaiting Independent Validation</span></div>
            <div class="form-actions">
              <a class="button button-ghost" href="#/finding/${encodeURIComponent(id)}/retest">Back</a>
              <button class="button button-primary" type="submit">Submit retest request</button>
            </div>
          </form>
        </div>
      </section>
    `, { nav: 'findings' });

    document.getElementById('retest-confirm-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const checkbox = document.getElementById('retest-confirm');
      if (!checkbox.checked) {
        checkbox.focus();
        showToast('Readiness confirmation is required before submission.', 'warning');
        return;
      }
      stateApi.updateFinding(id, (item) => {
        item.status = 'Retest Requested';
        item.retest = { ...draft, requestedDate: todayDisplay(), statement: 'Client believes remediation is complete across the stated scope and requests independent validation.' };
        item.history.push({ date: todayDisplay(), title: 'Retest requested', detail: 'Remediation notes and supporting context submitted for independent technical validation.' });
        return item;
      });
      retestDrafts.delete(id);
      showToast('Retest request recorded. Independent validation is still required.');
      goto(`/finding/${encodeURIComponent(id)}`);
    });
  }

  function renderConsultantReview(id) {
    const finding = findingById(id);
    const workflow = stateApi.getFinding(id);
    if (!finding || !workflow?.retest || workflow.status !== 'Retest Requested') return renderFindingDetail(id);
    const retest = workflow.retest;
    const draft = reviewDrafts.get(id) || { outcome: '', note: '' };

    renderPage(`
      <section class="page-section workflow-section">
        <div class="narrow-width">
          <div class="breadcrumb"><a href="#/finding/${encodeURIComponent(id)}">${escapeHtml(id)} · Finding</a><span>›</span><span>Consultant validation</span></div>
          <div class="workflow-heading consultant-heading">
            <div class="workflow-icon">CV</div>
            <div>
              <div class="eyebrow">Demo consultant step</div>
              <h1>Record independent validation outcome</h1>
              <p class="lead">This screen does not perform a retest. It demonstrates how an assessor would record the outcome after completing the authorised technical validation.</p>
            </div>
          </div>

          <div class="validation-context card">
            <div class="validation-context-header"><div><span>${escapeHtml(finding.id)}</span><h2>${escapeHtml(finding.title)}</h2></div>${badgeStatus('Retest Requested', finding.severity)}</div>
            <div class="review-grid">
              <div><span>Original scope</span><strong>${finding.affected.map(escapeHtml).join(', ')}</strong></div>
              <div><span>Client says changed</span><strong>${escapeHtml(retest.whatChanged)}</strong></div>
              <div><span>Scope claimed remediated</span><strong>${escapeHtml(retest.affectedScope)}</strong></div>
              <div><span>Known exceptions</span><strong>${escapeHtml(retest.exceptions || 'None reported')}</strong></div>
              <div class="review-wide"><span>Evidence metadata</span><strong>${retest.evidence?.length ? retest.evidence.map((item) => `${escapeHtml(item.name)} (${formatBytes(item.size)})`).join(' · ') : 'No evidence supplied'}</strong></div>
            </div>
          </div>

          <div class="principle-banner info-banner"><strong>Independent validation remains decisive.</strong><span>Choose an outcome only after assuming the appropriate authorised retest has been completed outside this prototype.</span></div>

          <form id="consultant-review-form" class="workflow-form card" novalidate>
            <div class="form-section-heading"><span class="step-number">1</span><div><h2>Validation outcome</h2><p>Select the state that best represents the technical result.</p></div></div>
            <fieldset class="outcome-grid">
              <legend class="sr-only">Retest outcome</legend>
              ${[
                ['Verified / Remediated', 'Original condition no longer present within the validated scope.'],
                ['Partially Remediated', 'Some affected scope was addressed, but the original issue remains in part.'],
                ['Unresolved', 'Original condition remains reproducible or the remediation did not address the cause.'],
                ['Unable to Validate', 'Meaningful validation could not be completed under the available test conditions.'],
                ['Changed Condition', 'Environment changed enough that the original issue is no longer directly comparable.']
              ].map(([value, description]) => `<label class="outcome-option"><input type="radio" name="outcome" value="${escapeHtml(value)}" ${draft.outcome === value ? 'checked' : ''}><span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(description)}</small></span></label>`).join('')}
            </fieldset>
            <div class="form-field">
              <label for="validation-note">Consultant validation note</label>
              <textarea id="validation-note" name="note" rows="4" maxlength="900">${escapeHtml(draft.note)}</textarea>
              <span class="field-help">Demo text only. In a real assessment this would be supported by the actual retest evidence and reporting process.</span>
            </div>
            <div class="form-actions">
              <a class="button button-ghost" href="#/finding/${encodeURIComponent(id)}">Cancel</a>
              <button class="button button-primary" type="submit">Record validation outcome</button>
            </div>
          </form>
        </div>
      </section>
    `, { nav: 'findings' });

    document.getElementById('consultant-review-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const outcome = String(formData.get('outcome') || '');
      const note = String(formData.get('note') || '').trim();
      if (!outcome) {
        showToast('Select a validation outcome.', 'warning');
        return;
      }
      stateApi.updateFinding(id, (item) => {
        item.status = outcome;
        item.history.push({ date: todayDisplay(), title: `Retest outcome · ${outcome}`, detail: note || `Independent validation outcome recorded as ${outcome}.` });
        return item;
      });
      reviewDrafts.delete(id);
      showToast(`Validation outcome recorded: ${outcome}.`);
      goto(`/finding/${encodeURIComponent(id)}`);
    });
  }
