---
"@salt-ds/theme": minor
---

Added editorial, eyebrow, body large and label large typography tokens to all themes.

- Editorial 1–4: `--salt-text-editorial1-fontSize` to `--salt-text-editorial4-fontSize`, `--salt-text-editorial1-lineHeight` to `--salt-text-editorial4-lineHeight` and `--salt-text-editorial-letterSpacing`.
- Editorial font: `--salt-text-editorial-fontFamily`, `--salt-text-editorial-fontWeight`, `--salt-text-editorial-fontWeight-small`, `--salt-text-editorial-fontWeight-strong`, `--salt-text-editorial-fontStyle` and `--salt-text-editorial-textTransform`. These match the display values in each theme.
- Eyebrow: `--salt-text-eyebrow-fontSize`, `--salt-text-eyebrow-lineHeight` and `--salt-text-eyebrow-letterSpacing`.
- Eyebrow font: `--salt-text-eyebrow-fontFamily`, `--salt-text-eyebrow-fontWeight`, `--salt-text-eyebrow-fontWeight-small`, `--salt-text-eyebrow-fontWeight-strong`, `--salt-text-eyebrow-fontStyle` and `--salt-text-eyebrow-textTransform`. These match the body text values in each theme.
- Body large: `--salt-text-large-fontSize` and `--salt-text-large-lineHeight`.
- Label large: `--salt-text-label-large-fontSize` and `--salt-text-label-large-lineHeight`.

| Token                    | High  | Medium | Low   | Mobile | Touch |
| ------------------------ | ----- | ------ | ----- | ------ | ----- |
| `editorial1` font size   | 122px | 144px  | 168px | 56px   | 194px |
| `editorial2` font size   | 102px | 122px  | 144px | 52px   | 168px |
| `editorial3` font size   | 84px  | 102px  | 122px | 48px   | 144px |
| `editorial4` font size   | 68px  | 84px   | 102px | 44px   | 122px |
| `eyebrow` font size      | 12px  | 14px   | 16px  | 16px   | 16px  |
| Body `fontSize-large`    | 12px  | 14px   | 16px  | 16px   | 16px  |
| `label` `fontSize-large` | 11px  | 12px   | 14px  | 14px   | 14px  |

Editorial line heights match their font size. Editorial letter spacing is -2% (`-0.02em`) in the J.P. Morgan (Interim) theme and 0 in the J.P. Morgan and Legacy (UITK) themes. Eyebrow line heights are 1.3× their font size, with letter spacing of 10% (`0.1em`) in J.P. Morgan, 8% (`0.08em`) in J.P. Morgan (Interim) and 6% (`0.06em`) in Legacy (UITK). Body large line heights are 1.6× and label large line heights are 1.3× their font size. All line heights are rounded to the nearest pixel.
