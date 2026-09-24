---
"@salt-ds/core": patch
---

Fixed `InteractableCard` disabled states so disabled cards no longer respond to pointer or keyboard interactions or display hover and pressed styles.

Improved `InteractableCardGroup` keyboard navigation to follow the ARIA radio pattern: arrow keys no longer trigger browser scrolling, disabled cards are skipped, and an unselected group or a group whose selected card is disabled focuses the first enabled card.

Fixed an `InteractableCardGroup` that is re-enabled after being disabled being unreachable with Tab when its cards are hoisted or memoized.
Preserved the selected border on disabled cards, including cards with `borderColor="none"`, while keeping disabled hover and pressed effects suppressed.
