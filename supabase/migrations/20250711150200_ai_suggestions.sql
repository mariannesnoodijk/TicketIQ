-- TicketIQ: AI-generated help center article suggestions

create table public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  summary text,
  content text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'draft')),
  category_id uuid references public.categories (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ai_suggestions_user_id_idx on public.ai_suggestions (user_id);
create index ai_suggestions_user_status_idx on public.ai_suggestions (user_id, status);

create trigger ai_suggestions_updated_at
before update on public.ai_suggestions
for each row
execute function public.handle_updated_at();
