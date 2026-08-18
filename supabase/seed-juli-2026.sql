-- ============================================================================
-- Finance Tracker — Demo seed: July 2026 (plus May/Jun/Aug context)
-- Run this in the Supabase SQL editor. Idempotent for a single user.
-- WARNING: deletes ALL current data of the newest user in the project,
--          then inserts demo accounts, categories, transactions, budgets
--          and recurring rules.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- Target user: the only (newest) user in the project
-- ----------------------------------------------------------------------------
create temp table _uid on commit drop as
  select id from auth.users order by created_at desc limit 1;

-- ----------------------------------------------------------------------------
-- Purge existing demo/user data
-- ----------------------------------------------------------------------------
delete from budgets        where user_id in (select id from _uid);
delete from recurring_rules where user_id in (select id from _uid);
delete from transactions   where user_id in (select id from _uid);
delete from accounts       where user_id in (select id from _uid);
delete from categories     where user_id in (select id from _uid);

-- ----------------------------------------------------------------------------
-- Accounts
-- ----------------------------------------------------------------------------
insert into accounts (user_id, name, type)
select u.id, v.name, v.type
from _uid u
cross join (values
  ('Bank BCA',        'asset'),
  ('Dompet',          'asset'),
  ('Kartu Kredit',    'liability')
) as v(name, type);

-- ----------------------------------------------------------------------------
-- Categories (parents)
-- ----------------------------------------------------------------------------
insert into categories (user_id, name, kind)
select u.id, v.name, v.kind
from _uid u
cross join (values
  ('Pemasukan', 'income'),
  ('Makanan',   'expense'),
  ('Transport', 'expense'),
  ('Hiburan',   'expense'),
  ('Tagihan',   'expense'),
  ('Belanja',   'expense'),
  ('Kesehatan', 'expense')
) as v(name, kind);

-- ----------------------------------------------------------------------------
-- Categories (children)
-- ----------------------------------------------------------------------------
insert into categories (user_id, name, kind, parent_id)
select u.id, v.name, 'expense', p.id
from _uid u
cross join (values
  ('Restoran',          'Makanan'),
  ('Bensin',            'Transport'),
  ('Transportasi Umum', 'Transport'),
  ('Listrik',           'Tagihan'),
  ('Internet',          'Tagihan')
) as v(name, parent)
join categories p on p.user_id = u.id and p.name = v.parent;

-- ----------------------------------------------------------------------------
-- Transactions — amounts in sen (1/100 IDR), times Asia/Jakarta
-- ----------------------------------------------------------------------------
insert into transactions
  (user_id, account_id, to_account_id, category_id, amount, type, occurred_at, note)
