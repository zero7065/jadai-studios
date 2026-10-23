/**
 * db-ledger.ts
 * Nightly ledger audit check - P25
 *
 * Ensures zero ledger mismatches before soft launch.
 * Validates that all transactions, balances, and ledger entries reconcile.
 */

// Types for ledger audit
export interface LedgerEntry {
  id: string;
  user_id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: 'NGN' | 'USD';
  reference: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: Date;
  updated_at: Date;
}

export interface LedgerAuditResult {
  totalCredits: number;
  totalDebits: number;
  netBalance: number;
  mismatches: MismatchRecord[];
  isValid: boolean;
}

export interface MismatchRecord {
  id: string;
  type: 'balance_mismatch' | 'duplicate_transaction' | 'missing_entry' | 'invalid_status';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  affected_rows: number;
}

/**
 * Run nightly ledger audit to validate financial integrity
 * Returns audit result with any mismatches found
 */
export async function auditLedger(
  entries: LedgerEntry[],
  options: { dateRange?: { start: Date; end: Date } } = {}
): Promise<LedgerAuditResult> {
  const { dateRange } = options;
  const startDate = dateRange?.start || new Date(Date.now() - 24 * 60 * 60 * 1000); // default: last 24h
  const endDate = dateRange?.end || new Date();

  // Filter entries within the date range
  const filtered = entries.filter(
    (e) => new Date(e.created_at) >= startDate && new Date(e.created_at) <= endDate
  );

  if (!filtered || filtered.length === 0) {
    return {
      totalCredits: 0,
      totalDebits: 0,
      netBalance: 0,
      mismatches: [],
      isValid: true,
    };
  }

  // Calculate totals and detect mismatches
  let totalCredits = 0;
  let totalDebits = 0;
  const mismatches: MismatchRecord[] = [];
  const seenReferences = new Set<string>();

  // Check for duplicate transactions
  const referenceCounts = new Map<string, number>();
  filtered.forEach((entry) => {
    if (!referenceCounts.has(entry.reference)) {
      referenceCounts.set(entry.reference, 0);
    }
    referenceCounts.set(entry.reference, referenceCounts.get(entry.reference) + 1);
  });

  // Check for duplicate references
  referenceCounts.forEach((count, reference) => {
    if (count > 1) {
      mismatches.push({
        id: `dup_${reference}`,
        type: 'duplicate_transaction',
        severity: 'critical',
        description: `Duplicate transaction reference found: ${reference}`,
        affected_rows: count,
      });
    }
  });

  // Process each entry
  filtered.forEach((entry) => {
    const amount = Math.abs(entry.amount);

    if (entry.type === 'credit') {
      totalCredits += amount;
    } else if (entry.type === 'debit') {
      totalDebits += amount;
    }

    // Check for invalid statuses
    if (!['pending', 'completed', 'failed'].includes(entry.status)) {
      mismatches.push({
        id: `invstatus_${entry.id}`,
        type: 'invalid_status',
        severity: 'warning',
        description: `Invalid ledger status: ${entry.status}`,
        affected_rows: 1,
      });
    }

    // Track references for duplicate detection
    if (seenReferences.has(entry.reference)) {
      mismatches.push({
        id: `dup2_${entry.reference}`,
        type: 'duplicate_transaction',
        severity: 'critical',
        description: `Duplicate transaction reference: ${entry.reference}`,
        affected_rows: 2,
      });
    }
    seenReferences.add(entry.reference);
  });

  const netBalance = totalCredits - totalDebits;

  // Add balance mismatch note if net balance exists and no other mismatches
  if (Math.abs(netBalance) > 0 && mismatches.length === 0) {
    mismatches.push({
      id: 'net_balance',
      type: 'balance_mismatch',
      severity: 'info',
      description: `Net ledger balance: $${netBalance.toLocaleString()} (credits ${netBalance > 0 ? 'exceed' : 'are exceeded'} by debits)`,
      affected_rows: filtered.length,
    });
  }

  return {
    totalCredits,
    totalDebits,
    netBalance,
    mismatches,
    isValid: mismatches.length === 0,
  };
}

/**
 * Validate that user balances match ledger entries
 * Checks for individual user balance integrity
 */
export function validateUserBalances(
  entries: LedgerEntry[],
  userIds: string[],
  currentBalances: Record<string, number>
): Array<{ userId: string; expectedBalance: number; actualBalance: number; mismatch: boolean }> {
  const results: Array<{ userId: string; expectedBalance: number; actualBalance: number; mismatch: boolean }> = [];

  for (const userId of userIds) {
    // Get total credits for user
    const userCredits = entries
      .filter((e) => e.user_id === userId && e.type === 'credit')
      .reduce((sum, e) => sum + e.amount, 0);

    // Get total debits for user
    const userDebits = entries
      .filter((e) => e.user_id === userId && e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);

    // Get user's current profile balance
    const expectedBalance = userCredits - userDebits;
    const actualBalance = currentBalances[userId] || 0;
    const mismatch = Math.abs(expectedBalance - actualBalance) > 0.01;

    results.push({
      userId,
      expectedBalance,
      actualBalance,
      mismatch,
    });
  }

  return results;
}

/**
 * Generate audit report for compliance and logging
 */
export function generateAuditReport(result: LedgerAuditResult): string {
  const lines: string[] = [];
  lines.push('=== Ledger Audit Report ===');
  lines.push(`Date: ${new Date().toISOString()}`);
  lines.push(`Total Credits: $${result.totalCredits.toLocaleString()}`);
  lines.push(`Total Debits: $${result.totalDebits.toLocaleString()}`);
  lines.push(`Net Balance: $${result.netBalance.toLocaleString()}`);
  lines.push(`Valid: ${result.isValid}`);
  lines.push('');

  if (result.mismatches.length > 0) {
    lines.push('Mismatches Found:');
    result.mismatches.forEach((m) => {
      lines.push(`  [${m.severity.toUpperCase()}] ${m.type}: ${m.description}`);
      lines.push(`    Affected rows: ${m.affected_rows}`);
    });
    lines.push('');
  } else {
    lines.push('No mismatches found. Ledger is valid.');
    lines.push('');
  }

  lines.push('=========================');
  return lines.join('\n');
}

export type { LedgerEntry, LedgerAuditResult, MismatchRecord };