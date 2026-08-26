// ---------------------------------------------------------------------------
// Talos · ops/retry — retry policy (pure, deterministic).
//
// A retryable failure schedules a retry with bounded exponential backoff; a
// semantic (non-retryable) failure does not. When attempts are exhausted the
// mission is dead-lettered, never retried forever. No wall-clock here — the
// caller passes `now`, so scheduling is deterministic and testable.
// ---------------------------------------------------------------------------

export interface RetryPolicy {
  /** Total attempts allowed (1 = no retry). */
  readonly maxAttempts: number;
  /** First backoff, in ms. */
  readonly baseDelayMs: number;
  /** Multiplier per attempt. */
  readonly factor: number;
  /** Cap on a single backoff, in ms. */
  readonly maxDelayMs: number;
}

export const DEFAULT_RETRY: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  factor: 2,
  maxDelayMs: 60_000,
};

/** Backoff before the Nth retry (attempt is the number just failed, 1-based). */
export function backoffMs(policy: RetryPolicy, attempt: number): number {
  const raw = policy.baseDelayMs * Math.pow(policy.factor, Math.max(0, attempt - 1));
  return Math.min(raw, policy.maxDelayMs);
}

export type RetryDecision =
  | { readonly kind: "retry"; readonly nextRunAt: number; readonly attempt: number }
  | { readonly kind: "fail"; readonly reason: string } // semantic failure → FAILED
  | { readonly kind: "dead-letter"; readonly reason: string }; // exhausted → DEAD_LETTERED

/** Decide what happens after a failed attempt.
 *  - non-retryable failure → FAILED immediately (a semantic failure).
 *  - attempts exhausted     → DEAD_LETTERED.
 *  - otherwise              → schedule a retry at now + backoff. */
export function decideRetry(
  policy: RetryPolicy,
  attempt: number,
  retryable: boolean,
  now: number,
): RetryDecision {
  if (!retryable) return { kind: "fail", reason: "non-retryable (semantic) failure" };
  if (attempt >= policy.maxAttempts) {
    return { kind: "dead-letter", reason: `retries exhausted after ${attempt} attempt(s)` };
  }
  return { kind: "retry", nextRunAt: now + backoffMs(policy, attempt), attempt };
}
