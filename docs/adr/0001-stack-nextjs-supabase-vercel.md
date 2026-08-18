# ADR 0001: Stack — Next.js + Supabase + Vercel

- Status: Accepted
- Date: 2026-08-13

## Context
We need a portfolio-grade personal finance tracker: cloud-synced, multi-device,
and deployable for free. The developer wants a coherent path from MVP to a
hosted app without re-platforming.

## Decision
Build with **Next.js (App Router, TypeScript)** for the web app, **Supabase**
(Postgres + Auth) as the backend, and deploy to **Vercel**. Mutations use
Next.js Server Actions; auth uses `@supabase/ssr`.

## Consequences
- Free tier covers the MVP; Postgres gives us relational integrity and RLS.
- Vendor lock-in to Supabase/Vercel, acceptable for a portfolio project.
- Server Actions remove the need for a hand-rolled API layer.
