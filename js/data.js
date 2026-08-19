(function () {
  'use strict';

  window.PROTOTYPE_DATA = {
    assessment: {
      id: 'NB-2026-08',
      organisation: 'Northbridge Systems Ltd.',
      title: 'External, Web & Identity Security Assessment',
      assessmentDates: '4–8 August 2026',
      reportVersion: 'v1.0 · fictional approved source',
      summary: 'A fictional security assessment used to demonstrate two post-assessment workflows: structured risk acceptance and retest readiness. All hosts, names, evidence and lifecycle events are invented for this prototype.'
    },
    findings: [
      {
        id: 'EXT-01',
        category: 'Network exposure',
        title: 'Publicly Accessible Administration Interface',
        severity: 'High',
        affected: ['vpn-gateway.example.test:443'],
        description: 'An administration interface for the remote-access gateway is reachable directly from the public internet. The interface is distinct from the user-facing VPN service and exposes an additional management surface to unauthorised network locations.',
        impact: 'Publicly reachable management interfaces increase exposure to credential attacks, software vulnerabilities and configuration weaknesses. Compromise of an administrative interface could provide a route to privileged control of the affected service.',
        remediation: 'Restrict the management interface to an approved administrative network, VPN path or allowlisted management sources. Confirm that emergency administrative access remains available through a controlled route and validate that the public user-facing VPN service is unaffected.',
        evidenceGuidance: [
          'Updated firewall or access-control rule',
          'Management-interface binding or access configuration',
          'Current reachability output from the intended test position',
          'Change or implementation reference, where useful'
        ]
      },
      {
        id: 'EXT-02',
        category: 'Software lifecycle',
        title: 'Unsupported Software Version',
        severity: 'High',
        affected: ['edge-app.example.test'],
        description: 'The internet-facing appliance reports a software release that is no longer supported by the vendor. Unsupported software may no longer receive security fixes or standard vendor support.',
        impact: 'Known vulnerabilities discovered after end of support may remain unpatched, increasing the likelihood that future weaknesses can be exploited against the exposed service.',
        remediation: 'Upgrade or migrate the affected appliance to a vendor-supported release. Confirm compatibility, backup and rollback requirements before production change, then verify the running version after implementation.',
        evidenceGuidance: [
          'Current software or firmware version',
          'Upgrade or maintenance record',
          'Affected host or service confirmation',
          'Vendor support status reference, if available'
        ]
      },
      {
        id: 'EXT-03',
        category: 'Cryptography',
        title: 'Deprecated TLS Protocols Supported',
        severity: 'Medium',
        affected: ['api.example.test:443', 'portal.example.test:443'],
        description: 'The affected HTTPS services support deprecated TLS protocol versions in addition to modern TLS. Legacy protocol support weakens the transport-security baseline and may expose clients to older cryptographic weaknesses.',
        impact: 'An attacker able to influence or intercept network traffic may have additional opportunities to exploit weaknesses associated with deprecated protocol versions. Continued support also increases configuration complexity and legacy dependency risk.',
        remediation: 'Disable TLS 1.0 and TLS 1.1 on the affected services after confirming that legitimate clients and integrations support modern TLS. Retest all affected endpoints from the relevant external test position.',
        evidenceGuidance: [
          'Updated TLS protocol configuration',
          'Current protocol or cipher enumeration output',
          'Confirmation of every affected endpoint',
          'Change reference or implementation note'
        ]
      },
      {
        id: 'WEB-01',
        category: 'Web hardening',
        title: 'Content Security Policy Not Enforced',
        severity: 'Medium',
        affected: ['portal.example.test'],
        description: 'The application does not enforce a restrictive Content Security Policy. The absence of an effective policy reduces the browser-side defence available if a client-side injection weakness is introduced or discovered.',
        impact: 'Content Security Policy is a defence-in-depth control rather than a substitute for secure coding. Without it, successful client-side injection may have fewer browser-enforced restrictions on script or resource execution.',
        remediation: 'Define and test an explicit Content Security Policy appropriate to the application. Restrict resource sources, avoid unsafe script directives where feasible, and deploy initially in report-only mode if compatibility needs to be assessed.',
        evidenceGuidance: [
          'Updated HTTP response showing the policy',
          'Application or reverse-proxy configuration excerpt',
          'Report-only results used during rollout, where applicable',
          'Confirmation of representative application routes'
        ]
      },
      {
        id: 'ID-01',
        category: 'Identity',
        title: 'Inconsistent Multifactor Authentication Coverage',
        severity: 'High',
        affected: ['Workforce user accounts', 'Privileged administrator accounts'],
        description: 'Multifactor authentication is not consistently enforced for all in-scope users and privileged roles. Some authentication paths rely on a password without the same additional verification requirement.',
        impact: 'A stolen or reused password may be sufficient to access accounts that are not covered by stronger authentication controls. Privileged accounts without consistent MFA represent a particularly significant compromise path.',
        remediation: 'Apply an organisation-approved MFA policy to the affected users and privileged roles. Identify exclusions, emergency-access accounts, service identities and legacy dependencies before broad enforcement, and validate representative sign-in paths after implementation.',
        evidenceGuidance: [
          'Updated authentication or access policy',
          'Scope showing affected users and privileged roles',
          'Documented exclusions or emergency-access arrangements',
          'Representative sign-in evidence after enforcement'
        ]
      }
    ],
    defaultWorkflowState: {
      'EXT-01': {
        status: 'Open',
        acceptance: null,
        retest: null,
        history: [
          { date: '8 Aug 2026', title: 'Finding issued', detail: 'Finding recorded in the approved fictional assessment.' }
        ]
      },
      'EXT-02': {
        status: 'Open',
        acceptance: null,
        retest: null,
        history: [
          { date: '8 Aug 2026', title: 'Finding issued', detail: 'Finding recorded in the approved fictional assessment.' }
        ]
      },
      'EXT-03': {
        status: 'Open',
        acceptance: null,
        retest: null,
        history: [
          { date: '8 Aug 2026', title: 'Finding issued', detail: 'Finding recorded in the approved fictional assessment.' }
        ]
      },
      'WEB-01': {
        status: 'Risk Accepted',
        acceptance: {
          reason: 'The client is replacing the affected portal during the next planned application release and has chosen to tolerate the remaining exposure until migration.',
          owner: 'Head of Applications',
          compensatingControls: 'Administrative access is restricted and application logging is monitored. These controls are recorded as client-supplied context and have not been independently assessed as part of this acceptance record.',
          plannedRemediation: 'Replace the legacy portal and implement the approved browser-security baseline during migration.',
          acceptanceDate: '19 Aug 2026',
          reviewDate: '19 Nov 2026',
          notes: 'Fictional demonstration record.'
        },
        retest: null,
        history: [
          { date: '8 Aug 2026', title: 'Finding issued', detail: 'Finding recorded in the approved fictional assessment.' },
          { date: '19 Aug 2026', title: 'Risk acceptance recorded', detail: 'Client-side risk owner accepted the unresolved finding for a defined period.' }
        ]
      },
      'ID-01': {
        status: 'Retest Requested',
        acceptance: null,
        retest: {
          whatChanged: 'A revised Conditional Access policy has been enabled for all workforce users and privileged administrator roles.',
          affectedScope: 'Workforce user accounts and privileged administrator accounts listed in the original assessment scope.',
          exceptions: 'Two emergency-access accounts remain excluded under the client emergency-access procedure.',
          changeReference: 'CHG-2026-0819-07',
          evidence: [
            { name: 'conditional-access-policy.pdf', size: 184320 },
            { name: 'representative-signin-results.txt', size: 14321 }
          ],
          requestedDate: '19 Aug 2026',
          statement: 'Client believes remediation is complete across the stated scope and requests independent validation.'
        },
        history: [
          { date: '8 Aug 2026', title: 'Finding issued', detail: 'Finding recorded in the approved fictional assessment.' },
          { date: '19 Aug 2026', title: 'Retest requested', detail: 'Remediation notes and supporting evidence were submitted for independent validation.' }
        ]
      }
    }
  };
})();
