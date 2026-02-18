---
"@salt-ds/lab": minor
---

`Rating` has been added to allow users to provide feedback relating to your product or experience.

Basic usage:

```jsx
import { Rating } from "@salt-ds/lab";

function App() {
  const [value, setValue] = useState(0);

  return (
    <Rating
      value={value}
      onValueChange={(event, newValue) => setValue(newValue)}
    />
  );
}
```
