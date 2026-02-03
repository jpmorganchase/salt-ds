---
"@salt-ds/core": minor
---

`AriaAnnouncer` prop `delay` is deprecated in favour of an `options` prop.

The `options` prop provides `ariaLive` which can be set to either `polite` or `assertive` depending on the use case.

```diff
+ const { announce } = useAriaAnnouncer();
- announce("message", 500)
+ announce("message", { ariaLive: "polite" });
```

The `delay` is replaced by two DOM elements that are used to announce messages.
The first element is used for `assertive` messages and the second for `polite` messages.
Messages are queued and remain in the DOM for 300 msecs before being removed, negating the need for a delay.

By default using the options prop will default to `polite` announcements.
