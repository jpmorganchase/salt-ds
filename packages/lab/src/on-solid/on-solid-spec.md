[//]: # 'TODO: delete that before merging"'

# OnSolid Button

The OnSolid Button is a contextual button variant for use on solid semantic surfaces
(for example, actions within messaging components that use solid status fills). It provides a
consistent, readable, and accessible action treatment that remains legible regardless of the
underlying semantic colour, and should be used to trigger the primary action for the message
context (e.g., Dismiss, Undo, View details, Retry). It currently supports the Transparent
appearance for use directly on solid semantic backgrounds.

## Functional requirements

List out the features and functions the component must provide.

- States: default, hover, active, disabled
- Support icons (must meet contrast requirements on solid semantic fills)
- Support appearance: Transparent
- Note: bordered appearance not included in current scope
- Density aware spacing and size
- Does not support the `appearance`, `sentiment`, `variant`, `loading` and `loadingAnnouncement` props of Button
- Must be exposed as a contextual variant of Button, not a new button level / hierarchy
- Must be self-contained and not inherit container colours

## Size and spacing

- Width: hugs content
- Height: `--salt-size-base`

### Padding and spacing

- Spacing left-right is `--salt-spacing-100`
- Spacing between icon and button text is `--salt-spacing-50`

### Border

- `--salt-corner-weak`

## Variants

### Default

| Token      | Value                                    |
| ---------- | ---------------------------------------- |
| Background | `--actionable-onSolid-subtle-background` |
| Border     | `--actionable-onSolid-subtle-border`     |
| Foreground | `--actionable-onSolid-subtle-foreground` |

### Hover

| Token      | Value                                          |
| ---------- | ---------------------------------------------- |
| Background | `--actionable-onSolid-subtle-background-hover` |
| Border     | `--actionable-onSolid-subtle-border-hover`     |
| Foreground | `--actionable-onSolid-subtle-foreground-hover` |

### Active

| Token      | Value                                           |
| ---------- | ----------------------------------------------- |
| Background | `--actionable-onSolid-subtle-background-active` |
| Border     | `--actionable-onSolid-subtle-border-active`     |
| Foreground | `--actionable-onSolid-subtle-foreground-active` |

### Disabled (40% opacity)

| Token      | Value                                    |
| ---------- | ---------------------------------------- |
| Background | `--actionable-onSolid-subtle-background` |
| Border     | `--actionable-onSolid-subtle-border`     |
| Foreground | `--actionable-onSolid-subtle-foreground` |

## Docs site

Use an OnSolid button to deliver a consistent, accessible action style on solid semantic
surfaces, most commonly for close or dismiss actions within status messages that use solid
fills, ensuring the button maintains required contrast regardless of the underlying semantic
color.
