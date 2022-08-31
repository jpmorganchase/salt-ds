---
"@jpmorganchase/uitk-core": minor
"@jpmorganchase/uitk-lab": minor
---

**BREAKING CHANGES:**

- Move Scrim to core
  `import {Scrim} from "@jpmorganchase/uitk-core";`
- Refactor `containerFix` and `parentRef` in to a single prop `containerRef`
- Rename `disableEnforceFocus` prop to `disableFocusTrap`
- Rename `returnFocus` prop to `returnFocusOptions`
