# Remediation Enablement Framework - Reference Prototype

A platform-neutral proof of concept for improving what happens **after a security assessment has identified a finding**.

The prototype demonstrates two deliberately narrow workflows:

1. **Structured Risk Acceptance** - records a client-owned decision to tolerate an unresolved finding without presenting the vulnerability as remediated or closed.
2. **Retest Readiness and Evidence** - helps a remediation owner describe what changed, identify affected scope and exceptions, and provide useful supporting context before independent technical validation.

> **Fictional data only.** This repository is a portfolio and workflow-design prototype. It does not perform security testing, make risk decisions, store real evidence, or verify remediation automatically.

**Current build:** v1.0.5  
**Project type:** Static reference prototype  
**Author / framework designer:** Daniel Jones  
**Live Demo:** https://remediation-enablement-framework.danielmark1002.workers.dev/

---

## The problem

A penetration test or security review usually explains what was identified, why it matters, and how the issue should be remediated. The period after report delivery can still contain avoidable ambiguity.

A finding marked as **risk accepted** may appear complete even though the underlying vulnerability remains technically present. A client requesting a **retest** may know that a change was made but provide little context about what changed, which assets were addressed, whether exceptions remain, or what evidence may be useful to the assessor.

The Remediation Enablement Framework explores a lightweight way to improve those two parts of the finding lifecycle without expanding the penetration tester's role into ownership of the client's business risk.

---

## Core design position

Two rules underpin the entire prototype:

> **The assessor informs the risk decision; the client owns the risk decision.**

> **Evidence supports the retest; it does not replace the retest.**

The original security finding remains the authoritative technical record. Risk acceptance, remediation notes, evidence metadata, and lifecycle actions do not silently rewrite the original severity, description, evidence, impact, or remediation advice.

---

## What the prototype demonstrates

The application includes a fictional security assessment with five findings across external infrastructure, software lifecycle, TLS, web security and identity controls.

Users can:

- Review an assessment overview and finding list.
- Open the original technical context for each finding.
- Record a structured risk-acceptance decision.
- Capture a client-side risk owner, rationale, compensating controls, remediation plans, supporting notes and review date.
- Keep an accepted finding explicitly visible as **Risk Accepted · Vulnerability Remains**.
- Prepare a finding for retest by documenting what changed, affected scope, known exceptions and a change reference.
- Add simulated supporting-evidence metadata without uploading files.
- Keep a requested retest explicitly visible as **Retest Requested · Awaiting Validation**.
- Simulate the assessor recording an independent validation outcome.
- Record outcomes including **Verified / Remediated**, **Partially Remediated**, **Unresolved**, **Unable to Validate**, and **Changed Condition**.
- Review lifecycle history and reset the fictional demo state.

The prototype requires an explicit response for the structured workflow fields. Where a field does not apply, the user can record a value such as `None identified`, `None known`, or `N/A` rather than leaving the record ambiguous.

---

## Workflow 1 — Structured Risk Acceptance

```text
Open finding
    │
    ▼
Client considers risk acceptance
    │
    ▼
Explain that the vulnerability remains present
    │
    ▼
Capture structured acceptance record
    │
    ├── Reason for acceptance
    ├── Risk owner
    ├── Compensating controls
    ├── Planned remediation / replacement
    ├── Review date
    └── Supporting notes
    │
    ▼
Authorised client-side confirmation
    │
    ▼
Risk Accepted · Vulnerability Remains
    │
    ▼
Review / reassessment
    │
    ├── Continue acceptance
    ├── Begin remediation
    ├── Reassess decision
    └── Move to technical validation after remediation
```

Risk acceptance is intentionally represented as a governed lifecycle state rather than a technical closure state.

---

## Workflow 2 — Retest Readiness and Evidence

```text
Remediation or mitigation implemented
    │
    ▼
Remediation owner believes the finding is ready
    │
    ▼
Capture readiness context
    │
    ├── What changed
    ├── Affected scope addressed
    ├── Known exceptions / partial remediation
    ├── Change reference
    └── Optional supporting-evidence metadata
    │
    ▼
Retest Requested · Awaiting Validation
    │
    ▼
Assessor reviews original finding and submitted context
    │
    ▼
Independent technical validation
    │
    ▼
Validation outcome recorded
```

The client can state that remediation is believed to be complete, but the prototype does not represent the vulnerability as remediated until an independent validation outcome is recorded.

---

## Finding lifecycle states

| State | Meaning |
|---|---|
| **Open** | The original finding remains unresolved and no later treatment state has been recorded. |
| **Risk Accepted · Vulnerability Remains** | The client has recorded a business decision to tolerate the unresolved risk. |
| **Retest Requested · Awaiting Validation** | The client believes remediation is ready for validation, but no successful retest has yet been recorded. |
| **Verified · Vulnerability Remediated** | Independent validation has confirmed that the original condition is no longer present within the validated scope. |
| **Partially Remediated** | Some affected scope has been addressed, but the original issue remains in part. |
| **Unresolved** | The original condition remains reproducible or the implemented change did not resolve it. |
| **Unable to Validate** | Meaningful validation could not be completed under the available test conditions. |
| **Changed Condition** | The environment has changed enough that the original finding is no longer directly comparable and requires assessment judgement. |

