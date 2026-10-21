# Architecture rules
- Keep dossier ownership checks in a shared service and retain server owner policies as the security boundary; UI visibility is not authorization.
- Replay queued proof uploads with a durably persisted primary-key ID, fixed storage path and verified section attachment; never assume a unique storage-path index or repair cloud records silently.
- Keep synchronization ordered and stop a pass on failure; only successful passes may request a follow-up for edits queued in flight, avoiding immediate failure retry loops.