---
"@salt-ds/lab": minor
---

Added `DialogHeader` component to lab. `DialogHeader`'s update follows our standardized header for container components and app regions, and it can be added to provide a structured header for dialog. The header includes a title and actions that follows our Header Block pattern.

```typescript
<Dialog open={open} onOpenChange={onOpenChange} id={id}>
  <DialogHeader
    header={<H2>Terms and conditions</H2>}
    actions={
      <Button
        aria-label="Close overlay"
        appearance="transparent"
        sentiment="neutral"
      >
        <CloseIcon aria-hidden />
      </Button>
    }
  />
  <DialogContent>
    <div>
      Only Chase Cards that we determine are eligible can be added to the
    Wallet.
    </div>
  </DialogContent>
</Dialog>;
```
