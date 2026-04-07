# SidePanel Accessibility Quick Reference

## What's New?

The SidePanel component now fully implements WCAG 2.1 Level AA accessibility requirements:

✅ **Landmark Role** - `role="region"` with descriptive accessible name
✅ **Focus Management** - Automatic focus to first element when opening
✅ **Keyboard Navigation** - Tab/Shift+Tab with proper focus trapping
✅ **Escape to Close** - Press Escape to close and return focus
✅ **Screen Reader Support** - `aria-live` announces content updates
✅ **Multiple Triggers** - Works with table rows, lists, and other patterns
✅ **Toggle Behavior** - Click same trigger to close the panel

## Quick Start

### 1. Basic Usage (Single Trigger)

```tsx
import { SidePanelGroup, SidePanel, SidePanelTrigger, SidePanelCloseTrigger } from "@salt-ds/lab";
import { Button } from "@salt-ds/core";
import { useId } from "react";

export function MyPanel() {
  const headingId = useId();
  
  return (
    <SidePanelGroup>
      <SidePanelTrigger>
        <Button>Open Panel</Button>
      </SidePanelTrigger>
      
      <SidePanel aria-labelledby={headingId}>
        <SidePanelCloseTrigger>
          <Button>Close</Button>
        </SidePanelCloseTrigger>
        
        <h2 id={headingId}>Panel Title</h2>
        <p>Panel content goes here</p>
      </SidePanel>
    </SidePanelGroup>
  );
}
```

### 2. Multiple Triggers (Table with Row Details)

```tsx
import { SidePanelGroup, SidePanel, SidePanelTrigger } from "@salt-ds/lab";
import { useState } from "react";

export function TableWithPanel() {
  const [selectedRow, setSelectedRow] = useState(null);
  const headingId = useId();
  
  return (
    <SidePanelGroup>
      <Table>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} onClick={() => setSelectedRow(row)}>
              <td>{row.name}</td>
              <td>
                <SidePanelTrigger>
                  <Button>View</Button>
                </SidePanelTrigger>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      <SidePanel aria-labelledby={headingId}>
        {selectedRow && (
          <>
            <h2 id={headingId}>{selectedRow.name}</h2>
            <p>Email: {selectedRow.email}</p>
          </>
        )}
      </SidePanel>
    </SidePanelGroup>
  );
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Click trigger** | Open panel, focus moves inside |
| **Tab** | Navigate through panel elements, exit to next on last element |
| **Shift+Tab** | Navigate backwards, go to trigger from first element |
| **Escape** | Close panel, focus returns to trigger |
| **Click close button** | Close panel, focus returns to trigger |

## Important Tips

### ✨ Always Provide an Accessible Name
```tsx
// ✓ GOOD - Use aria-labelledby
<SidePanel aria-labelledby="panel-heading">
  <h2 id="panel-heading">Settings</h2>
</SidePanel>

// ✓ GOOD - Use aria-label
<SidePanel aria-label="User Settings">
</SidePanel>

// ⚠️ BAD - Missing accessible name (development warning)
<SidePanel>
</SidePanel>
```

### 🎯 Ensure First Focusable Element
For best focus experience, the first element in the panel should be focusable:
```tsx
<SidePanel>
  <SidePanelCloseTrigger>
    <Button>Close</Button>  {/* ← First focusable, gets focus */}
  </SidePanelCloseTrigger>
  <h2>Settings</h2>
  <form>{/* content */}</form>
</SidePanel>
```

### 🔄 For Dynamic Content (Table/List)
When content changes based on which trigger was clicked, focus automatically moves into the panel:
```tsx
// Content updates
setSelectedRow(newRow);

// Focus automatically moves to first element in panel
// (No manual focus management needed!)
```

### 🎨 Custom Focus Styling
Ensure focus indicators are visible:
```css
/* Your component CSS */
:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

## Accessibility Checklist for Developers

- [ ] SidePanel has `aria-labelledby` or `aria-label`
- [ ] First element in panel is focusable (button, input, link)
- [ ] Tested Tab navigation through all elements
- [ ] Tested Shift+Tab from first element
- [ ] Tested Escape key closes panel
- [ ] Tested focus returns to trigger on close
- [ ] Tested with screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Focus indicators are visible (3:1 contrast minimum)
- [ ] For table pattern: verified dynamically switching rows works
- [ ] For manual trigger: verified focus management works correctly

## Testing with Screen Readers

### Windows (NVDA)
1. Install NVDA: https://www.nvaccess.org
2. Enable screen reader: `Insert + N`
3. Tab to trigger and press Enter
4. Verify: "Settings panel, region" is announced
5. Tab through content and verify element announcements

### Mac (VoiceOver)
1. Enable VoiceOver: `Cmd + F5`
2. Use VO+Right Arrow to navigate
3. Tab to trigger and press Space/Enter
4. Verify announcements in rotor

### Linux/Windows (JAWS)
1. Install JAWS screen reader
2. Enable and configure
3. Tab to trigger and activate
4. Use arrow keys to navigate content
5. Listen for region announcement

## Common Issues and Solutions

### Issue: Focus doesn't move when opening panel
**Solution:** Ensure panel has at least one focusable element (button, input, etc.)

### Issue: Screen reader not announcing panel updates
**Solution:** Check that `aria-labelledby` or `aria-label` is set on the panel

### Issue: Tab sticks inside panel
**Solution:** This is intentional at the beginning. Press Escape or Tab from last element to exit.

### Issue: Focus doesn't return to trigger when closing
**Solution:** Verify trigger is properly managed via `SidePanelTrigger` component

## Advanced: Manual Control

For cases where you need manual focus control:

```tsx
export function AdvancedPanel() {
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  
  return (
    <SidePanel
      open={open}
      onOpenChange={setOpen}
      triggerRef={triggerRef}
      aria-labelledby="panel-title"
    >
      {/* Content */}
    </SidePanel>
  );
}
```

## Resources

- [WCAG 2.1 Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg)
- [WebAIM Focus Management](https://webaim.org/articles/keyboard)
- [MDN: Focus](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus)

## Need Help?

Refer to these documentation files:
- **ACCESSIBILITY.md** - Comprehensive accessibility requirements
- **FOCUS_FLOW.md** - Visual diagrams of focus behavior
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details
