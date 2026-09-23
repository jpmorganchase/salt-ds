---
"@salt-ds/core": minor
---

Add `OverlayFooter`, a composable layout section for an overlay panel. Use it as a direct child of `OverlayPanel` with `OverlayHeader` and `OverlayPanelContent` to create structured layouts.

`OverlayHeader` and `OverlayFooter` own their padding on all sides. `OverlayPanelContent` drops its top padding after an `OverlayHeader` and its bottom padding before an `OverlayFooter`, so adjacent sections share a single gap.

Add the `--saltOverlay-header-padding` and `--saltOverlay-footer-padding` CSS variables to `OverlayHeader` and `OverlayFooter`.
