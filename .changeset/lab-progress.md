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
- `bufferValue` shows how much is ready ahead of the progress on linear progress, such as the part of a video that has loaded. The types only allow `bufferValue` on linear progress and `size` on circular progress.
- `status` (`"success"` or `"error"`) shows the outcome in place, with an icon as well as color. On success, the icon replaces the value. `paused` shows "Paused" beside the value and keeps the accent color, like the "On hold" progression in the Indication pattern.
- `size` sets the size of circular progress. Large circular progress shows its value inside and its label below, as it's used centered, such as in a page loader. Small circular progress, which fits in compact spaces such as buttons, hides its value unless you set `hideValue={false}`.
- `delay` waits before showing, 1 second by default, so tasks that finish quickly show nothing.
- Indeterminate progress announces its label and repeats it, like `Spinner`. Screen readers read the value of determinate progress themselves, so it only announces when the task completes or fails. Removing progress isn't announced, as it could mean the task was cancelled.
- The track is a neutral outline, and the bar fills it. The bar and the outline both contrast with the background, and the bar ends where solid turns into outline. Small circular progress is too thin to outline, so its track is a tint of the bar color. The buffer is diagonal stripes in the bar color, which tell it apart from the empty track.
- Bars and rings have rounded ends, using `--salt-palette-corner-strongest`, like the compact stepper.
- Loops slow down when users have turned on reduced motion.
- State changes animate, and any of them can be interrupted. When the value becomes known, the loop finishes its pass before the bar fills, so the indicator never jumps; the value is still announced straight away. Success changes color once the bar has filled, and a failed loop stops where it is and fades out. With reduced motion, states change at once.
- Inside a `Button`, progress takes the button's text color, like an icon, so it contrasts with every button style. Override the colors with `--saltProgress-barColor` and `--saltProgress-trackColor`.
