-- TicketIQ: Row Level Security policies

alter table public.categories enable row level security;
alter table public.tickets enable row level security;
alter table public.labels enable row level security;
alter table public.ticket_labels enable row level security;
alter table public.ai_suggestions enable row level security;

-- categories
create policy "categories_select_own"
on public.categories for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "categories_insert_own"
on public.categories for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "categories_update_own"
on public.categories for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "categories_delete_own"
on public.categories for delete
to authenticated
using ((select auth.uid()) = user_id);

-- tickets
create policy "tickets_select_own"
on public.tickets for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "tickets_insert_own"
on public.tickets for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "tickets_update_own"
on public.tickets for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "tickets_delete_own"
on public.tickets for delete
to authenticated
using ((select auth.uid()) = user_id);

-- labels
create policy "labels_select_own"
on public.labels for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "labels_insert_own"
on public.labels for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "labels_update_own"
on public.labels for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "labels_delete_own"
on public.labels for delete
to authenticated
using ((select auth.uid()) = user_id);

-- ticket_labels (ownership via tickets + labels)
create policy "ticket_labels_select_own"
on public.ticket_labels for select
to authenticated
using (
  exists (
    select 1
    from public.tickets
    where tickets.id = ticket_labels.ticket_id
      and tickets.user_id = (select auth.uid())
  )
);

create policy "ticket_labels_insert_own"
on public.ticket_labels for insert
to authenticated
with check (
  exists (
    select 1
    from public.tickets
    where tickets.id = ticket_labels.ticket_id
      and tickets.user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.labels
    where labels.id = ticket_labels.label_id
      and labels.user_id = (select auth.uid())
  )
);

create policy "ticket_labels_delete_own"
on public.ticket_labels for delete
to authenticated
using (
  exists (
    select 1
    from public.tickets
    where tickets.id = ticket_labels.ticket_id
      and tickets.user_id = (select auth.uid())
  )
);

-- ai_suggestions
create policy "ai_suggestions_select_own"
on public.ai_suggestions for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "ai_suggestions_insert_own"
on public.ai_suggestions for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "ai_suggestions_update_own"
on public.ai_suggestions for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "ai_suggestions_delete_own"
on public.ai_suggestions for delete
to authenticated
using ((select auth.uid()) = user_id);
