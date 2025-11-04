---
"@salt-ds/core": patch
---

Number Input improvements

- added optional, `increment` and `decrement` props to support decimal.js solution
- fixed issue with clamping, where a clamped value could not be incremented following text change
