---
"@salt-ds/theme": minor
---

Aligned the theme and theme-next fade/alpha token implementation. All fade tokens have been deprecated and where necessary replaced with alpha tokens.

| Deprecated Token                                   | Replacement                 |
| -------------------------------------------------- | --------------------------- |
| --salt-color-blue-30-fade-background               | --salt-color-blue-30-40a    |
| --salt-color-blue-100-fade-foreground              | --salt-color-blue-100-40a   |
| --salt-color-blue-100-fade-fill                    | --salt-color-blue-100-40a   |
| --salt-color-blue-200-fade-foreground              | --salt-color-blue-200-40a   |
| --salt-color-blue-500-fade-foreground              | --salt-color-blue-500-40a   |
| --salt-color-blue-500-fade-border                  | --salt-color-blue-500-40a   |
| --salt-color-blue-500-fade-background              | --salt-color-blue-500-40a   |
| --salt-color-blue-600-fade-foreground              | --salt-color-blue-600-40a   |
| --salt-color-blue-600-fade-background              | --salt-color-blue-600-40a   |
| --salt-color-blue-600-fade-fill                    | --salt-color-blue-600-40a   |
| --salt-color-blue-700-fade-background              | --salt-color-blue-700-40a   |
| --salt-color-gray-20-fade-background               | --salt-color-gray-20-40a    |
| --salt-color-gray-20-fade-background-readonly      | No replacement              |
| --salt-color-gray-30-fade-background               | --salt-color-gray-30-40a    |
| --salt-color-gray-50-fade-background               | --salt-color-gray-50-40a    |
| --salt-color-gray-50-fade-border                   | --salt-color-gray-50-40a    |
| --salt-color-gray-60-fade-background               | --salt-color-gray-60-40a    |
| --salt-color-gray-60-fade-border                   | --salt-color-gray-60-40a    |
| --salt-color-gray-70-fade-background               | --salt-color-gray-70-40a    |
| --salt-color-gray-70-fade-foreground               | --salt-color-gray-70-40a    |
| --salt-color-gray-90-fade-foreground               | --salt-color-gray-90-40a    |
| --salt-color-gray-90-fade-border                   | --salt-color-gray-90-40a    |
| --salt-color-gray-90-fade-border-readonly          | --salt-color-gray-90-15a    |
| --salt-color-gray-200-fade-background              | --salt-color-gray-200-40a   |
| --salt-color-gray-200-fade-foreground              | --salt-color-gray-200-40a   |
| --salt-color-gray-200-fade-border                  | --salt-color-gray-200-40a   |
| --salt-color-gray-200-fade-border-readonly         | --salt-color-gray-200-15a   |
| --salt-color-gray-300-fade-border                  | --salt-color-gray-300-40a   |
| --salt-color-gray-300-fade-background              | --salt-color-gray-300-40a   |
| --salt-color-gray-600-fade-background              | --salt-color-gray-600-40a   |
| --salt-color-gray-600-fade-background-readonly     | No replacement              |
| --salt-color-gray-800-fade-background              | --salt-color-gray-800-40a   |
| --salt-color-gray-800-fade-background-readonly     | No replacement              |
| --salt-color-gray-900-fade-foreground              | --salt-color-gray-900-40a   |
| --salt-color-green-200-fade-foreground             | --salt-color-green-200-40a  |
| --salt-color-green-300-fade-foreground             | --salt-color-green-300-40a  |
| --salt-color-green-400-fade-foreground             | --salt-color-green-400-40a  |
| --salt-color-green-400-fade-border                 | --salt-color-green-400-40a  |
| --salt-color-green-500-fade-foreground             | --salt-color-green-500-40a  |
| --salt-color-green-500-fade-border                 | --salt-color-green-500-40a  |
| --salt-color-green-500-fade-background             | --salt-color-green-500-40a  |
| --salt-color-green-600-fade-foreground             | --salt-color-green-600-40a  |
| --salt-color-green-600-fade-background             | --salt-color-green-600-40a  |
| --salt-color-green-700-fade-foreground             | No replacement              |
| --salt-color-red-200-fade-foreground               | --salt-color-red-200-40a    |
| --salt-color-red-300-fade-foreground               | No replacement              |
| --salt-color-red-500-fade-foreground               | --salt-color-red-500-40a    |
| --salt-color-red-500-fade-border                   | --salt-color-red-500-40a    |
| --salt-color-red-600-fade-foreground               | --salt-color-red-600-40a    |
| --salt-color-red-600-fade-background               | --salt-color-red-600-40a    |
| --salt-color-red-700-fade-foreground               | No replacement              |
| --salt-color-orange-400-fade-foreground            | --salt-color-orange-400-40a |
| --salt-color-orange-400-fade-border                | --salt-color-orange-400-40a |
| --salt-color-orange-500-fade-border                | --salt-color-orange-500-40a |
| --salt-color-orange-600-fade-border                | --salt-color-orange-600-40a |
| --salt-color-orange-700-fade-border                | --salt-color-orange-700-40a |
| --salt-color-orange-850-fade-foreground            | --salt-color-orange-850-40a |
| --salt-color-white-fade-foreground                 | --salt-color-white-40a      |
| --salt-color-white-fade-background                 | --salt-color-white-40a      |
| --salt-color-white-fade-background-readonly        | No replacement              |
| --salt-color-white-fade-backdrop                   | --salt-color-white-70a      |
| --salt-color-white-fade-background-highlight       | --salt-color-white-30a      |
| --salt-color-white-fade-background-selection       | --salt-color-white-15a      |
| --salt-color-white-fade-separatorOpacity-primary   | --salt-color-white-45a      |
| --salt-color-white-fade-separatorOpacity-secondary | --salt-color-white-15a      |
| --salt-color-white-fade-separatorOpacity-tertiary  | --salt-color-white-10a      |
| --salt-color-black-fade-backdrop                   | --salt-color-black-70a      |
| --salt-color-black-fade-background-highlight       | --salt-color-black-30a      |
| --salt-color-black-fade-background-selection       | --salt-color-black-15a      |
| --salt-color-black-fade-separatorOpacity-primary   | --salt-color-black-45a      |
| --salt-color-black-fade-separatorOpacity-secondary | --salt-color-black-15a      |
| --salt-color-black-fade-separatorOpacity-tertiary  | --salt-color-black-10a      |
