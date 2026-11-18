# AGENTS.md — StaseraVolley

## Project context

StaseraVolley is the existing volleyball matchmaking and booking prototype within the broader StaseraSiGioca project.

The goal is to evolve the prototype into a secure, mobile-first MVP for an initial pilot of approximately 30–40 users.

Reference documentation:
- `PROTOTYPE_SUMMARY.md`
- `TECHNICAL_BRIEF.md`

Read these documents when available. Do not assume that planned MVP features are already implemented.

## Repository and collaboration

Official repository: https://github.com/fabiodimicco/StaseraVolley

Multiple developers and Codex agents may work on this repository.

Before making changes:

1. Inspect the current working directory and Git status.
2. Check the configured remote and current branch.
3. Fetch remote updates when network access and permissions allow.
4. Inspect relevant commits, branches and existing changes.
5. Preserve all uncommitted and committed work by other contributors.
6. Never use destructive Git commands without explicit authorization.
7. Never force-push or overwrite shared branches.

Prefer feature branches and pull requests. Keep `main` stable.

If synchronization is unavailable, explain the limitation instead of assuming the repository is up to date.

## Scope and architecture

Preserve the existing HTML/CSS/JavaScript prototype unless a migration is explicitly approved.

The proposed MVP stack is:
- Next.js, React and TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, RLS and Storage
- Leaflet and OpenStreetMap
- Vitest and Playwright

These technologies are architectural proposals, not proof of current implementation.

Do not initiate a framework migration or introduce paid services without approval.

## Implementation rules

Before coding:
- Inspect the relevant files.
- Understand existing behavior.
- Identify the smallest safe change.
- Consider mobile, tablet and desktop behavior.
- Check whether related functionality already exists.
- Flag product decisions that remain unresolved.

During implementation:
- Keep changes focused and maintainable.
- Avoid duplicate logic and unnecessary dependencies.
- Preserve existing user-facing functionality unless instructed otherwise.
- Do not commit secrets or credentials.
- Use clear naming and appropriate comments.

## Testing and quality

After changes:
1. Run available automated tests.
2. Run lint and type-check when configured.
3. Test affected user journeys.
4. Check for regressions.
5. Verify responsive behavior when relevant.
6. Report test results and remaining limitations.

Do not claim that tests passed unless they were executed.

Do not deploy changes with known critical failures without explicit approval.

## Booking and security

For production-oriented MVP features:
- Enforce permissions server-side.
- Apply appropriate database RLS policies.
- Prevent overbooking through atomic operations.
- Validate user inputs.
- Protect personal information.
- Never expose privileged Supabase keys.
- Do not treat browser localStorage as a secure production database.

The initial MVP does not include real in-app payments.

## Documentation

When changes materially affect functionality, architecture, setup or deployment, update the relevant documentation.

Distinguish:
- Existing prototype behavior
- Implemented MVP behavior
- Planned functionality
- Open decisions

Never describe unfinished functionality as complete.

## Deployment

Before deployment:
- Verify the intended target and environment.
- Confirm relevant tests passed.
- Check that the deployed version corresponds to the intended Git revision.
- Preserve the existing public prototype unless a replacement is approved.

Never deploy automatically merely because code changes have been made.

If GitHub and the public site must both be updated, verify each operation independently and report their actual status.

## Communication

At the end of each development task, provide:
- Summary of changes
- Files changed
- Tests executed and results
- Git branch and commit status
- Deployment status, if applicable
- Risks, blockers and next steps

Never report a commit, push, test or deployment as completed unless it actually occurred.
