# Overlay

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/overlay
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/overlay/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/overlay/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/overlay/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-overlay--default

### Validation
- [ ] Generated usage aligns with `./overlay.md` "When to use"
- [ ] Generated usage avoids `./overlay.md` "When not to use"
- [ ] Required props and value types match `./overlay.json`
- [ ] Accessibility requirements from `./overlay.json` are satisfied

## When to use

- **To expose interactive elements within contextual content**: Overlay allows users to interactively manipulate supplemental information (filters, settings, selections) without leaving the page.
- **For filter or dropdown panels**: Overlay displays filtering options, search results, or related actions positioned relative to a trigger.
- **When acknowledgement is needed before dismissal**: Overlay persists until user explicitly closes it (unlike Tooltip which auto-hides), ensuring content is reviewed.
- **For constrained in-context tasks**: Overlay content should be limited in scope; richer workflows belong in Dialog or Drawer.

## When not to use

- **For critical confirmations requiring immediate action**: Use Dialog instead for modal, blocking confirmation patterns.
- **For non-interactive informational hints**: Use Tooltip instead for brief, auto-dismissing context.
- **For persistent side panels or large content areas**: Use Drawer instead for persistent, full-height navigation or panels.
- **For extended multi-step workflows**: Use Dialog or new page instead. Overlay interaction is intentionally constrained.

## Decision tree: Overlay vs alternatives

```
Do you need floating content positioned near a trigger?
├─ No → Use Panel, Card, or inline content
└─ Yes → Interactive content needed?
   ├─ No → Use Tooltip (auto-dismiss) or Popover info
   └─ Yes → Critical confirmation needed?
      ├─ Yes → Use Dialog (modal, focused confirmation)
      └─ No → Persistent side layout needed?
         ├─ Yes → Use Drawer (fixed-position, resizable)
         └─ No → Use Overlay (floating, dismissible, constrained interaction)
```

## Placement and positioning

- **placement prop**: Specifies preferred positioning (`top`, `bottom`, `left`, `right`).
- **Automatic repositioning**: floating-ui's `flip()` middleware automatically repositions if overflow detected (e.g., bottom placement flips to top if near viewport edge).
- **Offset**: Default 11px gap between trigger and overlay panel.
- **Arrow**: FloatingArrow visually connects overlay to trigger element.

## Focus and keyboard behavior

### On overlay open
1. Focus moves into overlay panel
2. If OverlayHeader with close button present, close button receives initial focus
3. Focus trapped within overlay (Tab/Shift+Tab cycle through focusable elements)

### Keyboard interactions
- **Escape**: Closes overlay from any content element, returns focus to trigger
- **Tab** (from close button): Moves to first focusable content element
- **Tab** (from last content element): Wraps focus to close button
- **Shift+Tab** (from close button): Moves to last focusable content element
- **Shift+Tab** (from first content element): Wraps focus to close button
- **Enter/Space** (close button focused): Closes overlay
- **Click outside panel**: Dismisses overlay via floating-ui `useDismiss` behavior

### On overlay close
- Focus returns to trigger element
- Overlay removed from viewport and DOM (portal cleanup)
- Page content becomes interactive again

## Header and content patterns

### Structured header (recommended)
```tsx
<OverlayHeader
  header="Filter options"
  description="Select criteria to refine results"
  actions={<Button aria-label="Close"><CloseIcon /></Button>}
/>
<OverlayPanelContent>
  {/* Content */}
</OverlayPanelContent>
```

### Deprecated close button pattern
```tsx
{/* Avoid this pattern */}
<OverlayPanelContent>{/* Content */}</OverlayPanelContent>
<OverlayPanelCloseButton />  {/* Deprecated */}
```

### Long content handling
- Overlay panel content scrolls when exceeding panel height
- Close button (or OverlayHeader) remains sticky and accessible at all times

## Accessibility requirements

### Screen reader context
- Add `id="overlay-unique-id"` to Overlay component
- Add `id="overlay-unique-id-header"` to content header or title for heading context
- Add `id="overlay-unique-id-content"` to content description for landmark context
- Use OverlayHeader for semantic H2 title (preferred over manual heading structure)

### Keyboard and focus
- Trigger element receives `aria-expanded` (managed by Overlay context) to indicate state
- Focus trap prevents keyboard navigation outside overlay while open
- Escape key provides explicit close mechanism from any content element
- Close button always accessible via keyboard (receives initial focus)

## Validation checklist

- [ ] Overlay used only for constrained, interactive, in-context tasks (not critical confirmations or hints)
- [ ] OverlayTrigger wraps single focusable element (typically Button)
- [ ] OverlayPanel contains OverlayHeader for structured header OR OverlayPanelContent for custom layouts
- [ ] Close action provided (OverlayHeader actions or deprecated OverlayPanelCloseButton)
- [ ] Focus enters overlay on open and returns to trigger on close
- [ ] Escape key closes overlay from any content element
- [ ] Keyboard focus cycles within overlay (Tab/Shift+Tab trap)
- [ ] Content scrolls gracefully if exceeding panel height
- [ ] IDs set on Overlay, header, and content for screen reader context
- [ ] Trigger has aria-expanded (set by Overlay context automatically)
- [ ] No nested overlays (use Dialog or Drawer for complex patterns)
- [ ] Placement appropriate for trigger position and viewport

## AI generation rules (required)

### Select this component when
- Intent is to display floating contextual content (filters, options, related actions) positioned near a trigger
- Content interaction is constrained and brief
- User-initiated dismissal is supported (button click, Escape key, click outside)
- Critical decision-making is NOT involved (use Dialog instead)
- Non-interactive hints are NOT the use case (use Tooltip instead)

### Auto-configure

| Rule | Logic |
|---|---|
| **Structure** | Always use Overlay > { OverlayTrigger (Button), OverlayPanel > { OverlayHeader or OverlayPanelContent } } |
| **Header** | Include OverlayHeader with header and actions (close button) instead of manual layout + deprecated OverlayPanelCloseButton |
| **Placement** | Set placement="top\|bottom\|left\|right" based on trigger position and available viewport space |
| **Content** | Limit overlay content to constrained tasks; use Dialog for multi-step workflows |
| **IDs** | Set id on Overlay root, id-header on header/title, id-content on description for screen readers |
| **Focus** | Automatically managed by Overlay context; focus enters on open, returns to trigger on close |
| **Keyboard** | Automatically handled by floating-ui interactions; Escape closes, Tab/Shift+Tab cycle within |
| **Accessibility** | Ensure trigger is focusable Button; OverlayHeader or proper ARIA labels on content |

### Storybook references
- Default: https://storybook.saltdesignsystem.com/?path=/story/core-overlay--default
- Placement variants: Bottom, Left, Right, Top
- Content patterns: Long Content, With Actions, With Tooltip, Long Header
- Deprecated: Close Button (use OverlayHeader.actions instead)

### Validation
- [ ] Generated usage aligns with `./overlay.md` "When to use"
- [ ] Generated usage avoids `./overlay.md` "When not to use"
- [ ] Required props and value types match `./overlay.json`
- [ ] Accessibility requirements from `./overlay.json` are satisfied