---
"@salt-ds/lab": minor
---

Added `DialogHeader` component to lab.

```typescript
  <Dialog open={open} onOpenChange={onOpenChange} id={id}>
    <DialogHeader header="Terms and conditions" actions={<CloseButton />}/>
    <DialogContent>
      <div>
          Only Chase Cards that we determine are eligible can be added to the Wallet.
      </div>
    </DialogContent>
  </Dialog>
```
