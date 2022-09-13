---
"@jpmorganchase/uitk-core": minor
"@jpmorganchase/uitk-lab": minor
---

- `FormField`
  - Rename `FormFieldValidationState` type to `FormFieldValidationStatus`
  - Rename `validationState` prop to `validationStatus`
    - `FormLabel`
      - Rename `validationState` prop to `validationStatus`
    - `StatusIndicator`
      - Rename `StateIndicatorState` type to `StateIndicatorStatus`
      - Rename `state` prop to `status`
- `Tooltip`
  - Rename `TooltipState` type to `TooltipStatus`
  - Rename `state` prop to `status`
  - Rename `getIconForState` file to `getIconForStatus`
- `Dialog`
  - Rename `state` prop to `status`
    - `DialogContext`
      - Rename `state` context to `status`
