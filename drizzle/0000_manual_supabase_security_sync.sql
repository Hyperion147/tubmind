-- Manual Drizzle-side migration for objects that are not represented by
-- src/db/schema.ts. This mirrors the Supabase SQL files that currently define
-- helper functions, RLS policies, and the time_logs trigger behavior.
--
-- Source files:
--   supabase/time_logs.sql
--   supabase/rls-beta.sql
--   supabase/rls-public-listings-hardening.sql

begin;

create or replace function public.set_time_logs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_time_logs_updated_at on public.time_logs;
create trigger set_time_logs_updated_at
before update on public.time_logs
for each row
execute function public.set_time_logs_updated_at();

alter table public.time_logs enable row level security;

drop policy if exists "time_logs_select_own" on public.time_logs;
create policy "time_logs_select_own"
on public.time_logs
for select
to authenticated
using (auth.uid() = owner_id);

drop policy if exists "time_logs_insert_own" on public.time_logs;
create policy "time_logs_insert_own"
on public.time_logs
for insert
to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "time_logs_update_own" on public.time_logs;
create policy "time_logs_update_own"
on public.time_logs
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "time_logs_delete_own" on public.time_logs;
create policy "time_logs_delete_own"
on public.time_logs
for delete
to authenticated
using (auth.uid() = owner_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.status in ('active', 'under_review')
  );
$$;

create or replace function public.can_write_beta()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.status in ('active', 'under_review')
  );
$$;

