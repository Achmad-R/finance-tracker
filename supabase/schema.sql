-- ============================================================================
-- Finance Tracker — Supabase schema (Postgres)
-- Run this in the Supabase SQL editor, then enable Google OAuth in Auth.
-- Money is stored as integer "sen" (1/100 of IDR) to avoid float errors.
-- ============================================================================

create table if not exists accounts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  type        text not null check (type in ('asset', 'liability')),
  created_at  timestamptz not null default now()
);

create table if not exists categories (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  name      text not null,
  parent_id uuid references categories(id) on delete cascade,
  kind      text not null check (kind in ('income', 'expense'))
);

create table if not exists transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  account_id   uuid not null references accounts(id) on delete cascade,
  to_account_id uuid references accounts(id) on delete cascade,
  category_id  uuid references categories(id) on delete set null,
  amount       integer not null check (amount >= 0),
  type         text not null check (type in ('income', 'expense', 'transfer', 'opening')),
  occurred_at  timestamptz not null default now(),
  note         text,
  created_at   timestamptz not null default now()
);

create table if not exists budgets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  amount     integer not null check (amount >= 0),
  month      date not null
);

create table if not exists recurring_rules (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  account_id   uuid not null references accounts(id) on delete cascade,
  to_account_id uuid references accounts(id) on delete cascade,
  category_id  uuid references categories(id) on delete set null,
  amount       integer not null check (amount >= 0),
  type         text not null check (type in ('income', 'expense', 'transfer', 'opening')),
  frequency    text not null check (frequency in ('daily', 'weekly', 'monthly')),
  interval     integer not null default 1 check (interval >= 1),
  next_run     timestamptz not null,
  end_at       timestamptz,
  note         text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_transactions_user       on transactions(user_id);
create index if not exists idx_transactions_account    on transactions(account_id);
create index if not exists idx_transactions_occurred    on transactions(user_id, occurred_at);
create index if not exists idx_categories_user         on categories(user_id);
create index if not exists idx_budgets_user_month      on budgets(user_id, month);
create index if not exists idx_recurring_user_next     on recurring_rules(user_id, next_run);

-- ----------------------------------------------------------------------------
-- Row Level Security: every row is scoped to the authenticated user.
-- ----------------------------------------------------------------------------
alter table accounts        enable row level security;
alter table categories      enable row level security;
alter table transactions    enable row level security;
alter table budgets         enable row level security;
alter table recurring_rules enable row level security;

do $$
declare t text;
begin
  foreach t in array array['accounts','categories','transactions','budgets','recurring_rules']
  loop
    execute format(
      'create policy "own %1$s" on %1$s for all
       using (auth.uid() = user_id)
       with check (auth.uid() = user_id);',
      t
    );
  end loop;
end $$;
