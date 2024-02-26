---
"@salt-ds/core": patch
---

Removed auto scrolIntoView from Toast which caused issues for some users.

If this is a feature you need, pass a ref to Toast like below

```
  const toastRef = useRef<HTMLDivElement>();

  useLayoutEffect(() => {
    toastRef.current?.scrollIntoView();
  }, []);

  return (
    <Toast ref={toastRef}>
    // ...
  )
```
