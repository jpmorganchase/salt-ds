---
"@salt-ds/core": patch
---

Fix Right click on Slider and NumberInput

Previously, when users right-clicked on the increment/decrement buttons of the NumberInput or the thumb of the Slider, these components could remain stuck in a pressed state. Update the components to properly handle right-clicks and other pointer events by canceling the pressed state when such interactions occur.