select u.id, a.id, ta.id, c.id, t.amount, t.type, t.occurred_at::timestamptz, t.note
from _uid u
cross join (values
  -- Opening balances (May)
  ('Bank BCA',     null,        null,       2000000000, 'opening', '2026-05-01 09:00+07', 'Saldo awal'),
  ('Dompet',       null,        null,       150000000,  'opening', '2026-05-01 09:00+07', 'Saldo awal'),
  ('Kartu Kredit', null,        null,       350000000,  'opening', '2026-05-01 09:00+07', 'Saldo awal'),
  -- May
  ('Bank BCA',     null,        'Pemasukan', 1200000000, 'income',  '2026-05-01 10:00+07', 'Gaji Mei'),
  ('Dompet',       null,        'Makanan',   15000000,   'expense', '2026-05-05 12:00+07', null),
  ('Dompet',       null,        'Transport', 6000000,    'expense', '2026-05-08 08:00+07', null),
  ('Bank BCA',     null,        'Listrik',   38000000,   'expense', '2026-05-15 09:00+07', 'Tagihan listrik'),
  ('Dompet',       null,        'Hiburan',   20000000,   'expense', '2026-05-20 19:00+07', 'Nonton bioskop'),
  ('Bank BCA',     'Kartu Kredit', null,     200000000,  'transfer','2026-05-25 09:00+07', 'Bayar kartu kredit'),
  -- June
  ('Bank BCA',     null,        'Pemasukan', 1200000000, 'income',  '2026-06-01 10:00+07', 'Gaji Juni'),
  ('Dompet',       null,        'Restoran',  32000000,   'expense', '2026-06-04 19:30+07', 'Makan keluarga'),
  ('Bank BCA',     null,        'Belanja',   75000000,   'expense', '2026-06-10 15:00+07', 'Belanja bulanan'),
  ('Dompet',       null,        'Bensin',    4500000,    'expense', '2026-06-12 07:30+07', null),
  ('Bank BCA',     null,        'Internet',  35000000,   'expense', '2026-06-15 09:00+07', 'WiFi bulanan'),
  ('Dompet',       null,        'Kesehatan', 25000000,   'expense', '2026-06-18 10:00+07', 'Konsultasi dokter'),
  ('Bank BCA',     'Kartu Kredit', null,     200000000,  'transfer','2026-06-25 09:00+07', 'Bayar kartu kredit'),
  -- July 2026 (main demo month)
  ('Bank BCA',     null,        'Pemasukan', 1200000000, 'income',  '2026-07-01 09:00+07', 'Gaji Juli'),
  ('Dompet',       null,        'Makanan',   18000000,   'expense', '2026-07-02 12:30+07', 'Makan siang'),
  ('Bank BCA',     null,        'Bensin',    25000000,   'expense', '2026-07-03 07:30+07', null),
  ('Bank BCA',     'Dompet',    null,        100000000,  'transfer','2026-07-04 09:00+07', 'Tarik tunai'),
  ('Dompet',       null,        'Makanan',   12000000,   'expense', '2026-07-05 13:00+07', null),
  ('Dompet',       null,        'Restoran',  45000000,   'expense', '2026-07-08 19:00+07', 'Makan keluarga'),
  ('Dompet',       null,        'Transportasi Umum', 4000000, 'expense', '2026-07-09 08:00+07', 'Gojek'),
  ('Dompet',       null,        'Hiburan',   14900000,   'expense', '2026-07-10 12:00+07', 'Langganan Netflix'),
  ('Bank BCA',     null,        'Listrik',   42000000,   'expense', '2026-07-12 09:00+07', 'Tagihan listrik'),
  ('Bank BCA',     null,        'Internet',  35000000,   'expense', '2026-07-13 09:00+07', 'WiFi bulanan'),
  ('Bank BCA',     null,        'Pemasukan', 250000000,  'income',  '2026-07-15 09:00+07', 'Bonus proyek'),
  ('Bank BCA',     null,        'Belanja',   125000000,  'expense', '2026-07-16 15:00+07', 'Belanja bulanan'),
  ('Dompet',       null,        'Hiburan',   55000000,   'expense', '2026-07-18 20:00+07', 'Konser musik'),
  ('Dompet',       null,        'Kesehatan', 18000000,   'expense', '2026-07-20 10:00+07', 'Vitamin dan obat'),
  ('Kartu Kredit', null,        'Restoran',  26000000,   'expense', '2026-07-22 19:30+07', 'Dinner'),
  ('Kartu Kredit', null,        'Belanja',   89000000,   'expense', '2026-07-24 14:00+07', 'Belanja online'),
  ('Bank BCA',     'Kartu Kredit', null,     300000000,  'transfer','2026-07-25 09:00+07', 'Bayar kartu kredit'),
  -- August (current month, so dashboard "Bulan ini" and category chart have data)
  ('Bank BCA',     null,        'Pemasukan', 1200000000, 'income',  '2026-08-01 09:00+07', 'Gaji Agustus'),
  ('Dompet',       null,        'Makanan',   14000000,   'expense', '2026-08-03 12:00+07', null),
  ('Dompet',       null,        'Bensin',    3000000,    'expense', '2026-08-05 07:30+07', null),
  ('Bank BCA',     null,        'Listrik',   40000000,   'expense', '2026-08-10 09:00+07', 'Tagihan listrik')
) as t(acc, to_acc, cat, amount, type, occurred_at, note)
left join accounts   a  on a.user_id = u.id and a.name  = t.acc
left join accounts   ta on ta.user_id = u.id and ta.name = t.to_acc
left join categories c  on c.user_id = u.id and c.name  = t.cat;

-- ----------------------------------------------------------------------------
-- Budgets — July 2026 + August 2026
-- ----------------------------------------------------------------------------
insert into budgets (user_id, category_id, amount, month)
select u.id, c.id, t.amount, t.month::date
from _uid u
cross join (values
  ('Makanan',          50000000,  '2026-07-01'),
  ('Restoran',         50000000,  '2026-07-01'),
  ('Bensin',           30000000,  '2026-07-01'),
  ('Transportasi Umum', 10000000, '2026-07-01'),
  ('Hiburan',          75000000,  '2026-07-01'),
  ('Listrik',          45000000,  '2026-07-01'),
  ('Internet',         35000000,  '2026-07-01'),
  ('Belanja',          200000000, '2026-07-01'),
  ('Kesehatan',        30000000,  '2026-07-01'),
  ('Makanan',          50000000,  '2026-08-01'),
  ('Bensin',           30000000,  '2026-08-01'),
  ('Listrik',          45000000,  '2026-08-01'),
  ('Hiburan',          75000000,  '2026-08-01')
) as t(name, amount, month)
join categories c on c.user_id = u.id and c.name = t.name;

-- ----------------------------------------------------------------------------
-- Recurring rules — all next_run in the future so nothing auto-generates yet
-- ----------------------------------------------------------------------------
insert into recurring_rules
  (user_id, account_id, to_account_id, category_id, amount, type, frequency,
   interval, next_run, end_at, note)
select u.id, a.id, ta.id, c.id, t.amount, t.type, t.frequency, t.interval,
       t.next_run::timestamptz, null, t.note
from _uid u
cross join (values
  ('Bank BCA',     null,        'Pemasukan', 1200000000, 'income',  'monthly', 1, '2026-09-01 09:00+07', 'Gaji bulanan'),
  ('Dompet',       null,        'Makanan',   10000000,   'expense', 'weekly',  1, '2026-08-21 08:00+07', 'Jajan mingguan'),
  ('Bank BCA',     'Kartu Kredit', null,     200000000,  'transfer','monthly', 1, '2026-08-25 09:00+07', 'Bayar kartu kredit bulanan')
) as t(acc, to_acc, cat, amount, type, frequency, interval, next_run, note)
left join accounts   a  on a.user_id = u.id and a.name  = t.acc
left join accounts   ta on ta.user_id = u.id and ta.name = t.to_acc
left join categories c  on c.user_id = u.id and c.name  = t.cat;

commit;
