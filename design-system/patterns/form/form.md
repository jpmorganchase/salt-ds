# Form Pattern

## What this pattern solves
Provides a consistent, accessible structure for user input forms — from simple login screens to complex multi-field data entry.

## Required components
| Component | Role |
|---|---|
| `FormField` | Wraps each control with label, helper text, and validation |
| `FormFieldLabel` | Accessible label for the control |
| `FormFieldHelperText` | Hints, format guidance, or error messages |
| `Input` | Single-line text entry |
| `Button` | Form actions (submit, cancel, reset) |
| `StackLayout` | Vertical field layout |
| `FlowLayout` | Horizontal button group |

Additional controls as needed: `Dropdown`, `ComboBox`, `Checkbox`, `RadioButton`, `MultilineInput`, `DatePicker`.

## Layout structure
```
StackLayout (gap={2})
├── FormField
│   ├── FormFieldLabel
│   ├── Input (or other control)
│   └── FormFieldHelperText (optional)
├── FormField
│   ├── FormFieldLabel
│   ├── Input
│   └── FormFieldHelperText
└── FlowLayout (gap={1})
    ├── Button (primary — submit)
    └── Button (secondary — cancel)
```

## Variants

### Simple form (login, search)
- 1–3 fields, single submit button
- `StackLayout` with `gap={2}`

### Multi-section form
- Group related fields under section headings (`H3` or `H4`)
- Use `StackLayout` for each section, wrapped in an outer `StackLayout` with larger gap

### Inline form
- Fields side by side using `FlowLayout` or `GridLayout`
- Useful for short fields (first name + last name, city + postcode)

## Validation

### When to validate
- **On blur** — validate individual fields as the user moves away
- **On submit** — validate the entire form before submission
- Don't validate on every keystroke (too aggressive)

### How to show validation
- Set `validationStatus` on `FormField` (not on Input directly)
- Use `FormFieldHelperText` to explain the error
- Scroll to the first error if the form is long

### Validation states
| Status | Use when |
|---|---|
| `error` | Required field is empty, format is wrong, value is invalid |
| `warning` | Value is technically valid but may cause issues |
| `success` | Explicit confirmation that a field is valid (use sparingly) |

## Button placement
- Primary action (`solid`) first (leftmost), secondary (`bordered`) after
- Use `FlowLayout` with `gap={1}` for button groups
- Only one primary button per form
- Destructive actions use `negative` sentiment

## Do's
- ✅ Every form control inside a `FormField`
- ✅ Every `FormField` has a `FormFieldLabel`
- ✅ Clear, specific error messages in `FormFieldHelperText`
- ✅ Mark required fields with `necessity="required"` on `FormField`
- ✅ If most fields are mandatory, mark only optional ones with `necessity="optional"` instead
- ✅ Never add asterisks or "(required)" text manually — the `necessity` prop handles both the visible indicator and `aria-required` (WCAG 3.3.2)
- ✅ Use `StackLayout` for vertical form layout

## Don'ts
- ❌ Input without FormField
- ❌ Placeholder text as a substitute for labels
- ❌ Generic error messages ("Invalid input")
- ❌ Multiple primary buttons
- ❌ Custom CSS for form layout — use Salt layout components

## Example
```tsx
import {
  FormField, FormFieldLabel, FormFieldHelperText,
  Input, Button, StackLayout, FlowLayout
} from "@salt-ds/core";

function LoginForm() {
  return (
    <form>
      <StackLayout gap={2}>
        <FormField>
          <FormFieldLabel>Email address</FormFieldLabel>
          <Input type="email" bordered />
        </FormField>
        <FormField>
          <FormFieldLabel>Password</FormFieldLabel>
          <Input type="password" bordered />
        </FormField>
        <FlowLayout gap={1}>
          <Button sentiment="accented" appearance="solid" type="submit">
            Sign in
          </Button>
          <Button sentiment="accented" appearance="bordered" type="button">
            Cancel
          </Button>
        </FlowLayout>
      </StackLayout>
    </form>
  );
}
```
