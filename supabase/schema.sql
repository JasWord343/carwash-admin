create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'staff',
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  vehicle_brand text,
  vehicle_model text,
  vehicle_year text,
  vehicle_color text,
  vehicle_plates text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  duration_minutes integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  service_ids uuid[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  client_name text,
  service_type text not null default 'service',
  service_id uuid,
  service_name text,
  amount numeric(10,2) not null default 0,
  date date not null,
  time text,
  notes text,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  client_name text,
  amount numeric(10,2) not null default 0,
  method text not null default 'cash',
  concept text,
  notes text,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  concept text not null,
  amount numeric(10,2) not null default 0,
  category text not null default 'other',
  notes text,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_services (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  client_id uuid references public.clients(id) on delete set null,
  client_name text,
  service_id uuid,
  service_name text not null,
  price numeric(10,2) not null default 0,
  payment_method text not null default 'cash',
  status text not null default 'pending',
  vehicle_info text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  client_name text,
  items jsonb not null default '[]'::jsonb,
  total numeric(10,2) not null default 0,
  valid_until date,
  notes text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.services enable row level security;
alter table public.packages enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.daily_services enable row level security;
alter table public.budgets enable row level security;

drop policy if exists "authenticated users can read own profile" on public.profiles;
create policy "authenticated users can read own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "authenticated users can insert own profile" on public.profiles;
create policy "authenticated users can insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "authenticated users can update own profile" on public.profiles;
create policy "authenticated users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "authenticated users can manage clients" on public.clients;
create policy "authenticated users can manage clients"
on public.clients for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated users can manage services" on public.services;
create policy "authenticated users can manage services"
on public.services for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated users can manage packages" on public.packages;
create policy "authenticated users can manage packages"
on public.packages for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated users can manage appointments" on public.appointments;
create policy "authenticated users can manage appointments"
on public.appointments for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated users can manage payments" on public.payments;
create policy "authenticated users can manage payments"
on public.payments for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated users can manage expenses" on public.expenses;
create policy "authenticated users can manage expenses"
on public.expenses for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated users can manage daily services" on public.daily_services;
create policy "authenticated users can manage daily services"
on public.daily_services for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated users can manage budgets" on public.budgets;
create policy "authenticated users can manage budgets"
on public.budgets for all
to authenticated
using (true)
with check (true);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.handle_updated_at();

drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at
before update on public.services
for each row execute function public.handle_updated_at();

drop trigger if exists set_packages_updated_at on public.packages;
create trigger set_packages_updated_at
before update on public.packages
for each row execute function public.handle_updated_at();

drop trigger if exists set_appointments_updated_at on public.appointments;
create trigger set_appointments_updated_at
before update on public.appointments
for each row execute function public.handle_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.handle_updated_at();

drop trigger if exists set_expenses_updated_at on public.expenses;
create trigger set_expenses_updated_at
before update on public.expenses
for each row execute function public.handle_updated_at();

drop trigger if exists set_daily_services_updated_at on public.daily_services;
create trigger set_daily_services_updated_at
before update on public.daily_services
for each row execute function public.handle_updated_at();

drop trigger if exists set_budgets_updated_at on public.budgets;
create trigger set_budgets_updated_at
before update on public.budgets
for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    'staff'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
