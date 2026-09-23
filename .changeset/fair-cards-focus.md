---
"@salt-ds/core": patch
---

Fixed `InteractableCard` disabled states so disabled cards no longer respond to pointer or keyboard interactions or display hover and pressed styles.

Improved `InteractableCardGroup` keyboard navigation to follow the ARIA radio pattern: arrow keys no longer trigger browser scrolling, disabled cards are skipped, and an unselected group or a group whose selected card is disabled focuses the first enabled card.
