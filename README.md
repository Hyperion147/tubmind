# Tubmind monorepo

Tubmind uses pnpm workspaces and Turborepo to manage the web and native apps.

## Apps

- `@tubmind/web`: Next.js web application
- `@tubmind/native`: Expo React Native application

Web and native UI components live inside their respective apps because they use
different component systems and interaction patterns.

## Shared packages

- `@tubmind/contracts`: API validation schemas and request/response types
- `@tubmind/domain`: platform-independent business models and rules
- `@tubmind/api-client`: shared HTTP client utilities
- `@tubmind/database`: server-only Drizzle schema
- `@tubmind/typescript-config`: shared TypeScript configuration

The native app must not import `@tubmind/database`.

## Development

```sh
pnpm install
pnpm dev:web
pnpm dev:mobile
```

Run the complete web and package build with:

```sh
pnpm build
```
