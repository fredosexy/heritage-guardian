# Separate proposal: invited-user corrections (not implemented)

## Existing architecture inspected
- `dossiers.user_id` identifies the owner. Existing dossier update policies permit the owner only; participant policies permit reading, not updating.
- `participants` contains roles and invitation/acceptance timestamps. Its repository currently only reads participants.
- `dossier_steps` and procedure RPCs track journeys, not correction approval.
- Local `conflicts` holds competing offline owner edits, not attributed participant proposals. It must not become an implicit approval channel.
- Generated types and checked-in migrations contain no correction-proposal table, submission RPC, acceptance RPC or proposal status.

## Blocking dependency
A durable, attributed proposal and owner-authorized acceptance mechanism is absent. Storing a proposal in dossier metadata would require the guest to write the dossier and violate the owner-only rule. Reusing local conflict resolution would lose proposal identity and approval history. Therefore guest proposals remain unavailable, and guests cannot save main fields or Terrain sections through the edit screens.

## Proposed separate scope, requiring approval
1. Decide allowed participant roles, invitation acceptance requirements, allowed fields/sections, proposal lifecycle and owner notifications.
2. Design a proposal record (dossier reference, proposer identity, proposed values, base revision, status, decision attribution/timestamps) and owner-only accept/reject mechanism. Names and signatures are not chosen in this intervention.
3. Acceptance must atomically verify current ownership and base revision, apply accepted changes and record the decision; stale proposals must require owner review.
4. Design read/submit/decide policies and grants, plus offline submission identity/idempotency and per-user cache isolation.
5. Test guest submission without dossier mutation, owner acceptance, guest acceptance denial, rejection, replay, account changes and stale revisions before any migration is approved/applied.

No schema change, migration, cloud operation or user-data alteration was performed for this proposal.

## Proof replay limitations
This intervention uses the existing proofs primary key rather than assuming storage_path uniqueness. Legacy queued uploads get their ID persisted before network writes. Existing rows with the same path must match dossier, uploader and section; duplicates/mismatches remain queued for explicit review. No proof row/object is deleted as a repair.

Storage overwrite permissions and deployed schema/index state were deliberately not queried or changed. If the existing Storage policy rejects overwrite, retry fails visibly and preserves the operation. Browser Web Locks serialize supported clients; separate devices or clients without Web Locks can still race on legacy paths with independently assigned IDs. Full cross-device path uniqueness needs a separately approved server guarantee. Generic create-dossier replay idempotency and account-scoped local queue/conflict visibility are outside this limited patch.