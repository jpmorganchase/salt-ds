# debug workflow

Use this when the task is a narrow Salt UI bug-fix or root-cause request rather than a broad audit.

## 1. classify the task

- Treat the task as debug/fix mode when the user is asking:
  - why is this centered wrong
  - why is this layout broken
  - why is this navigation off
  - fix this one behavior
- Keep the scope narrow. Do not turn a single bug into a full review unless the root cause clearly spans the whole screen.

## 2. isolate the broken region

- Name the smallest broken region first:
  - navigation shell
  - toolbar cluster
  - metric card row
  - dialog footer
  - form action area
- Separate the visible symptom from the likely owning structure.
- For alignment issues, identify:
  - the leaf element that looks wrong
  - the parent layout owner
  - any wrapper or shell that may actually control positioning

## 3. resolve the canonical Salt target first

- Before suggesting CSS or wrapper changes, confirm the intended Salt primitive or pattern.
- Prefer:
  - `choose_salt_solution`
  - `get_salt_entity`
  - `get_salt_examples`
- If MCP is unavailable, keep the same debug workflow and let the environment use the Salt CLI fallback underneath.

This matters because many “layout bugs” are really:

- wrong primitive choice
- wrong shell/pattern choice
- wrapper conflict hiding a standard Salt structure

## 4. inspect the local implementation

- Look for:
  - wrappers changing alignment or sizing
  - flex/grid ownership confusion
  - hard-coded spacing, width, or centering rules
  - custom CSS fighting Salt structure
  - dashboard/metric rows built from generic divs where Salt layout or data surfaces would be clearer

## 5. validate the source before runtime

- Use:
  - `analyze_salt_code`
  - or `salt-ds review <file-or-dir>`
- Treat that as the main validation step before runtime evidence.

## 6. use runtime evidence only if needed

- If source-level reasoning still does not explain the bug:
  - use cheap URL fetch or fetched HTML when title, status, coarse structure, or obvious landmarks are enough
  - use `salt-ds doctor` if runtime target confidence is low
  - then use `salt-ds review <file-or-dir> --url <url>`
- Prefer browser-session evidence.
- Use fetched-html fallback only for narrower structure claims.
- Treat layout-debug details as advanced evidence only.

## 7. return the fix result

For debug/fix mode, return:

- broken region
- suspected root cause
- smallest credible fix
- validation surface used
- verification completed or still needed

Do not default to a long issue list unless the narrow bug clearly reveals multiple independent problems.

## examples

### navigation centering

- Confirm whether the screen should use a Salt navigation shell or a local wrapper built around Salt navigation primitives.
- Check whether centering is owned by:
  - the navigation primitive
  - the shell wrapper
  - the parent flex container
- Prefer fixing the structure owner rather than patching the child with ad hoc centering CSS.

### dashboard metric drift

- Confirm whether the metric area should be a Salt data-display surface, a layout pattern, or a lighter composition.
- Check for generic card rows, hard-coded widths, and wrapper spacing before changing individual card styles.
- If the problem is really the absence of a clear Salt structure, say so and recommend the smallest structural correction.

### wrong primitive disguised as a layout bug

- A “centering” or “spacing” issue may be a primitive-choice issue, such as `Button` used where `Link` or structured navigation is the real target.
- Confirm the canonical Salt choice before treating the issue as pure styling.

### wrapper conflict

- If the repo has shell or wrapper conventions, check project conventions before blaming Salt itself.
- Keep the canonical Salt direction visible, then explain how the local wrapper changes the actual fix path.
