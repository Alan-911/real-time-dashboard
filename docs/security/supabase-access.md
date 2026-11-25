# Supabase access-control checklist

## Current status

The dashboard connects directly from the browser to Supabase using a public anon key and listens to changes from the `todos` table. A public anon key **does not authenticate or authorize a user**. This repository does not provide complete application authentication or verified production Row Level Security (RLS) migrations.

Do not use the project for live staff, beneficiary, customer, or operational records until access policies have been designed and tested in the target Supabase project.

## Required before production use

1. **Turn on RLS** for the `todos` table and every other public/exposed table.
2. Define authenticated user roles and ownership/organization membership; ensure only permitted users can read, create, update or delete their own organization's records.
3. Verify the anonymous user has **no inappropriate read/write access**.
4. Ensure Supabase Realtime publications/authorization align with the same policies.
5. Never expose `service_role` or database passwords in `NEXT_PUBLIC_*` variables or client JavaScript.
6. Make demo-data seeding opt-in and separate from real organizational tables.
7. Test negative authorization cases, including reading/updating another user's task, unauthorized inserts, deleted tasks and reconnects.

## Evidence required to close this checklist

- A reviewable SQL migration configuring the schema and RLS policies.
- Automated tests showing allowed and denied actions under the correct user roles.
- A documented authentication model and a demonstrated least-privilege configuration.
- Separate demo and production environments with appropriate secrets.

**This document is a security requirement, not proof that the controls are already active.**
