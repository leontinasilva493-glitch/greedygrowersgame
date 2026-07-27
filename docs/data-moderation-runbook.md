# Data Moderation Runbook

Last reviewed: 2026-07-26

## Scope

This runbook governs pending evidence intake, approval, rejection, deletion, expiry, and rollback for the public Greedy Growers dataset.

## Receipt-first intake rule

- Every pending submission must have a receipt ID before any reviewer action.
- The receipt ID is the deletion lookup key. Do not require an email address.
- A receipt must map to the original pending payload, review notes, and final disposition.

For local workflow testing only, set `MODERATION_INBOX_DRIVER=file`. Records
are written under ignored `.local-data/moderation/records/`; production refuses
this driver and must use the private webhook inbox. Use `npm run moderation --
show <receipt>`, `review`, and `purge` to exercise the receipt lifecycle. A
local `approved` decision never edits canonical `data/` files.
Every raw local-inbox payload, including an approved one, is deleted when its
`expiresAt` timestamp passes. Promote accepted facts to reviewed canonical data
before that deadline; the canonical changelog is the durable audit record.

## Review flow

1. Locate the pending item by receipt ID.
2. Open the evidence URL in a safe browser context and verify the URL still resolves.
3. Confirm the submission includes enough protocol data:
   - source URL
   - capture date
   - game version or explicit `unverified`
   - tree ID or session context
   - times, ages, values, and event outcome when applicable
4. Redact or reject personal details before any public promotion.
   - Never publish real names, private contact details, usernames of minors, chat logs, or unrelated player information.
5. Compare the evidence against existing seed, observation, growth, and source records.
6. Assign canonical IDs for any approved additions:
   - `sourceId`
   - `treeInstanceId`
   - `serverSessionId`
   - `seedId`
   - `gameVersion`
7. Reject the item if:
   - the evidence cannot be opened safely
   - the protocol is incomplete
   - the version is unclear and the record would be misleading
   - the payload contains unverifiable, fabricated, or privacy-sensitive content
8. Approve only by writing explicit JSON records into the versioned data files.
9. Add a changelog row with reviewer ID, method version, source IDs, and record IDs.
10. Run validation and tests before release.

## Required verification before release

Run these commands after any approved data change:

```powershell
npm run test -- features/data
npx vitest run features/lightning/growth.test.ts components/data/status-summary.test.ts components/data/seed-detail-model.test.ts
npm run lint
npm run typecheck
npm run build
```

Review the JSON diff before deployment. Confirm pending or rejected items did not enter public selectors.

## Deletion requests

- A valid receipt ID is sufficient to open a deletion request.
- No email collection is required.
- Target SLA: acknowledge within 7 calendar days and resolve within 30 calendar days.
- If the record already shipped publicly, remove the public JSON rows, add a changelog note, rerun validation, and redeploy.

## Retention and expiry

- Pending items expire after the owner-approved retention window.
- Rejected items should be purged after the retention window unless legal or abuse review requires a shorter hold.
- Approved raw inbox payloads expire on the same configured deadline as other
  submissions. Approved public records in canonical `data/` remain versioned
  until superseded, redacted, or rolled back.

## Minor-safety escalation

- If the payload appears to involve a minor or exposes child-identifying information, stop normal review.
- Do not publish the material.
- Escalate immediately to the project owner for deletion or permanent rejection.

## Reviewer identity and audit trail

- Every approval or rejection must record the reviewer handle, timestamp, receipt ID, and rationale.
- Keep the review reason specific enough to audit without reproducing private data.

## Rollback

Use rollback when an approved record was promoted incorrectly.

1. Identify the bad record IDs and source IDs.
2. Revert only the affected JSON rows.
3. Add a changelog entry describing the rollback.
4. Rerun validation, tests, and build.
5. Redeploy and recheck the affected public route.

## Disposal of rejected items

- Rejected items must not enter the public dataset.
- After the retention window, delete the rejected payload and keep only the minimum audit metadata needed for abuse or dispute handling.
