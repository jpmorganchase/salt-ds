---
"@salt-ds/lab": patch
---

Updated the `NumberInput` API:

1. Simplified `format`, previously took `string` or `number` value, now receives value as a `string` and returns a `string`.
   Used to render the final value before render.

```diff
- format?: (value: number | string) => string | number;
+ format?: (value: string) => string;
```

2. Added `isAllowed`, a callback that matches as you type and determines whether the value can be ignored. By default, signed numeric decimal numbers can be entered.
3. Simplified `onChange`, reverted back to native `onChange`. Called for any text change to the input by the user.

```diff
- onChange?: (event: SyntheticEvent | undefined, value: number | string) => void;
+ onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
```

5. Added `onNumberChange`, a callback called when the number value changes, due to increment/decrement or `onBlur`.

```
  onNumberChange?: (value: number | null) => void;
```

6. Simplified `parse`, is now parsed a string form of the current value and returns either a `number`, `NaN` or `null` if empty.

```diff
- parse?: (value: number | string) => string | number;
+ parse?: (value: string) => number | null;
```

Example

```diff
<NumberInput
   defaultValue={12}
   isAllowed={(inputValue) =>
     /^\$?(\d+(\.\d*)?|\.\d+)?%?$/.test(inputValue)
   }
   format={(value) => `£${value.replace(/\$/g, "")}`}
   parse={(value) => {
     if (!value.length) {
       return null;
     }
     const parsedValue = value.replace(/\$/g, "");
     return Number.parseFloat(parsedValue);
   }}
   onNumberChange={(newValue) => {
     console.log(`Number changed to ${newValue}`);
   }}
/>
```
