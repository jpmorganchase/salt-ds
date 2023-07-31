---
"@salt-ds/lab": patch
---

Add ToastGroup

```
<ToastGroup>
  <Toast status="success">
    <ToastContent>
      <Text>
        <strong>Project file upload</strong>
      </Text>
      <div>Project file has successfully uploaded to the shared drive. </div>
    </ToastContent>
    <Button variant="secondary" onClick={closeToast}>
      <CloseIcon />
    </Button>
  </Toast>
  <Toast>
    <ToastContent>
      <Text>
        <strong>File update</strong>
      </Text>
      <div>A new version of this file is available with 37 updates. </div>
    </ToastContent>
    <Button variant="secondary" onClick={closeToast}>
      <CloseIcon />
    </Button>
  </Toast>
</ToastGroup>
```
