---
"@salt-ds/lab": minor
---

Added `Progress`, a proof of concept for the progress and loading north star. It covers linear and circular progress in one component: give it a `value` and it fills, or leave the value out and it loops.

```tsx
import { Progress } from "@salt-ds/lab";

<Progress
  label="Uploading files"
  value={3}
  max={5}
  getValueText={(value, max) => `${value} of ${max} files`}
  description="About 2 minutes left"
/>;

<Progress shape="circular" label="Loading accounts" />;
```

- `label`, `description` and `getValueText` show what's happening, in units that make sense to users. The value text is also the progress bar's `aria-valuetext`.
- `status` (`"success"` or `"error"`) and `paused` show the state of the task in place, with an icon and text as well as color.
- `size` sets the size of circular progress. Large circular progress shows its value inside.
- `delay` waits before showing, 1 second by default, so tasks that finish quickly show nothing.
- Indeterminate progress repeats its announcement like `Spinner`. Determinate progress announces at 25%, 50% and 75%, and when the task completes or fails.
- Loops slow down when users have turned on reduced motion.
- Inside a `Button`, progress takes the button's text color, like an icon, so it contrasts with every button style. Override the colors with `--saltProgress-barColor` and `--saltProgress-trackColor`.
