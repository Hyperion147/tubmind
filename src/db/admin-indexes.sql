create index if not exists profiles_status_idx on public.profiles (status);
create index if not exists profiles_created_at_idx on public.profiles (created_at);

create index if not exists ideas_updated_at_idx on public.ideas (updated_at);
create index if not exists ideas_visibility_updated_at_idx on public.ideas (visibility, updated_at);
create index if not exists ideas_status_updated_at_idx on public.ideas (status, updated_at);

create index if not exists idea_comments_status_idx on public.idea_comments (status);
create index if not exists idea_comments_updated_at_idx on public.idea_comments (updated_at);
create index if not exists idea_comments_status_updated_at_idx
  on public.idea_comments (status, updated_at);

create index if not exists moderation_logs_target_idea_idx
  on public.moderation_logs (target_idea_id);
create index if not exists moderation_logs_target_comment_idx
  on public.moderation_logs (target_comment_id);
create index if not exists moderation_logs_target_user_idx
  on public.moderation_logs (target_user_id);
create index if not exists moderation_logs_created_at_idx
  on public.moderation_logs (created_at);
