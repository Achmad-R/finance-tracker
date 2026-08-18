# ADR 0002: Per-user data isolation via Supabase RLS

- Status: Accepted
- Date: 2026-08-13

## Context
Even though the app is single-user per account, data lives in a shared Postgres
database. A bug in query filtering could leak one user's finances to another.
We need isolation enforced at the database, not just the app layer.

## Decision
Every table carries a `user_id` column and has **Row Level Security** enabled.
A single policy on each table allows `all` operations only when
`auth.uid() = user_id`. App queries never filter by user manually for security —
RLS is the guarantee.

## Consequences
- Data isolation is enforced even if application code forgets a filter.
- Every insert must set `user_id` from the authenticated session.
- Service-role key (bypasses RLS) must never be shipped to the browser.
