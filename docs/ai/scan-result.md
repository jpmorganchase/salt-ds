# Salt scan result contract

`salt-ds scan` is a deterministic, offline, read-only source compatibility and
deprecation scanner. It is not a general UI-quality score, browser audit, WCAG
certification, or cross-file semantic analyzer.

## Discovery

The default root is cwd or one explicitly resolved root. Discovery stays inside
that root, respects VCS ignores and `salt.config.json`, and default-excludes
dependency/package caches, generated output, builds, coverage, Storybook output,
and `.git`. It supports JS, JSX, TS, TSX, and CSS and never executes project code,
configuration JavaScript, package-manager commands, or downloaded content.

Paths are portable, normalized, sorted, and relative. Every file belongs to one
workspace unit with its own exact Salt vector and evidence. Overlap or lost
containment is failed coverage. Hoisted evidence is resolved for the owning unit
and never borrowed from a sibling.

All defaults, absolute ceilings, outcome classifications, and stable codes are
frozen in [ADR 0001](../decisions/0001-salt-ai-knowledge-platform.md). Limits
apply while enumerating/allocating, not after materializing an unbounded input.
Environment variables cannot raise them.

## Canonical result

`salt-scan-result/1` contains:

- tool, ruleset, knowledge, bundle, and semantic identities;
- normalized root discovery facts and ordered workspace units;
- exact package vector/evidence and compatibility per unit;
- findings with rule, severity, confidence, applicability, relative location,
  evidence, remediation, acceptance criterion, and workspace unit;
- evaluated, skipped, and unsupported coverage with `complete`, `partial`, or
  `failed` status and stable reasons; and
- disclosed limitations.

Finding order is workspace unit, path, start, severity, then rule ID. Ordinary
JSON has no timestamp, duration, source text, or absolute path. Pretty and
prompt end actionable findings with an exact local rescan command. Prompt text
quotes repository-derived values as untrusted evidence. SARIF converts UTF-8
byte coordinates to SARIF character coordinates.

## Exit behavior

| Exit | Meaning                                                                                                |
| ---: | ------------------------------------------------------------------------------------------------------ |
|    0 | complete (or explicitly allowed partial) and no finding meets threshold                                |
|    1 | one or more findings meet threshold                                                                    |
|    2 | usage or configuration error                                                                           |
|    3 | unallowed partial, any failed coverage, incompatibility, integrity, parser/system, or internal failure |

`--allow-incomplete` affects disclosed partial coverage only. It cannot override
failed coverage. `--fail-on never` cannot hide exit 3. Machine formats remain
stdout-clean; operational errors use stderr.
