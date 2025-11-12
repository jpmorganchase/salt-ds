---
"@salt-ds/core": minor
---

Added `NumberInput`.

`NumberInput` displays a default numeric value that users can increase or decrease using the controls or by keyboard actions. Users can also manually enter a specific value.

```tsx
<NumberInput
  defaultValue={0}
  onNumberChange={(_event, newValue) =>
    console.log(`Number changed to ${newValue}`)
  }
/>
```
