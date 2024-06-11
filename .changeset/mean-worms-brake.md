---
"@salt-ds/lab": patch
---

- Exposed start and end input values in date input `onChange` picker.

  ```tsx
  <DatePicker
    onChange={(event, start: string | undefined, end: string | undefined) => {}}
  />
  ```

- Removed `startDate`, `defaultStartDate`, `endDate`, and `defaultEndDate` in DatePicker.
- Added `selectedDate`, `defaultSelectedDate` in DatePicker.
