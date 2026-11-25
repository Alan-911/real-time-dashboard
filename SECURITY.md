# Security Policy

## Scope

This repository is a realtime operations prototype using a Supabase backend. This policy does not imply a production security certification.

## Reporting a vulnerability

Please report security problems **privately** to the maintainer using the contact listed on the author's GitHub profile or GitHub private vulnerability reporting if it is enabled for this repository. **Do not put secrets, private data, attack details, or exploit samples in public issues.**

Include the affected component, version or commit, a concise impact statement, and a minimal safe reproduction. No remediation response time is guaranteed by this document.

## Responsible practices

- Never commit API keys, customer credentials, live patient data, private client documents or cloud access tokens.
- Keep dependencies updated and review automated security reports.
- Follow least-privilege permissions and use dummy data in public demonstrations.
- Verify deployment-specific access controls before processing sensitive information.
- Treat passing scans as limited evidence, not a guarantee of security.

### Supabase-specific requirements

Configure and test Row Level Security on every exposed table. Public client keys are **not authorization**. Do not expose the Supabase service-role key to the browser. Separate demo data from production records.

