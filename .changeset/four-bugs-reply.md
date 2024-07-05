---
"@salt-ds/core": minor
---

Updated `LinearProgress` to display a moving line to represent an unspecified wait time, when `value` is `undefined`.

`<LinearProgress />`

*Note*: `value` and `bufferValue` are no longer default to `0`. Previously above code would render a 0% progress bar, which was not a good reflection of intent. You can still achieve it by passing in `value={0}`.
