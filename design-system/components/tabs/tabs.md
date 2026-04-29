# Tabs

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/tabs
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/tabs/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/tabs/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/tabs/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-tabs--default

### Validation
- [ ] Generated usage aligns with `./tabs.md` "When to use"
- [ ] Generated usage avoids `./tabs.md` "When not to use"
- [ ] Required props and value types match `./tabs.json`
- [ ] Accessibility requirements from `./tabs.json` are satisfied

## When to use

- Switch between related views or sections within the same context
- Display one content panel at a time while keeping sibling panels accessible
- Organize content within a page section, card, or dialog where space is limited

## When not to use

- **Navigation between pages** → use `NavigationItem` instead
- **Step-by-step process** → use `Stepper`
- **Show/hide a single section** → use `Accordion`
- **Filter or select data** → use `SegmentedButtonGroup`

## Decision trees

### When to use this component vs alternatives
- Choose this component when you need the specific interactive or display patterns it provides
- Avoid if a simpler or more generic component would meet the requirements

### When to use each variant/state
- Default state: Use when no special status or condition applies
- Active/selected state: Use when highlighting user selection
- Disabled state: Use when an action is currently unavailable
- Error/warning state: Use to indicate a problem or caution

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Required props provided with correct types
- [ ] Accessibility attributes properly configured
- [ ] Keyboard navigation works as expected
- [ ] Visual states meet design system standards

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/tabs
- Tabs Next source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/lab/src/tabs-next
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/tabs/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/tabs/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-tabs--default
- Stories source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/lab/stories/tabs-next

## Using the component

| Rule | Logic |
|---|---|
- Use tabs to organize logically related but mutually exclusive content on a single page
- Use tabs when users should switch views without navigating away to a different page
- Use tabs to keep related tools/content in the same context with one active panel

### Validation
- [ ] Generated usage aligns with `./tabs.md` "When to use"
- Don’t use tabs when users must compare information between views simultaneously
- Don’t use tabs to communicate progress through steps (use `Stepper`)
- Don’t use tabs for primary/page-level navigation (use `NavigationItem`)
## Accessibility intent
## Decision tree: Tabs vs alternatives
- `TabBar` has `role="tablist"` and individual tabs have `role="tab"`
```
Do users need to switch between related views in the same page context?
├─ No → Use inline content, Accordion, or page sections
└─ Yes → Do they need to compare views side-by-side?
	 ├─ Yes → Use split layout/cards instead of tabs
	 └─ No → Is this a step-by-step workflow?
			├─ Yes → Use Stepper
			└─ No → Is this page-level/site navigation?
				 ├─ Yes → Use NavigationItem
				 └─ No → Use TabsNext composition
```

## Tabs Next composition

Use this structure with `@salt-ds/lab` components:

```tsx
import {
	TabsNext,
	TabBar,
	TabListNext,
	TabNext,
	TabNextTrigger,
	TabNextPanel,
} from "@salt-ds/lab";
```

Typical composition:

```tsx
<TabsNext defaultValue="Home">
	<TabBar inset divider>
		<TabListNext appearance="bordered" aria-label="Example tablist">
			<TabNext value="Home">
				<TabNextTrigger>Home</TabNextTrigger>
			</TabNext>
			<TabNext value="Transactions">
				<TabNextTrigger>Transactions</TabNextTrigger>
			</TabNext>
		</TabListNext>
	</TabBar>

	<TabNextPanel value="Home">Home content</TabNextPanel>
	<TabNextPanel value="Transactions">Transactions content</TabNextPanel>
</TabsNext>
```

## Variant and pattern guidance

- **Appearance**: Use `appearance="bordered"` (default) or `appearance="transparent"` for inline contexts
- **Active color**: `activeColor="primary" | "secondary" | "tertiary"` for context alignment
- **Overflow**: When tabs exceed width, hidden tabs move to overflow menu automatically
- **With icon**: Icons appear left of label text; keep icon semantics consistent across tabs
- **With badge**: Badge can communicate notifications/new content within trigger
- **Add tab pattern**: Place add action button in `TabBar`; set newly added tab as selected
- **Dismissible tabs**: Use `TabNextAction`; avoid dismissing essential tabs and avoid removing last tab
- ❌ Using tabs for sequential workflows — use `Stepper` instead
- ❌ Using tabs for page-level navigation — use `NavigationItem`
- ❌ Inconsistent panel heights causing layout shifts — set a minimum height or use consistent content structure
- [ ] `TabsNext` wraps the full tab structure
- [ ] Every `TabNext` has a unique `value` within the same `TabsNext`
- [ ] Every `TabNextPanel` has a matching unique `value`
- [ ] `TabNextTrigger` is used for selectable tab label content
- [ ] `TabListNext` has appropriate appearance/activeColor and accessible labeling
- [ ] Keyboard nav verified: Arrow keys, Home/End, Tab/Shift+Tab, Enter/Space
- [ ] Disabled tabs are non-interactive and announced correctly
- [ ] Overflow behavior is tested with constrained width
- [ ] If adding/dismissing tabs, selection and focus recovery are verified
- [ ] useAriaAnnouncer is used for dynamic add/remove announcements
- Tab labels should clearly distinguish the content in each panel
- Avoid redundant prefixes: "Account Settings", "Account Billing" → "Settings", "Billing"
- Keep the number of tabs manageable — 2–7 is ideal; consider a different pattern for more
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/lab/src/tabs-next

## Layout rules

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/lab/stories/tabs-next

## Accessibility intent

- `TabListNext` renders `role="tablist"`
- `TabNextTrigger` renders `role="tab"` with `aria-selected`, `aria-controls`, `aria-disabled` as appropriate
- `TabNextPanel` renders `role="tabpanel"` with `aria-labelledby` and is hidden when not selected
- Tab enters/exits the component via standard tab order
- Arrow Left/Right navigate tab items in main list; Arrow Up/Down navigate overflow list
- Home/End move focus to first/last tab
- Enter/Space activate focused tab (unless disabled)
- Check focusable content in tab panels to ensure expected keyboard traversal
- Only one `TabPanel` is visible at a time
- Tab content should have consistent padding — use Salt spacing tokens
- Use `StackLayout` for vertical content within a `TabPanel`
- In responsive layouts, consider whether tabs should scroll or wrap
- Intent is in-page switching between mutually exclusive related views
- Users should stay on current page context while switching sections
- Implementation can use `TabsNext` + `TabBar` + `TabListNext` + `TabNext` + `TabNextTrigger` (+ optional `TabNextAction`) + `TabNextPanel`
- NOT for page navigation, side-by-side comparison, or step workflows

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./tabs.md`
- Required behavior and constraints can be satisfied using props/states documented in `./tabs.json`

| **Import** | Use lab imports from `@salt-ds/lab` (`TabsNext`, `TabBar`, `TabListNext`, `TabNext`, `TabNextTrigger`, `TabNextPanel`) |
| **Identity** | Require unique `value` per `TabNext` and matching `TabNextPanel` value |
| **State** | Use `value` + `onChange` for controlled, or `defaultValue` for uncontrolled |
| **Structure** | Keep hierarchy `TabsNext > TabBar > TabListNext > TabNext > TabNextTrigger` |
| **Actions** | Add `TabNextAction` only for explicit tab-level actions (dismiss/settings) |
| **Appearance** | Default to `appearance="bordered"`, `activeColor="primary"` unless intent dictates otherwise |
| **Accessibility** | Ensure tablist/tab/tabpanel semantics and keyboard behavior are preserved |
|---|---|
| **Import** | Use the exact `import` statement from `./tabs.json` |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./tabs.json` |

### Validation