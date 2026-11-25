# Dependency audit — 2026-11-24

GitHub Actions [CI run 45514087534](https://github.com/Alan-911/real-time-dashboard/actions/runs/45514087534) installed dependencies from the committed lockfile using `npm ci`. npm reported:

| Severity | Reported advisories |
| --- | ---: |
| Critical | 1 |
| High | 9 |
| Moderate | 11 |
| Low | 1 |
| **Total** | **22** |

These are npm's advisory counts for the full dependency tree on that run, **not a verified count of exploitable vulnerabilities in the deployed application**. The exact affected packages and production/dev exposure must be reviewed using `npm audit --json` against the same lockfile.

## Remediation protocol

1. Review each high/critical advisory for affected package, dependency path, exploit conditions, available fixed version and production/dev scope.
2. Apply nonbreaking updates first, regenerate `package-lock.json` using the package manager and run `npm ci`.
3. Run lint, TypeScript checks, Next.js build and application security tests.
4. Consider major upgrades separately, with regression and deployment verification. Avoid blind `npm audit fix --force` on a live app.
5. Resolve or document any remaining unavoidable alerts with technical justification and a review date.
6. Re-run the CI and security workflow after the final lockfile is committed.

Until this is reviewed and the project passes the dependency gate, do **not** call it vulnerability-free or production-hardened.
