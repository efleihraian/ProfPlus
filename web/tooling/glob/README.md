# Tooling glob adapter (P-084)

This private package replaces fast-glob for the pinned Next ESLint plugin and
Vinext's vite-plugin-dynamic-import. It uses tinyglobby 0.2.17 (already used by
Vite) and contains no fast-glob, micromatch or braces implementation.

The published braces advisory GHSA-vfj7-8cjw-p6xm has no patched release as of
2026-10-15. Replacing the dependency removes the affected code; the npm audit
command and its high threshold remain unchanged. This is not an advisory ignore,
a renamed copy of braces, or an assertion that an upstream braces release is fixed.

Supported consumers and APIs:

- @next/eslint-plugin-next 16.3.8: globSync(rootDir, {onlyDirectories: true}).
- vite-plugin-dynamic-import 1.6.0: default.sync(patterns, {cwd}).
- Callable/default async glob, sync, glob and globSync aliases share the adapter.

The adapter disables directory expansion, preserves absolute-root results and
removes directory markers to match these consumers' fast-glob behavior. Options
outside cwd/onlyDirectories fail explicitly. Patterns are bounded to 1,024 items,
32,768 characters each, and 64 brace/parenthesis levels before invoking tinyglobby.
It does not implement fast-glob's full API. Recheck call sites and run
`node tests/toolchain-glob.mjs`, a clean install, lint-tool loading and a full build
when upgrading either consumer. The regression is also in security.yml.

Sources:

- https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
- https://superchupu.dev/tinyglobby/migration

No new hosted service, telemetry, application data, secret or runtime provider.
