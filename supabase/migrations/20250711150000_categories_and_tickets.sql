-- TicketIQ: categories and tickets

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_user_name_unique unique (user_id, name)
);

create index categories_user_id_idx on public.categories (user_id);

create trigger categories_updated_at
before update on public.categories
for each row
execute function public.handle_updated_at();

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  external_id text not null,
  subject text not null,
  body text,
  channel text,
  status text not null default 'open'
    check (status in ('open', 'closed', 'pending')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),
  category_id uuid references public.categories (id) on delete set null,
  ticket_created_at timestamptz,
  imported_at timestamptz not null default now(),
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickets_user_external_id_unique unique (user_id, external_id)
);

create index tickets_user_id_idx on public.tickets (user_id);
create index tickets_category_id_idx on public.tickets (category_id);
create index tickets_user_status_idx on public.tickets (user_id, status);

create trigger tickets_updated_at
before update on public.tickets
for each row
execute function public.handle_updated_at();
