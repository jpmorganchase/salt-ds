---
"@salt-ds/lab": patch
---

- Exposed input values in dateInput's `onChange`.

  ```tsx
  <DatePicker onChange={(event, selectedDateInputValue: string | undefined) => {}}/>

   <DatePicker selectionVariant="range"
    onChange={(event, startDateInputValue: string | undefined, endDateInputValue: string | undefined) => {}}
  />
  ```

- Removed `startDate`, `defaultStartDate`, `endDate`, and `defaultEndDate` in DatePicker.
- Added `selectedDate`, `defaultSelectedDate` and `defaultOpen` in DatePicker.
