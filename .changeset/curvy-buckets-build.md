---
"@salt-ds/lab": patch
---

Updated the `NumberInput`'s API as follows:

1. Added `fixedDecimalScale` - a boolean that ensures the value in the `NumberInput` always displays the number of decimals set via `decimalScale` or derived via the `step`, `value` or `defaultValue` props by padding zeros if necessary.
2. Added `onChangeEnd` - a callback that is triggered with the final value of the `NumberInput` after continuous increments/decrements by long-pressing Arrow keys on the keyboard or the buttons. It is also triggered when the `NumberInput` loses focus and when the value is changed.
3. Updated `onChange` callback to always return a numerical value.

Example

```diff
<NumberInput
    defaultValue={10}
    decimalScale={2}
+   fixedDecimalScale={true}
    format={(value) => `${value}%`}
    parse={(value) => {
        return toFloat(String(value).replace(/%/g, ""));
    }}
/>


```
