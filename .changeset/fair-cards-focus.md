---
"@salt-ds/core": patch
---

Fixed disabled `InteractableCard` components responding to pointer or keyboard interactions and displaying hover or pressed styles.

Improved `InteractableCardGroup` keyboard navigation. Arrow keys no longer scroll the page, disabled cards are skipped, and focus moves to the first enabled card when no enabled card is selected.

Fixed an `InteractableCardGroup` becoming unreachable with Tab after it is re-enabled.

Disabled cards now retain their selected border without displaying hover or pressed effects.
