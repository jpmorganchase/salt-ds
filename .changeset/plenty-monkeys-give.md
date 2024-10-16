---
"@salt-ds/lab": minor
---

Added `DialogHeader` component to lab.

```typescript
  <Dialog open={open} onOpenChange={onOpenChange} id={id}>
    <DialogHeader header="Terms and conditions" actions={<Button
aria-label="Close overlay"
appearance="transparent"
sentiment="neutral"
  >
  <CloseIcon aria-hidden />
  </Button>}/>
    <DialogContent>
      <div>
          Only Chase Cards that we determine are eligible can be added to the Wallet.
      </div>
    </DialogContent>
  </Dialog>
```
