# Tabs (Copilot Context)

Use for switching between related views within the same page context using the Tabs Next composition from `@salt-ds/lab`.

- API: ./tabs.json
- Guidance: ./tabs.md

## Key rules

- Compose with `TabsNext`, `TabBar`, `TabListNext`, `TabNext`, `TabNextTrigger`, and `TabNextPanel`.
- Every `TabNext` requires a unique `value`; each `TabNextPanel` must use the matching `value`.
- Use `defaultValue` for uncontrolled tabs; use `value` + `onChange` for controlled tabs.
- Keep labels short, sentence case, and do not wrap labels (truncate + tooltip when needed).
- Use `TabListNext` appearance variants: `bordered` (default) or `transparent`.
- Use `TabListNext` active colors: `primary` (default), `secondary`, `tertiary`.
- Overflow is automatic when space is constrained; verify keyboard behavior in overflow menu.
- Optional `TabNextAction` can add dismiss/settings actions; announce dynamic add/remove with `useAriaAnnouncer`.
- Keyboard: Arrow Left/Right (main list), Arrow Up/Down (overflow), Home/End (first/last), Enter/Space (select), Tab/Shift+Tab (exit/return to tab order).
- Not for page navigation (use `NavigationItem`) and not for progress workflows (use `Stepper`).

## Example
```tsx
import {
  TabsNext,
  TabBar,
  TabListNext,
  TabNext,
  TabNextTrigger,
  TabNextPanel,
} from "@salt-ds/lab";
import { useState } from "react";

export function TabsExample() {
  const [value, setValue] = useState("Overview");

  return (
    <TabsNext value={value} onChange={(_event, nextValue) => setValue(nextValue)}>
      <TabBar inset divider>
        <TabListNext appearance="bordered" aria-label="Details tabs">
          <TabNext value="Overview">
            <TabNextTrigger>Overview</TabNextTrigger>
          </TabNext>
          <TabNext value="Details">
            <TabNextTrigger>Details</TabNextTrigger>
          </TabNext>
          <TabNext value="Settings">
            <TabNextTrigger>Settings</TabNextTrigger>
          </TabNext>
        </TabListNext>
      </TabBar>

      <TabNextPanel value="Overview">Overview content</TabNextPanel>
      <TabNextPanel value="Details">Details content</TabNextPanel>
      <TabNextPanel value="Settings">Settings content</TabNextPanel>
    </TabsNext>
  );
}
```
