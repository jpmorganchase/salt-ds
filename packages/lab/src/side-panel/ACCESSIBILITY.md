# Side Panel Component - Accessibility Requirements

This document outlines how the SidePanel component meets WCAG 2.1 Level AA accessibility requirements for focus management, keyboard navigation, and screen reader support.

## Requirements Met

### 1. Landmark Role ✓
**Requirement:** The side panel must have `role="region"` and a descriptive `aria-label` or `aria-labelledby` to provide a meaningful accessible name for assistive technologies.

**Implementation:**
- The side panel has `role="region"` by default
- Must provide either `aria-label` or `aria-labelledby` prop
- Development warning is logged if neither is provided

**Example:**
```tsx
<SidePanel aria-labelledby="panel-heading">
  <h2 id="panel-heading">Section Title</h2>
  {/* content */}
</SidePanel>
```

### 2. Trigger Button Attributes ✓
**Requirement:** The trigger button must include:
- `aria-expanded="true"` when the associated side panel is open
- `aria-expanded="false"` when closed
- `aria-controls="[ID]"` referencing the unique ID of the side panel

**Implementation:**
- `SidePanelTrigger` automatically manages these attributes
- `aria-expanded` reflects the open/closed state
- `aria-controls` points to the panel's ID

**Example:**
```tsx
<SidePanelGroup>
  <SidePanelTrigger>
    <Button>Open Panel</Button>  {/* aria-expanded and aria-controls are managed */}
  </SidePanelTrigger>
  <SidePanel id="settings-panel">
    {/* content */}
  </SidePanel>
</SidePanelGroup>
```

### 3. Focus Management on Open ✓
**Requirement:** When the trigger button opens the side panel:
- Focus must move to the first interactive element inside the side panel
- If no interactive element exists, focus should move to the side panel region itself

**Implementation:**
- `useIsomorphicLayoutEffect` in SidePanel manages focus movement
- By default (`initialFocus={0}`), focuses the first focusable element
- Falls back to the panel itself if no interactive elements exist
- Custom focus target can be specified via `initialFocus` ref prop

**Example:**
```tsx
const closeButtonRef = useRef(null);

<SidePanel initialFocus={closeButtonRef}>
  <SidePanelCloseTrigger ref={closeButtonRef}>
    <Button>Close</Button>
  </SidePanelCloseTrigger>
  {/* content */}
</SidePanel>
```

### 4. Toggle Behavior ✓
**Requirement:** The trigger button must toggle the visibility state of the side panel (open/close) on activation.

**Implementation:**
- `SidePanelTrigger` toggles the panel open/closed on click
- Clicking the same trigger while panel is open closes it
- Clicking a different trigger while panel is open switches content and moves focus

### 5. Focus Management on Close ✓
**Requirement:** When the side panel is closed (via Escape key, close button, or programmatically):
- Focus must return to the trigger button that opened the side panel

**Implementation:**
- The `useEffect` hook that handles the exit animation returns focus to `focusReturnTriggerRef`
- Works when closing via:
  - Escape key press
  - Close button click
  - Programmatic state change
  - External trigger activation

### 6. Multiple Triggers and Dynamic Content ✓
**Requirement:** When multiple triggers exist (e.g., each row in a table):
- Activating a trigger must move focus from the trigger into the side panel
- If a different trigger is activated while the panel is open, the panel content must update
- If the same trigger is activated again, the panel should close (toggle behavior)
- The side panel should not perform a close-and-reopen animation when switching content
- New region should be announced to screen readers

**Implementation:**
- `activationCount` in `SidePanelGroup` increments on each trigger activation
- This drives focus movement without triggering close/reopen animations
- `aria-live="polite"` on the panel announces content updates to screen readers
- Content updates happen in place without animation interruption

**Example - Table with Row Details:**
```tsx
export const WithTable = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const panelHeadingId = useId();

  const handleRowClick = (row) => {
    setSelectedRow(row);  // Content updates, focus moves into panel
  };

  return (
    <SidePanelGroup>
      <FlexLayout gap={0} style={{ height: "100vh" }}>
        <div style={{ flex: 1 }}>
          <TableContainer>
            {rows.map((row) => (
              <tr key={row.id} onClick={() => handleRowClick(row)}>
                <SidePanelTrigger>
                  <Button>View Details</Button>
                </SidePanelTrigger>
              </tr>
            ))}
          </TableContainer>
        </div>
        
        <SidePanel aria-labelledby={panelHeadingId}>
          {selectedRow && (
            <StackLayout>
              <H2 id={panelHeadingId}>{selectedRow.name}</H2>
              <Text>{selectedRow.email}</Text>
            </StackLayout>
          )}
        </SidePanel>
      </FlexLayout>
    </SidePanelGroup>
  );
};
```

### 7. Tab Order and Keyboard Navigation ✓
**Requirement:**
- When the side panel is open:
  - Pressing Shift+Tab on the first interactive element must move focus back to the trigger button
  - Pressing Tab on the last interactive element must move focus to the next interactive element after the side panel's trigger button
  - Tab order includes: trigger button → panel elements → next elements in document order

**Implementation:**
- Custom `handleKeyDownCapture` manages keyboard navigation
- Shift+Tab navigation:
  - When focus is on the first focusable element in the panel and Shift+Tab is pressed, focus moves to the trigger button
  - This allows natural backward navigation
