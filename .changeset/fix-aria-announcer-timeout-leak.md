---
"@salt-ds/core": patch
---

Fixed `AriaAnnouncerProvider` leaking pending `setTimeout` handles used to drain announcements from the live region. The provider now tracks each scheduled removal and clears any outstanding timers on unmount, preventing `setState`-on-unmounted warnings and test-worker crashes (e.g. `ReferenceError: window is not defined`) when the provider unmounts within the announcement drain window.
