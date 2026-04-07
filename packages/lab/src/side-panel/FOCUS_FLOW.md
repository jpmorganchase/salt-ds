# Side Panel Focus Flow Diagram

```
╔════════════════════════════════════════════════════════════════════════════╗
║                        SIDE PANEL FOCUS FLOW                               ║
╚════════════════════════════════════════════════════════════════════════════╝

SCENARIO 1: Opening Panel
════════════════════════════════════════════════════════════════════════════

  [Main Content]
       ↓
    [Button 1]  ← User clicks → SidePanelTrigger
       ↓
    [Button 2]
       ↓
    [Button 3]

  RESULT: Focus moves to first interactive element in SidePanel
  
      │
      └─→ [SidePanel Opens]
             ├─ [Close Button] ← Focus moves here (first focusable)
             ├─ [Form Field]
             ├─ [Submit Button]
             └─ [Cancel Button]


SCENARIO 2: Tab Navigation (Forward)
════════════════════════════════════════════════════════════════════════════

  Focus Sequence:
  
  [Trigger Button]
       │
       │ (User clicks)
       │
       ↓
  [Close Button]  ← Panel opens, focus here
       │
       │ (User presses Tab)
       │
       ↓
  [Form Field]
       │
       │ (User presses Tab)
       │
       ↓
  [Submit Button]
       │
       │ (User presses Tab)
       │
       ↓
  [Cancel Button]
       │
       │ (User presses Tab from last element)
       │
       ↓
  [Next Element After Trigger in Document]
       ├─ [Form Field in Main Content]
       ├─ [Another Button]
       └─ [etc.]


SCENARIO 3: Shift+Tab Navigation (Backward)
════════════════════════════════════════════════════════════════════════════

  [Cancel Button]  ← Focus is here
       │
       │ (User presses Shift+Tab)
       │
       ↓
  [Submit Button]
       │
       │ (User presses Shift+Tab)
       │
       ↓
  [Form Field]
       │
       │ (User presses Shift+Tab)
       │
       ↓
  [Close Button]
       │
       │ (User presses Shift+Tab from first element)
       │
       ↓
  [Trigger Button]  ← Focus returns to trigger


SCENARIO 4: Escape Key
════════════════════════════════════════════════════════════════════════════

  [Inside Panel]
  [Any Element]  ← Focus anywhere in panel
       │
       │ (User presses Escape)
       │
       ↓
  [Panel Closes]
       │
       └─→ [Trigger Button] ← Focus returns automatically


SCENARIO 5: Multiple Triggers (e.g., Table Rows)
════════════════════════════════════════════════════════════════════════════

  Initial State:
  
  ┌─ Row 1: [View Details] ← Click
  ├─ Row 2: [View Details]
  └─ Row 3: [View Details]

  Step 1: Click Row 1 "View Details"
  
  SidePanel Content:
  ├─ [Close Button] ← Focus moves here
  ├─ Row 1 Data: Name, Email, Department...
  └─ [Action Buttons]

  Step 2: Click Row 2 "View Details" (same panel open)
  
  SidePanel Content Updates (NO animation):
  ├─ [Close Button] ← Focus moves here (CONTENT UPDATED)
  ├─ Row 2 Data: Name, Email, Department...
  └─ [Action Buttons]

  Step 3: Click same Row 2 "View Details" again
  
  Panel closes, focus returns to Row 2 "View Details" button


FOCUS TRAP LOGIC
════════════════════════════════════════════════════════════════════════════

  First Element?         Shift+Tab?
        ├─ YES ─────────────→ Move to [Trigger Button]
        └─ NO  ─────────────→ Move to Previous Element

  Last Element?          Tab?
        ├─ YES ─────────────→ Move to [Next Element After Trigger]
        └─ NO  ─────────────→ Move to Next Element

  No Focusable Elements? Tab/Shift+Tab?
        ├─ YES ─────────────→ Prevent Default (stay on panel)
        └─ NO  ─────────────→ Use normal focus logic

  Any Element?           Escape?
        ├─ YES ─────────────→ Close Panel, Return Focus to Trigger
        └─ NO  ─────────────→ (keydown handler won't intercept)


ARIA LIVE UPDATES
════════════════════════════════════════════════════════════════════════════

  Initially:
  [aria-live="polite"]  ← Not announced while panel is closed

  Panel Opens:
  [aria-live="polite"]  ← Screen reader prepares to announce changes
       ↓

  Content Updates (Row 1 → Row 2 in table example):
  "Row 2 Data..."       ← Screen reader announces: "Row 2 data"
                            (without closing and reopening)


KEYBOARD SHORTCUTS REFERENCE
════════════════════════════════════════════════════════════════════════════

  ┌─────────────────────────────────────────────────────────────────┐
  │ Shortcut        │ Action                                         │
  ├─────────────────┼────────────────────────────────────────────────┤
  │ Tab             │ Focus next element (within panel or to next)    │
  │ Shift + Tab     │ Focus previous element (within panel or trigger)│
  │ Escape          │ Close panel and return focus to trigger        │
  │ Enter/Space     │ Activate focused button/element                │
  └─────────────────────────────────────────────────────────────────┘


ACCESSIBILITY REQUIREMENTS MAPPED TO FLOW
════════════════════════════════════════════════════════════════════════════

  1. Landmark Role (role="region")
     └─→ ✓ Panel has role="region" + aria-label/aria-labelledby

  2. Trigger Button Attributes
     └─→ ✓ aria-expanded + aria-controls automatically managed

  3. Focus on Open
     └─→ ✓ Focus moves to first interactive element (or panel)

  4. Toggle Behavior
     └─→ ✓ Click same trigger while open closes panel

  5. Focus on Close
     └─→ ✓ Escape or close button returns focus to trigger

  6. Multiple Triggers
     └─→ ✓ Panel content updates, focus moves (activationCount++)
         └─→ ✓ aria-live announces updates

  7. Tab Order
     └─→ ✓ Shift+Tab from first → trigger
     └─→ ✓ Tab from last → next element after trigger
     └─→ ✓ Tab/Shift+Tab handled correctly throughout
```

## Implementation Checklist

Use this checklist when implementing SidePanel in your application:

### Basic Setup
- [ ] Render `SidePanelGroup` as ancestor of triggers and panels
- [ ] Create `SidePanelTrigger` wrapping a button
- [ ] Create `SidePanel` with content
- [ ] Set `aria-labelledby` or `aria-label` on SidePanel

### Single Trigger Pattern
- [ ] SidePanelTrigger wraps button
- [ ] Button inside SidePanelTrigger
- [ ] SidePanel has unique id
- [ ] Trigger manages state via SidePanelGroup

### Multiple Triggers Pattern (e.g., Table)
- [ ] SidePanelTrigger for each row/item
- [ ] SidePanelGroup wraps entire layout
- [ ] SidePanel has dynamic content based on selection
- [ ] Panel content updates when different trigger activated
- [ ] Close button or Escape returns focus properly

### Manual Trigger Pattern
- [ ] Use `open` and `onOpenChange` props directly
- [ ] Pass `triggerRef` to SidePanel
- [ ] Manually manage open state

### Keyboard Testing
- [ ] Tab through panel content
- [ ] Shift+Tab from first element goes to trigger
- [ ] Tab from last element exits panel
- [ ] Escape closes panel
- [ ] Focus returns to trigger on close

### Screen Reader Testing
- [ ] Region role and name announced
- [ ] Content updates announced via aria-live
- [ ] Focus changes announced
- [ ] Button states (aria-expanded) announced
