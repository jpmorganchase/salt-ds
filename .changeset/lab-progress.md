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
- The types only allow `size` on circular progress.
- `status` accepts `"active"`, `"paused"`, `"success"` and `"error"`, and defaults to `"active"`. Success and error show an icon as well as color. On success, the icon replaces the value. `status="paused"` shows "Paused" beside the value and keeps the accent color, like the "On hold" progression in the Indication pattern. Reaching `max` fills the indicator but leaves it active until the task owner sets `status="success"`.
- `size` sets the size of circular progress. Large circular progress shows its value inside and its label below, as it's used centered, such as in a page loader. Small circular progress, which fits in compact spaces such as buttons, never shows its value. Every other size, and linear progress, always shows it. Screen readers read it from the progress bar either way.
- `delay` defaults to `0`, so progress appears immediately. Set `delay={1000}` to wait 1 second before showing. Tasks that succeed before the indicator appears stay hidden and aren't announced. Errors and tasks mounted with `status="success"` show immediately.
- Indeterminate progress announces its label and repeats it, like `Spinner`. Screen readers read the value of determinate progress themselves, so it only announces explicit success or error outcomes. Removing progress isn't announced, as it could mean the task was cancelled. `completionAnnouncement` customizes the success announcement, and `null` suppresses it.
- `disableAnnouncer` suppresses all loading, success and error announcements while retaining the progress bar's accessible name and value. Use it when a parent owns the task's announcements. Re-enabling announcements doesn't replay an outcome that occurred while they were disabled. The download button example owns its polite start and completion announcements, guards repeat presses, and preserves its icon slot and accessible name throughout loading.
- The track is a light neutral fill, 10% black in light mode and 10% white in dark mode, that stays the same in every state, and the bar fills it. The bar contrasts with the background, and the value is always shown as text, so the track doesn't need to. The bar eases to each new value from wherever it is. Inside a button, the track is the button's text color at 30% opacity.
- Bars and rings have rounded ends, using `--salt-palette-corner-strongest`, like the compact stepper.
- Loops slow down when users have turned on reduced motion.
- State changes animate, and any of them can be interrupted. When the value becomes known, the loop finishes its pass before the bar fills; the accessible value updates straight away. Pausing, failing, or turning on reduced motion during that handoff cancels its pending wait. Success changes color once the bar has filled, and a failed indeterminate loop stops where it is and fades out. Linear progress stays visible while returning to zero. Each new attempt can announce its outcome, including repeated successes or errors.
- Inside a `Button`, progress takes the button's text color, like an icon, so it contrasts with every button style. Override the colors with `--saltProgress-barColor` and `--saltProgress-trackColor`.

Updated the prototype API: replaced `paused` with `status="paused"`, required an explicit success status, made the reveal delay opt-in, and removed `hideValue`. To migrate an existing example:

```diff
-<Progress value={value} paused={isPaused} />
+<Progress
+  value={value}
+  status={isComplete ? "success" : isPaused ? "paused" : "active"}
+  delay={1000}
+/>
```

Use the task's actual outcome for `isComplete`; a full value can still be processing. Keep `delay={1000}` to retain the former reveal timing, or omit it to show progress immediately. Use `disableAnnouncer` instead of `completionAnnouncement={null}` when a parent owns all announcements, including loading and errors. Remove `hideValue`: linear, medium and large progress always show the value, and small circular progress never does.
