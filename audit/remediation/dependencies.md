# Dependency audit

## Current results

| Command | Current result |
|---|---|
| `npm audit` | 7 vulnerable package entries: 5 high, 2 moderate, 0 low, 0 critical. All are in the development/build dependency graph. |
| `npm audit --omit=dev` | 0 findings. This does not establish that the project is secure overall. |

The earlier captured full audit was 15 entries (11 high, 3 moderate, 1 low). A non-forced `npm audit fix` updated compatible dependencies; the lockfile was updated and the production build and focused tests passed afterward. No `--force` was used.

## Remaining advisories and paths

The current audit identifies:

- **High — Tailwind CSS 3.4.19** (direct dev dependency, allowed by the existing `^3.4.1` manifest range). npm reports the affected range through 3.4.19. The available audit fix is Tailwind CSS 4.3.3, a semver-major update.
- **High — `braces`** (transitive), affected by GHSA-vfj7-8cjw-p6xm; reached through `chokidar` and `micromatch`.
- **High — `chokidar`**, `fast-glob`, and `micromatch` (transitive Tailwind build/watch dependency paths).
- **Moderate — `postcss-selector-parser`**, affected by GHSA-rj75-hqrm-r3gf; `postcss-nested` is also reported through this dependency path.

The seven package entries include the direct Tailwind dependency and transitive affected packages; the report includes two explicit underlying advisory IDs. npm lists no patch/minor resolution within the current Tailwind major.

## Risk and next action

These packages are used for development/build tooling and are omitted from the production dependency audit. They remain relevant to developer machines and CI/build environments. No evidence was established that the reported issues are exploitable in the deployed production runtime. Do not infer that from the zero production-only audit.

Keep Tailwind v3 in this remediation. Schedule a separate Tailwind v4 migration with visual regression coverage, build/test verification, and compatibility review. Preserve the lockfile and re-run both audit commands after that planned work. No forced major upgrade was performed.
