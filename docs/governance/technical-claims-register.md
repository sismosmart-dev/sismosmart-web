# Technical claims register

Last reviewed: 2026-10-01

## Purpose

This register governs high-impact product, safety, security, privacy, certification, and operational claims published by SismoSmart. It is an engineering and content-control record, not legal advice. The public site must not present a design target, roadmap item, simulation result, or unverified estimate as a deployed and independently validated capability.

Every material claim needs four things before publication: a **Claim class**, an **Evidence status**, **Approved wording**, and a **Translation rule**. Product and legal owners must review the register before launch, after a material architecture change, and before adding a new locale.

## Status vocabulary

- **Deployed and observed:** verified on the current website or production control plane with repeatable evidence.
- **Implemented, validation pending:** code or hardware exists, but pilot validation, independent testing, or production evidence is incomplete.
- **Design target:** planned behavior or specification; it must be written as a target, not a current fact.
- **Roadmap:** intended future work with no delivery guarantee.
- **Prohibited absolute:** wording that must not be used because it implies certainty the evidence cannot support.

## Claim matrix

| Claim class | Evidence status | Approved wording | Required evidence and owner |
| --- | --- | --- | --- |
| Website availability, HTTPS, security headers, consent | Deployed and observed | State only the controls verified by CI, production-health, Lighthouse, and security workflows. | Exact-SHA workflow evidence; Web/Operations owner. |
| Sensor model, sample rate, range, noise floor, and sensitivity comparisons | Design target until a frozen bill of materials and bench report exist | “The current design targets an ADXL355-class sensor, 250 Hz three-axis sampling, and the documented noise objective.” Do not use “lab-grade” or phone-sensitivity multiples as validated facts without a cited test report. | Signed BOM, calibration method, raw measurements, environmental conditions; Hardware owner. |
| STA/LTA and event detection | Implemented or design target; pilot validation pending | “Pilot calibration is intended to distinguish common building noise from shaking; false positives and missed events remain possible.” | Versioned algorithm, labelled test corpus, threshold rationale, false-positive/false-negative results, pilot validation. |
| Earthquake early warning, building safety, damage, and emergency outcomes | Prohibited absolute | “SismoSmart is not an emergency service, is not an official warning system, and cannot determine whether a building is safe. Follow official alerts and qualified engineers.” | No marketing exception. Any later claim requires formal product, engineering, regulatory, and legal approval. |
| Natural-frequency change and structural-health interpretation | Validation pending | “A change in measured vibration characteristics may provide engineers with additional evidence; it is not a diagnosis.” | Sensor validation, baseline methodology, uncertainty bounds, engineer review, pilot case evidence. |
| Cloud correlation, notification timing, offline buffering, and power bridge | Design target until end-to-end pilot validation | Use “designed to,” “target,” or “planned” and name dependencies such as connectivity, power, device placement, and cloud availability. | End-to-end test plan, timestamps, outage cases, firmware/build identifiers, pilot evidence. |
| Encryption, signed firmware, encrypted flash, unique device keys, OTA rollback | Website controls are deployed; device controls are roadmap/design targets | Distinguish current website HTTPS from planned device security. Never say device traffic is end-to-end encrypted until the implemented protocol and key lifecycle are reviewed. | Threat model, protocol configuration, key provisioning record, firmware signing and rollback tests; Security/Hardware owners. |
| CE, RED, BTK, RoHS, WEEE, FCC, or other certification | Roadmap until a certificate or formal approval exists | “Certification is planned/targeted.” Do not use “certified,” “approved,” or a certification mark before documentary evidence exists. | Certificate, scope, model identifier, issuer, validity dates; Compliance owner. |
| Data residency, international transfers, retention, and lawful basis | Pilot policy pending | “Before device data is collected, the pilot agreement will identify processing locations, transfers, retention, and the applicable legal basis.” Avoid an absolute statement that all data stays in one country without a verified architecture and approved policy. | Data-flow inventory, processor/subprocessor list, DPA/pilot agreement, retention schedule, privacy review. |
| Privacy, anonymisation, and research access | Policy and implementation dependent | State what the current website collects. Describe device/research flows as future and conditional until contracts and technical controls exist. | Data inventory, consent basis, access controls, anonymisation assessment, agreement template. |
| Market size, pricing, unit economics, fundraising, runway, grants, and roadmap dates | Dated planning assumptions | Label as estimates or targets and attach an “as of” date in investor material. They must not be represented as audited results or committed delivery dates. | Approved financial model/source, owner, review date. |

## Translation rule

1. English is the control wording for this register; Turkish is the first reviewed operational translation.
2. Every locale must preserve modality and uncertainty. “Designed to,” “target,” “may,” “planned,” and “validation pending” must never become a statement of current certainty.
3. The phrases **not an emergency service**, **does not determine whether a building is safe**, and **pilot validation** must retain their full safety meaning in every translation.
4. Certification names, performance numbers, legal terms, and data-residency statements require a second reviewer familiar with the target language and the underlying evidence.
5. Machine translation may be used only as a draft. Approval must be recorded in the pull request that changes the claim.

## Review and release process

- A pull request changing a registered claim must identify the claim class, evidence link or evidence status, and all affected locales.
- CI verifies canonical/hreflang, sitemap, browser accessibility, and the presence of the global safety and pre-launch notices.
- Product, Engineering, and the responsible domain owner review high-risk wording. Legal review is required where regulation, certification, privacy, insurance, safety, or investment solicitation is implicated.
- Evidence links may point to private controlled records. Secrets, personal data, customer data, and confidential raw reports must not be copied into this repository.
- Re-review occurs quarterly, before a pilot begins, before certification claims change, and after any product incident or material architecture change.