create or replace function public.can_view_idea_row(
  idea_owner_id uuid,
  idea_visibility public.idea_visibility,
  idea_status public.idea_status
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    (
      idea_visibility = 'public'
      and idea_status in ('published', 'submitted')
    )
    or auth.uid() = idea_owner_id
    or public.is_admin();
$$;

create or replace function public.can_edit_idea_row(idea_owner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.can_write_beta()
    and (
      auth.uid() = idea_owner_id
      or public.is_admin()
    );
$$;

create or replace function public.can_view_idea_by_id(target_idea_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ideas i
    where i.id = target_idea_id
      and public.can_view_idea_row(i.owner_id, i.visibility, i.status)
  );
$$;

create or replace function public.can_edit_idea_by_id(target_idea_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ideas i
    where i.id = target_idea_id
      and public.can_edit_idea_row(i.owner_id)
  );
$$;

create or replace function public.can_comment_on_idea(target_idea_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ideas i
    where i.id = target_idea_id
      and i.allow_comments = true
      and (
        i.visibility = 'public'
        or i.owner_id = auth.uid()
        or public.is_admin()
      )
  )
  and public.can_write_beta();
$$;

alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_details enable row level security;
alter table public.idea_features enable row level security;
alter table public.idea_tech_stacks enable row level security;
alter table public.idea_progress_entries enable row level security;
alter table public.idea_comments enable row level security;
alter table public.idea_reactions enable row level security;
alter table public.idea_views enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_logs enable row level security;

alter table public.profiles force row level security;
alter table public.ideas force row level security;
alter table public.idea_details force row level security;
alter table public.idea_features force row level security;
alter table public.idea_tech_stacks force row level security;
alter table public.idea_progress_entries force row level security;
alter table public.idea_comments force row level security;
alter table public.idea_reactions force row level security;
alter table public.idea_views force row level security;
alter table public.reports force row level security;
alter table public.moderation_logs force row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
using (
  auth.uid() = id
  or public.is_admin()
);

drop policy if exists "profiles_insert_self_or_admin" on public.profiles;
create policy "profiles_insert_self_or_admin"
on public.profiles
for insert
with check (
  auth.uid() = id
  or public.is_admin()
);

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles
for update
using (
  auth.uid() = id
  or public.is_admin()
)
with check (
  auth.uid() = id
  or public.is_admin()
);

drop policy if exists "profiles_delete_admin_only" on public.profiles;
create policy "profiles_delete_admin_only"
on public.profiles
for delete
using (public.is_admin());

drop policy if exists "ideas_select_public_owner_admin" on public.ideas;
create policy "ideas_select_public_owner_admin"
on public.ideas
for select
using (public.can_view_idea_row(owner_id, visibility, status));

drop policy if exists "ideas_insert_owner_or_admin" on public.ideas;
create policy "ideas_insert_owner_or_admin"
on public.ideas
for insert
with check (
  (
    owner_id = auth.uid()
    and public.can_write_beta()
  )
  or public.is_admin()
);

drop policy if exists "ideas_update_owner_or_admin" on public.ideas;
create policy "ideas_update_owner_or_admin"
on public.ideas
for update
using (public.can_edit_idea_row(owner_id))
with check (public.can_edit_idea_row(owner_id));

drop policy if exists "ideas_delete_owner_or_admin" on public.ideas;
create policy "ideas_delete_owner_or_admin"
on public.ideas
for delete
using (public.can_edit_idea_row(owner_id));

drop policy if exists "idea_details_select_via_parent_idea" on public.idea_details;
create policy "idea_details_select_via_parent_idea"
on public.idea_details
for select
using (public.can_view_idea_by_id(idea_id));

drop policy if exists "idea_details_insert_via_parent_idea" on public.idea_details;
create policy "idea_details_insert_via_parent_idea"
on public.idea_details
for insert
with check (public.can_edit_idea_by_id(idea_id));

drop policy if exists "idea_details_update_via_parent_idea" on public.idea_details;
create policy "idea_details_update_via_parent_idea"
on public.idea_details
for update
using (public.can_edit_idea_by_id(idea_id))
with check (public.can_edit_idea_by_id(idea_id));

drop policy if exists "idea_details_delete_via_parent_idea" on public.idea_details;
create policy "idea_details_delete_via_parent_idea"
on public.idea_details
for delete
using (public.can_edit_idea_by_id(idea_id));

drop policy if exists "idea_features_select_via_parent_idea" on public.idea_features;
create policy "idea_features_select_via_parent_idea"
on public.idea_features
for select
using (public.can_view_idea_by_id(idea_id));

drop policy if exists "idea_features_insert_via_parent_idea" on public.idea_features;
create policy "idea_features_insert_via_parent_idea"
on public.idea_features
for insert
with check (public.can_edit_idea_by_id(idea_id));

drop policy if exists "idea_features_update_via_parent_idea" on public.idea_features;
create policy "idea_features_update_via_parent_idea"
on public.idea_features
for update
using (public.can_edit_idea_by_id(idea_id))
with check (public.can_edit_idea_by_id(idea_id));

drop policy if exists "idea_features_delete_via_parent_idea" on public.idea_features;
create policy "idea_features_delete_via_parent_idea"
on public.idea_features
for delete
using (public.can_edit_idea_by_id(idea_id));

drop policy if exists "idea_tech_stacks_select_via_parent_idea" on public.idea_tech_stacks;
create policy "idea_tech_stacks_select_via_parent_idea"
on public.idea_tech_stacks
for select
using (public.can_view_idea_by_id(idea_id));

drop policy if exists "idea_tech_stacks_insert_via_parent_idea" on public.idea_tech_stacks;
create policy "idea_tech_stacks_insert_via_parent_idea"
on public.idea_tech_stacks
for insert
with check (public.can_edit_idea_by_id(idea_id));

drop policy if exists "idea_tech_stacks_update_via_parent_idea" on public.idea_tech_stacks;
create policy "idea_tech_stacks_update_via_parent_idea"
on public.idea_tech_stacks
for update
using (public.can_edit_idea_by_id(idea_id))
with check (public.can_edit_idea_by_id(idea_id));

drop policy if exists "idea_tech_stacks_delete_via_parent_idea" on public.idea_tech_stacks;
create policy "idea_tech_stacks_delete_via_parent_idea"
on public.idea_tech_stacks
for delete
using (public.can_edit_idea_by_id(idea_id));

drop policy if exists "idea_comments_select_public_or_admin_or_owner" on public.idea_comments;
create policy "idea_comments_select_public_or_admin_or_owner"
on public.idea_comments
for select
using (
  (
    status = 'visible'
    and public.can_view_idea_by_id(idea_id)
  )
  or public.is_admin()
);

drop policy if exists "idea_comments_insert_self_when_allowed" on public.idea_comments;
create policy "idea_comments_insert_self_when_allowed"
on public.idea_comments
for insert
with check (
  author_id = auth.uid()
  and public.can_comment_on_idea(idea_id)
);

drop policy if exists "idea_comments_update_admin_only" on public.idea_comments;
create policy "idea_comments_update_admin_only"
on public.idea_comments
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "idea_comments_delete_admin_only" on public.idea_comments;
drop policy if exists "idea_comments_delete_author_owner_admin" on public.idea_comments;
create policy "idea_comments_delete_author_owner_admin"
on public.idea_comments
for delete
to authenticated
using (
  public.is_admin()
  or author_id = auth.uid()
  or exists (
    select 1
    from public.ideas i
    where i.id = idea_comments.idea_id
      and i.owner_id = auth.uid()
  )
);

drop policy if exists "moderation_logs_admin_all" on public.moderation_logs;
create policy "moderation_logs_admin_all"
on public.moderation_logs
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "idea_progress_entries_admin_all" on public.idea_progress_entries;
create policy "idea_progress_entries_admin_all"
on public.idea_progress_entries
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "idea_reactions_admin_all" on public.idea_reactions;
drop policy if exists "idea_reactions_select_visible_ideas" on public.idea_reactions;
drop policy if exists "idea_reactions_insert_own_on_visible_ideas" on public.idea_reactions;
drop policy if exists "idea_reactions_delete_own_on_visible_ideas" on public.idea_reactions;

create policy "idea_reactions_select_visible_ideas"
on public.idea_reactions
for select
using (public.can_view_idea_by_id(idea_id));

create policy "idea_reactions_insert_own_on_visible_ideas"
on public.idea_reactions
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.can_write_beta()
  and public.can_view_idea_by_id(idea_id)
);

create policy "idea_reactions_delete_own_on_visible_ideas"
on public.idea_reactions
for delete
to authenticated
using (
  user_id = auth.uid()
  and public.can_write_beta()
  and public.can_view_idea_by_id(idea_id)
);

drop policy if exists "idea_views_admin_all" on public.idea_views;
create policy "idea_views_admin_all"
on public.idea_views
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "reports_admin_all" on public.reports;
create policy "reports_admin_all"
on public.reports
for all
using (public.is_admin())
with check (public.is_admin());

commit;
