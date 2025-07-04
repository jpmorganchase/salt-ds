---
"@salt-ds/theme": minor
---

Updated the alpha palette to add a bias towards lower values of alpha. This change affects alpha and alpha contrast tokens.

| Alpha level | Old alpha value | New alpha value |
| ----------- | --------------- | --------------- |
| Highest     | 90%             | 80%             |
| Higher      | 80%             | 65%             |
| High        | 70%             | 50%             |
| Medium High | 60%             | 40%             |
| Medium      | 50%             | 30%             |
| Medium Low  | 40%             | 20%             |
| Low         | 30%             | 15%             |
| Lower       | 20%             | 10%             |
| Lowest      | 10%             | 5%              |

As part of this change, characteristics have been updated to use the new level that corresponds to their old value. For example:

| Token                                   | Replacement                              |
| --------------------------------------- | ---------------------------------------- |
| --salt-palette-alpha-high               | --salt-palette-alpha-higher              |
| --salt-palette-alpha-contrast-lowest    | --salt-palette-alpha-contrast-lower      |
| --salt-palette-alpha-contrast-lower     | --salt-palette-alpha-contrast-mediumLow  |
| --salt-palette-alpha-contrast-low       | --salt-palette-alpha-contrast-medium     |
| --salt-palette-alpha-contrast-mediumLow | --salt-palette-alpha-contrast-mediumHigh |
| --salt-palette-alpha-contrast-medium    | --salt-palette-alpha-contrast-high       |
