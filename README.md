# Tubmind

Tubmind is a Next.js 16 app for privately capturing ideas, organizing them inside an idea tub workspace, refining them into structured records, publishing selected ideas to a public listings surface, and moderating users, ideas, and comments through an admin workspace.

## Beta Scope

The current beta includes:

- Google sign-in with Supabase Auth
- Automatic profile creation and sync on first login
- Private idea creation and editing
- Private idea tub planning with task and calendar flows
- Public listings and public idea pages
- Logged-in commenting
- Admin moderation for ideas, users, and comments

The schema also contains future-facing tables such as reports, reactions, views, and progress entries, but those are not fully productized yet.

## Stack

- Next.js 16 App Router
- React 19
- Supabase Auth
- Postgres
- Drizzle ORM and Drizzle Kit
- Tailwind CSS 4

## Requirements

- Node.js 20+
- pnpm 9+
- A Supabase project
- A Postgres connection string for that Supabase database
- A Google OAuth app configured inside Supabase Auth

## Environment Variables

Create a local `.env` file from `.env.example` and set:

- `DATABASE_URL`: Postgres connection string used by Drizzle and server-side queries
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase anon or publishable key used by browser and SSR auth clients
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key used for privileged server operations

Notes:

- `DATABASE_URL` must point at the same database backing your Supabase project.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it in the browser.

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create `.env` from the example file and fill in the four required values.

3. Configure Supabase Auth.

- In Supabase, enable the `Google` provider under Authentication.
- Set the site URL for local development to `http://localhost:3000`.
- Add this redirect URL:

```text
http://localhost:3000/auth/callback
```

4. Push the schema to the database:

```bash
pnpm db:push
```

5. Start the app:

```bash
pnpm dev
```

6. Open:

```text
http://localhost:3000
```

## How Auth Works

- The login button starts Supabase Google OAuth.
- Supabase redirects back to `/auth/callback`.
- The callback exchanges the auth code for a session and syncs the user into the local `profiles` table.
- The app expects `auth.users` to exist, so this project should run against a Supabase-managed Postgres database, not a generic standalone Postgres instance without Supabase Auth tables.

## Database Workflow

Schema source:

- `src/db/schema.ts`

Useful commands:

```bash
pnpm db:generate
pnpm db:push
pnpm db:studio
```

Recommended beta workflow:

- Use `pnpm db:push` while the schema is still changing quickly.
- Review schema updates carefully before pushing to shared environments.
- Use `pnpm db:studio` when you need to inspect or manually verify records.

## Bootstrapping The First Admin

There is no seed script for admins yet. The normal flow is:

1. Start the app.
2. Sign in once with the Google account that should become admin.
3. Confirm a row was created in `profiles`.
4. Promote that user manually in the database.

Example SQL:

```sql
update profiles
set role = 'admin'
where email = 'you@example.com';
```

You can run that in:

- Supabase SQL Editor
- Drizzle Studio
- Any SQL client connected to the same database

After promotion, sign out and sign back in if the current session does not immediately reflect the new role.

## Admin Runbook

Admin pages live at:

- `/admin`
- `/admin/ideas`
- `/admin/users`
- `/admin/comments`

Current admin capabilities:

- Make ideas public or private
- Request revision on ideas
- Archive or delete ideas
- Mark users active, under review, blocked, or unblocked
- Promote or demote admins
- Hide, restore, or delete comments

Important operational notes:

- Blocking a user currently protects page access, but API hardening should still be reviewed before public launch.
- Public visibility is the current gate for listings and public idea pages.
- Moderation actions create entries in `moderation_logs`.

## Deployment Runbook

Tubmind can be deployed anywhere that supports Next.js 16 and Node.js. Vercel is the easiest path, but not required.

### Production Prerequisites

- A production Supabase project
- Production values for all four environment variables
- Google auth enabled in the production Supabase project
- Production redirect URL added in Supabase:

```text
https://your-domain.com/auth/callback
```

- Production site URL set correctly in Supabase Auth

### Deploy Steps

1. Provision the target environment.
2. Add the required environment variables.
3. Push the schema to the production database:

```bash
pnpm db:push
```

4. Build the app:

```bash
pnpm build
```

5. Start the app:

```bash
pnpm start
```

### Beta Launch Checklist

- `pnpm lint` passes
- `pnpm build` passes in a clean environment
- Supabase Google auth works locally and in production
- `/auth/callback` is registered in Supabase for every environment
- First admin account is promoted in `profiles`
- Admin can access `/admin`
- A signed-in user can create an idea
- A signed-in user can open `/dashboard/projects/[id]` and manage tasks
- A private idea can be edited from `/dashboard`
- A public idea appears in `/listings`
- A public idea page opens at `/ideas/[slug]`
- Comment creation works for logged-in users
- Environment secrets are set only on the server where appropriate

## Common Issues

### Login succeeds but the user cannot access admin

Check the `profiles.role` value for that user. The app only grants admin access when the role is exactly `admin`.

### Login redirects incorrectly

Check:

- Supabase site URL
- Supabase redirect URLs
- The `next` query string passed into `/auth/callback`

### Database errors on first run

Check:

- `DATABASE_URL` points to the correct database
- The schema has been pushed with `pnpm db:push`
- You are using a Supabase database with the `auth.users` schema available

### Build fails because files in `.next` are locked

Stop any running dev server or other process using the app directory, then retry the build in a clean terminal session.

## Project Paths

- App routes: `src/app`
- Database schema: `src/db/schema.ts`
- Database client: `src/db/index.ts`
- Auth helpers: `src/lib/auth.ts`
- Supabase helpers: `src/lib/server.ts`, `src/lib/client.ts`, `src/lib/middleware.ts`
- Admin UI: `src/features/admin`
- Idea UI: `src/features/ideas`
- Idea tub UI: `src/features/tub`
