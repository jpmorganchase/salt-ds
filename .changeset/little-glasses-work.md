---
"@salt-ds/theme": minor
---

Added sentiment characteristic.

| Token                                            |
| ------------------------------------------------ |
| --salt-sentiment-negative-foreground-decorative  |
| --salt-sentiment-negative-foreground-informative |
| --salt-sentiment-positive-foreground-decorative  |
| --salt-sentiment-positive-foreground-informative |
| --salt-sentiment-neutral-track                   |
| --salt-sentiment-neutral-track-disabled          |

As part of this change, some tokens have been deprecated.

| Token                             | Replacement                                     |
| --------------------------------- | ----------------------------------------------- |
| --salt-track-borderColor          | --salt-sentiment-neutral-track                  |
| --salt-track-borderColor-disabled | --salt-sentiment-neutral-track-disabled         |
| --salt-status-positive-foreground | --salt-sentiment-positive-foreground-decorative |
| --salt-status-negative-foreground | --salt-sentiment-negative-foreground-decorative |
