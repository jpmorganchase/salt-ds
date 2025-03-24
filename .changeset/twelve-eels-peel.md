---
"@salt-ds/theme": patch
---

Changed `--salt-track-borderColor` token from `--salt-palette-alpha-contrast-lower` to `--salt-palette-alpha-contrast-medium` to fix the contrast issue in the track.

| Token                      | Old value                             | New value                              |
| -------------------------- | ------------------------------------- | -------------------------------------- |
| `--salt-track-borderColor` | `--salt-palette-alpha-contrast-lower` | `--salt-palette-alpha-contrast-medium` |

This change impacts the following components:

- Slider
- RangeSlider
- Progress
- Stepped Tracker
