/** Preserve the exact persisted diagnostic alongside a short actionable explanation. */
export function syncErrorHint(message: string): string {
  if (/owner|permission|policy|row.level|42501|unauthorized/i.test(message)) return "sync.errorPermission";
  if (/sign in|session|jwt|token|account/i.test(message)) return "sync.errorSession";
  if (/multiple proof|mismatch|invalid|unsupported|constraint|42P10/i.test(message)) return "sync.errorReview";
  if (/network|fetch|offline|connection|timeout|storage/i.test(message)) return "sync.errorNetwork";
  return "sync.errorRetry";
}