For unresolved states, the prototype visually aligns lifecycle badges with the original finding severity so the underlying technical risk remains visible.

---

## Fictional assessment data

| ID | Finding | Severity | Category |
|---|---|---|---|
| `EXT-01` | Publicly Accessible Administration Interface | High | Network exposure |
| `EXT-02` | Unsupported Software Version | High | Software lifecycle |
| `EXT-03` | Deprecated TLS Protocols Supported | Medium | Cryptography |
| `WEB-01` | Content Security Policy Not Enforced | Medium | Web hardening |
| `ID-01` | Inconsistent Multifactor Authentication Coverage | High | Identity |

All organisations, hosts, findings, evidence references, dates and lifecycle events used by the prototype are fictional.

---

## Architecture

The prototype intentionally uses a small static architecture.

```text
Browser
  │
  ├── HTML
  ├── CSS
  ├── Vanilla JavaScript
  │
  └── localStorage
       └── Fictional workflow state only

No backend
No database
No authentication service
No external API
No AI dependency
```

The application is designed so that the workflow itself can be reviewed without introducing unrelated platform complexity.

---

## Technology

- HTML5
- CSS
- Vanilla JavaScript
- Browser `localStorage` for fictional workflow-state persistence
- Static hosting compatible
- Cloudflare Pages-compatible `_headers` configuration

There are no JavaScript frameworks, package dependencies, build tools, external fonts, remote scripts, analytics services or third-party APIs.

---

## Security characteristics

This is not a production security platform, but the prototype deliberately applies several defensive design choices appropriate to a public static demonstration.

User-entered values are escaped before being rendered back into the interface. The application does not send data to a server, does not process credentials and does not upload supporting files. Evidence selection records only fictional browser-side metadata such as filename and file size.

The included `_headers` file defines a restrictive deployment baseline including:

- Content Security Policy
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- Restricted `Permissions-Policy`
- `Cross-Origin-Opener-Policy: same-origin`

The prototype should only be used with fictional or otherwise safe demonstration data.

---

## Run locally

No installation or package manager is required.

### Windows

Open PowerShell inside the project directory and run:

```powershell
py -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### macOS / Linux

From the project directory:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

The **Reset demo** control restores the original fictional workflow state.

---

## Framework documentation

The repository includes the three framework documents that define the design behind the prototype:

- [Remediation Enablement Framework — Project Overview](docs/project-overview.pdf)
- [Risk Acceptance for Security Findings](docs/risk-acceptance-framework.pdf)
- [Retest Readiness and Evidence](docs/retest-readiness-framework.pdf)

The application also exposes these documents through its Documentation view.

---

## Project structure

```text
remediation-enablement-prototype/
├── index.html
├── _headers
├── .gitignore
├── README.md
├── project.json
├── css/
│   ├── styles-base.css
│   └── styles-components.css
├── js/
│   ├── data.js
│   ├── state.js
│   ├── app-core-base.js
│   ├── app-core-views.js
│   ├── app-acceptance.js
│   ├── app-retest.js
│   └── app-ui.js
└── docs/
    ├── project-overview.pdf
    ├── risk-acceptance-framework.pdf
    └── retest-readiness-framework.pdf
```

The browser assets are split into small, dependency-free files for readability and straightforward static hosting. No build step is required.

---

## Deliberate exclusions

The project is intentionally **not** a vulnerability-management, penetration-testing-as-a-service, governance-risk-and-compliance, or production remediation platform.

Version 1 deliberately excludes real client data, authentication, permissions, real evidence storage, email notifications, scanner integrations, report ingestion, automated testing, automated risk decisions, AI-generated status decisions, commercial features and billing workflows.

These exclusions keep the prototype focused on the security-process problem it was designed to explore.

---

## Future development

The wider framework describes a maturity path beyond this finding-level prototype. Potential later work could include assessment-level remediation planning, cross-assessment technical consolidation, lifecycle review reminders and carefully bounded contextual automation.

Any future automation or AI capability should remain optional. Appropriate uses could include plain-language explanation, completeness prompts, evidence-category suggestions or summarisation of approved information. It should not determine risk appetite, approve risk acceptance, fabricate evidence, change finding severity or declare remediation successful without independent validation.

---

## Development note

The framework concept, workflow boundaries, finding content, security requirements and prototype review were developed by **Daniel Jones**. The static application implementation was produced using AI-assisted development and iteratively reviewed and tested against the framework requirements.

The project is intended to demonstrate security workflow design, remediation-process thinking and the translation of a written framework into a working proof of concept. It is not presented as production software-engineering work.

---

## Disclaimer

This repository is a fictional portfolio demonstration. It does not constitute penetration-testing results, legal advice, compliance advice, risk acceptance on behalf of any organisation, or evidence that a security weakness has been remediated.
