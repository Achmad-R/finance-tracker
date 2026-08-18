# ADR 0003: Single-entry transactions with derived balances

- Status: Accepted
- Date: 2026-08-13

## Context
Personal finance needs accurate account balances and net worth, but double-entry
bookkeeping is heavy for a single user. The risk is storing a balance that
drifts out of sync with the transaction history.

## Decision
Use **single-entry** transactions. An account's balance is always **derived** by
aggregating its transactions (income/expense/opening add or subtract; transfers
move between accounts with no P&L effect). Opening balances are represented as a
special `opening` transaction so there is exactly one source of truth.

## Consequences
- Balances and net worth are always consistent with history.
- Reporting (cashflow, category breakdown) reads straight from transactions.
- Transfers require a `to_account_id` and are excluded from P&L aggregates.
