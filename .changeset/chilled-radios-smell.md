---
"@salt-ds/lab": patch
---

DatePicker helper text simplified and resizing bug fixed

In our DatePicker examples, we demonstrate how to include helper text when using a DatePicker within a FormField.
The design requires the helper text to move inside the panel when the DatePicker is opened.
However, this caused a resizing issue with the original date input.

To resolve this, we have refactored the implementation by introducing a `DatePickerHelperText` component.
This component is used as a child of the `DatePicker`, streamlining the process and removing the need for users to manage the visibility of the helper text themselves.

```diff
- <FormField validationStatus={validationStatus}>
-   <FormLabel>Select a date</FormLabel>
-   <DatePicker
-     selectionVariant={"single"}
-   >
-     <DatePickerTrigger>
-       <DatePickerSingleInput />
-     </DatePickerTrigger>
-     <DatePickerOverlay>
-       <DatePickerSingleGridPanel
-         helperText={helperText}
-       />
-       <DatePickerHelperText>{helperText}</DatePickerHelperText>
-     </DatePickerOverlay>
-   </DatePicker>
-   {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
- </FormField>
+ <FormField validationStatus={validationStatus}>
+   <FormLabel>Select a date</FormLabel>
+   <DatePicker
+     selectionVariant={"single"}
+   >
+     <DatePickerTrigger>
+       <DatePickerSingleInput />
+     </DatePickerTrigger>
+     <DatePickerOverlay>
+       <DatePickerSingleGridPanel
+         helperText={helperText}
+       />
+     </DatePickerOverlay>
+     <DatePickerHelperText>{helperText}</DatePickerHelperText>
+   </DatePicker>
+ </FormField>
```
