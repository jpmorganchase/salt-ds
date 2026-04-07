# debug workflow

## Contents

- [1. classify the task](#1-classify-the-task)
- [2. isolate the broken region](#2-isolate-the-broken-region)
- [3. resolve the canonical Salt target first](#3-resolve-the-canonical-salt-target-first)
- [4. inspect the local implementation](#4-inspect-the-local-implementation)
- [5. validate the source before runtime](#5-validate-the-source-before-runtime)
- [6. use runtime evidence only if needed](#6-use-runtime-evidence-only-if-needed)
- [7. return the fix result](#7-return-the-fix-result)

Use this when the task is a narrow Salt UI bug-fix or root-cause request rather than a broad audit.

## 1. classify the task

- Treat the task as debug/fix mode when the user is asking why one layout, navigation, spacing, centering, or interaction detail is broken.
- Keep the scope narrow. Do not turn a single bug into a full review unless the root cause clearly spans the whole screen.

## 2. isolate the broken region

- Name the smallest broken region first: navigation shell, toolbar cluster, metric card row, dialog footer, or form action area.
- Separate the visible symptom from the likely owning structure.
- For alignment issues, identify the leaf element that looks wrong, the parent layout owner, and any wrapper or shell that may actually control positioning.

## 3. resolve the canonical Salt target first

- Before suggesting CSS or wrapper changes, confirm the intended Salt primitive or pattern.
- Prefer `create_salt_ui` and read the returned canonical guidance, sources, and starter path before suggesting CSS or wrapper changes.
- If MCP is unavailable, keep the same debug workflow and let the environment use the Salt CLI fallback underneath.

Many apparent layout bugs are really primitive-choice, shell-choice, or wrapper-conflict problems.

## 4. inspect the local implementation

- Look for wrappers changing alignment or sizing, flex/grid ownership confusion, hard-coded spacing or width rules, custom CSS fighting Salt structure, and generic div-based dashboard rows where Salt layout or data surfaces would be clearer.

## 5. validate the source before runtime

- Use `review_salt_ui` or `salt-ds review <file-or-dir>`.
- Treat that as the main validation step before runtime evidence.

## 6. use runtime evidence only if needed

- If source-level reasoning still does not explain the bug, use cheap URL fetch or fetched HTML when title, status, coarse structure, or obvious landmarks are enough.
- Use `salt-ds doctor` if runtime target confidence is low, then use `salt-ds review <file-or-dir> --url <url>`.
- Prefer browser-session evidence.
- Use fetched-html fallback only for narrower structure claims.
- Treat layout-debug details as advanced evidence only.

## 7. return the fix result

For debug/fix mode, return the broken region, suspected root cause, smallest credible fix, validation surface used, and whether verification is complete or still needed.