- Tab navigation:
  - When focus is on the last focusable element in the panel and Tab is pressed, focus moves to the next focusable element after the trigger button in document order
  - This allows focus to exit the panel naturally when reaching the end
- Tab order flow: trigger → first panel element → ... → last panel element → next element after trigger → ...
- If no focusable elements exist in the panel, Tab/Shift+Tab are prevented from doing anything
- Escape key closes the panel and returns focus to the trigger

**Example - Keyboard Navigation:**
```
1. User clicks trigger button → focus moves into panel (usually close button or first form field)
2. User presses Tab → focus moves through focusable elements in panel
3. From last focusable element in panel, Tab → focus moves to next element after trigger in document
4. User clicks "Close" button or presses Escape → panel closes, focus returns to trigger
5. Later, user presses Tab from trigger → focus moves through other page elements
6. Eventually user presses Shift+Tab → focus could come back to trigger from the next element after trigger
7. From trigger, Shift+Tab → focus returns to the last element in the panel (when panel is open)
```

## Implementation Details

### Focus Management Algorithm
The component manages focus in the following way:
1. When panel opens: Focus moves to first focusable element (or panel if none exist)
2. Tab navigation:
   - From trigger: Next Tab moves to first focusable element in panel
   - Within panel: Tab moves to next focusable element
   - From last panel element: Tab moves to next focusable element after trigger in document order
3. Shift+Tab navigation:
   - From trigger: Shift+Tab moves backward (not related to panel)
   - From first panel element: Shift+Tab moves to trigger
   - Within panel: Shift+Tab moves to previous focusable element
4. When panel closes: Focus returns to trigger button
5. Escape key always closes panel and returns focus to trigger

The focus management allows natural forward/backward navigation through the document while keeping focus within the panel's forward tab order.

### Screen Reader Announcements
- **Panel Opening:** Focus moves into panel, first interactive element receives focus
- **Panel Content Update:** `aria-live="polite"` announces changes to screen reader users without interrupting reading
- **Panel Closing:** Focus returns to trigger button, region is no longer announced

### Accessible Name Requirement
The component enforces that either `aria-label` or `aria-labelledby` is provided:
- In development mode, a warning is logged if neither is provided
- The accessible name is essential for screen reader users to understand the panel's purpose

## Testing Keyboard Navigation

### Test Scenario 1: Basic Tab Order
```
1. Click trigger button
2. Verify focus is on first interactive element (or panel if none exist)
3. Press Tab multiple times → focus moves through elements in panel
4. Verify focus eventually exits panel to next element in document after trigger
```

### Test Scenario 2: Reverse Tab Order from First Element
```
1. Click trigger button
2. Focus is on first element in panel
3. Press Shift+Tab → focus moves to trigger button
4. Verify focus is now on the trigger button
```

### Test Scenario 3: Tab from Last Element
```
1. Click trigger button
2. Tab through panel until reaching the last focusable element
3. Press Tab → focus should move to next focusable element after trigger in document order
4. Verify panel remains open
```

### Test Scenario 4: Escape Key
```
1. Panel is open, focus is inside
2. Press Escape → panel closes
3. Verify focus returns to trigger button
4. Verify trigger button is still visible and can be interacted with
```

### Test Scenario 5: Multiple Triggers (Table)
```
1. Click "View Details" button on row 1
2. Panel opens with row 1 data, focus moves into panel
3. Click "View Details" button on row 2
4. Panel content updates to row 2 data without animation
5. Verify focus moves into panel again (to first interactive element)
6. Click same button ("View Details" on row 2 again)
7. Verify panel closes and focus returns to the row 2 button
```

### Test Scenario 6: Screen Reader
```
1. Open browser DevTools accessibility inspector or use screen reader (NVDA, JAWS, VoiceOver)
2. Click trigger button
3. Verify screen reader announces:
   - Panel opens (implicit via focus change)
   - First interactive element is focused
   - Panel role and accessible name (from aria-label or aria-labelledby)
4. Set different content and verify aria-live="polite" announces the region
5. Press Escape
6. Verify screen reader announces focus return to trigger
```

## Migration Guide

If you're upgrading from a previous version, no breaking changes to the API are required. However, to fully utilize the accessibility features:

1. **Always provide aria-labelledby or aria-label:**
   ```tsx
   // ✓ Good
   <SidePanel aria-labelledby="heading-id">
     <h2 id="heading-id">Panel Title</h2>
   </SidePanel>

   // ✓ Good
   <SidePanel aria-label="Settings Panel">
   </SidePanel>

   // ⚠ Warning in development
   <SidePanel>
   </SidePanel>
   ```

2. **Ensure focusable elements in the panel:**
   - Close button
   - Form fields
   - Action buttons
   - This ensures proper focus management

3. **Test keyboard navigation:**
   - Tab through the panel when it's open
   - Verify Shift+Tab works
   - Verify Escape closes the panel and returns focus

## Related Components

- `SidePanelGroup` - Container for managing panel state
- `SidePanelTrigger` - Trigger button for opening/closing the panel
- `SidePanelCloseTrigger` - Button for closing the panel
- `FloatingFocusManager` - Provides focus context (from floating-ui library)
