---
"@salt-ds/core": patch
---

Fixed disabled `InteractableCard` components responding to pointer or keyboard interactions and displaying hover or pressed styles. Disabled cards retain their selected border.

Disabled `InteractableCard` components can no longer receive focus and no longer render the `disabled` attribute, which is not valid on a `div`. Use `aria-disabled="true"` or the `saltInteractableCard-disabled` class to target disabled cards in styles or tests.

Improved single-select `InteractableCardGroup` keyboard navigation. Arrow keys skip disabled cards and no longer scroll the page, arrow keys pressed with Alt, Ctrl, or Meta are left to the browser, and Tab moves focus to the first enabled card when no enabled card is selected.

Fixed an `InteractableCardGroup` becoming unreachable with Tab after it is re-enabled.
