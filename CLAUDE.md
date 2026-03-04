# Loaves of Love — Claude Instructions

## Project Overview

Coordination platform for the Loaves of Love Ministry at St. Anne's Episcopal Church, Tifton, Georgia. Built with Next.js, Supabase, Resend, deployed on Vercel.

## Pull Requests

Always create PRs using `gh pr create`. Never substitute a compare link.

```
gh pr create \
  --repo jonathanpopham/Loaves-of-Love \
  --title "..." \
  --body "..." \
  --base main \
  --head <branch>
```

The PR `--body` must include `Closes #<issue-number>` so GitHub auto-closes the originating issue on merge.

After creating a PR, apply the `claude-task` label:

```
gh issue edit <PR-number> --repo jonathanpopham/Loaves-of-Love --add-label claude-task
```

## Issues

When creating a GitHub issue, always include `@claude` at the end of the body so the workflow auto-triggers.

## Branch Naming

`claude/issue-{number}-{YYYYMMDD}-{HHMM}`

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature (bumps MINOR)
- `fix:` — bug fix (bumps PATCH)
- `feat!:` or `BREAKING CHANGE` — breaking change (bumps MAJOR)
- `chore:`, `docs:`, `test:`, `refactor:` — no version bump

## PR Branch Checkout

When triggered by a comment or review on a **pull request**, `actions/checkout` resolves `github.sha` to `main` — not the PR head branch. Before making any file changes on a PR:

```bash
PR_BRANCH=$(gh pr view <PR-number> --json headRefName -q .headRefName)
git fetch origin "$PR_BRANCH"
git checkout "$PR_BRANCH"
```

## Development

- **Framework**: Next.js 14+ with App Router, TypeScript
- **Database & Auth**: Supabase (Postgres, magic link auth, RLS)
- **Email**: Resend
- **Hosting**: Vercel
- **IaC**: Terraform

### Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Lint
npm test             # Run unit tests
npx playwright test  # Run integration tests
```

## Testing Requirements

Every PR must include:
- **Unit tests** (Jest or Vitest) for business logic, API routes, and utilities
- **Integration tests** (Playwright) for user-facing flows
- All tests must pass before the PR is submitted

## Architecture

```
src/
  app/              # Next.js App Router pages and layouts
    api/            # API routes
  components/       # Reusable React components
  lib/
    supabase/       # Supabase client helpers (client.ts, server.ts, admin.ts)
    resend/         # Email utilities
  types/            # TypeScript type definitions
supabase/
  migrations/       # SQL migration files
terraform/          # Infrastructure as Code
tests/
  unit/             # Unit tests
  e2e/              # Playwright integration tests
```

## User Roles

- **Admin**: Kim Moore, Jonathan Popham, Art Lawton
- **Baker**: All other authenticated users

## Key Business Rules

- Inventory thresholds for loaves: 30+ (green), 24 (yellow/notify), 8 (red/Brother Charlie's reserve)
- Threshold crossings trigger email alerts via Resend
- Emergency bags have variable thresholds
- Delivery destinations: Ruth's Cottage, Brother Charlie's Rescue Mission, bake sales, individuals
