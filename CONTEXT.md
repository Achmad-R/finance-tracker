# Context

Glossary for the **Expense & Personal Finance Tracker**. This file is a glossary
and nothing else — no implementation details, no specs.

## Glossary

- **User** — A single person who owns their data. Authenticated via Supabase
  (email/password or Google OAuth). One user per account; no sharing.
- **Account** — A container of money. `type` is either `asset` (bank, cash,
  e-wallet — positive balance) or `liability` (credit card, loan — owed).
  Balance is **derived**, never stored.
- **Category** — A label for classifying transactions. Organised as a **tree**
  via `parent_id`. `kind` is `income` or `expense`.
- **Transaction** — A single money movement, recorded **single-entry**.
  `type` is one of: `income`, `expense`, `transfer`, `opening`.
  `amount` is an integer in **sen** (1/100 IDR).
- **Transfer** — A transaction with a `to_account_id`: money moves between two
  accounts. It has **zero net effect** on profit & loss.
- **Opening balance** — A transaction of `type = opening` used to seed an
  account's starting balance, since balances are derived from transactions.
- **Budget** — A spending limit for one `category` in one calendar `month`.
- **Recurring rule** — A template that auto-creates `income`/`expense`
  transactions on a `daily`/`weekly`/`monthly` cadence until `end_at`.
- **Currency** — IDR only. All amounts stored as integer sen.
- **Timezone** — Timestamps stored as UTC (`timestamptz`); displayed in
  `Asia/Jakarta`.
