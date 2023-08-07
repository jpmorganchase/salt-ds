---
"@salt-ds/lab": minor
---

Change Dialog to use floating-ui, add useDialog hook.

Alert dialog example:

```tsx
<Dialog status="warning" role="alertdialog" open={open} onOpenChange={handleOpenChange}>
    <DialogTitle>Warning Alert Title</DialogTitle>
    <DialogContent>Alert description<DialogContent>
    <DialogActions>
        <Button>Cancel</Button>
        <Button variant="cta">Ok</Button>
    </DialogActions>
</Dialog>
```

Content dialog example:

```tsx
<Dialog open={open} onOpenChange={handleOpenChange}>
    <DialogTitle accent>Dialog Title</DialogTitle>
    <DialogContent>Dialog content...<DialogContent>
    <DialogActions>
        <SplitLayout
            startItem={<Button variant="secondary">Cancel</Button>}
        />
        <Button>Previous</Button>
        <Button variant="cta">Next</Button>
    </DialogActions>
    <DialogCloseButton onClick={() => handleOpenChange(false)}/>
</Dialog>
```
