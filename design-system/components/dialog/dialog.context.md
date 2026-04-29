# Dialog (Copilot Context)

Modal overlay for critical information or decisions that require immediate user attention and interrupt workflow.

- API: ./dialog.json
- Guidance: ./dialog.md

## Key rules
- Use Dialog only when interruption is necessary
- Do not open a dialog from another dialog
- For non-blocking updates, prefer `Toast`; for in-workflow messaging, prefer `Banner`
- Manage `open` + `onOpenChange` from state
- Use `DialogHeader`, `DialogContent`, and `DialogActions` for structure
- Use `DialogHeader actions` for close controls; `DialogCloseButton` is deprecated
- For critical acknowledgments, set `role="alertdialog"`
- Focus is trapped while open; Escape closes and returns focus to trigger
- Use `initialFocus` to control the first focused element when needed

## Example

```tsx
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexLayout
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

function DeleteConfirmation() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button sentiment="accented" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <Dialog open={open} onOpenChange={setOpen} status="warning" disableDismiss>
        <DialogHeader
          header="Delete item"
          actions={
            <Button
              aria-label="Close dialog"
              appearance="transparent"
              onClick={() => setOpen(false)}
            >
              <CloseIcon aria-hidden />
            </Button>
          }
        />
        <DialogContent>
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <FlexLayout gap={1}>
            <Button appearance="bordered" sentiment="accented" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button sentiment="accented" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </FlexLayout>
        </DialogActions>
      </Dialog>
    </>
  );
}
```
