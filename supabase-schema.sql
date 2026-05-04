create table if not exists public.student_profiles (
  id text primary key,
  name text not null,
  grade text not null,
  profile_data jsonb not null,
  last_active_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.student_profiles enable row level security;

drop policy if exists "math placement profile read" on public.student_profiles;
drop policy if exists "math placement profile insert" on public.student_profiles;
drop policy if exists "math placement profile update" on public.student_profiles;

create policy "math placement profile read"
on public.student_profiles
for select
to anon
using (true);

create policy "math placement profile insert"
on public.student_profiles
for insert
to anon
with check (true);

create policy "math placement profile update"
on public.student_profiles
for update
to anon
using (true)
with check (true);
