# Form Pattern (Copilot Context)

Accessible, validated forms using Salt components.

- API: ./form.json
- Guidance: ./form.md

## Key rules
- Every input inside a `FormField` with a `FormFieldLabel`
- Layout: `StackLayout` (gap={2}) for fields, `FlowLayout` (gap={1}) for buttons
- Set `validationStatus` on FormField, not on Input
- One primary (`solid`) button per form, placed first (leftmost)
- Mark required fields with `necessity="required"` on FormField
- If most fields are mandatory, mark only optional ones with `necessity="optional"` instead
- Never add asterisks or "(required)" text manually — the `necessity` prop handles visuals and `aria-required`

## Example
```tsx
import { FormField, FormFieldLabel, Input, Button, StackLayout, FlowLayout } from "@salt-ds/core";

<form>
  <StackLayout gap={2}>
    <FormField>
      <FormFieldLabel>Email</FormFieldLabel>
      <Input type="email" bordered />
    </FormField>
    <FlowLayout gap={1}>
      <Button sentiment="accented" appearance="solid" type="submit">Submit</Button>
      <Button sentiment="accented" appearance="bordered" type="button">Cancel</Button>
    </FlowLayout>
  </StackLayout>
</form>
```
