-- TicketIQ: labels and ticket_labels (M:N)

create table public.labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint labels_user_name_unique unique (user_id, name)
);

create index labels_user_id_idx on public.labels (user_id);

create table public.ticket_labels (
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  label_id uuid not null references public.labels (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (ticket_id, label_id)
);

create index ticket_labels_label_id_idx on public.ticket_labels (label_id);
