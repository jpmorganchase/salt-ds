---
"@salt-ds/lab": patch
---

Updated the `NumberInput`'s API as follows:

1. Added `isAllowed` - a callback that returns a boolean which determines if the value entered in the `NumberInput` is valid or not. This can be used in conjunction with the `format` and `parse` callbacks to support complex formatting by allowing users to input special characters or patterns, which by default are not permitted.
2. Added `fixedDecimalScale` - a boolean that ensures the value in the `NumberInput` always displays the number of decimals set via `decimalScale` or derived via the `step`, `value` or `defaultValue` props by padding zeros if necessary.
3. Added `onChangeEnd` - a callback that is triggered with the final value of the `NumberInput` after continuous increments/decrements by long-pressing Arrow keys on the keyboard or the buttons. It is also triggered when the `NumberInput` loses focus and when the value is changed.
4. Updated `onChange` callback to always return a numerical value.

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
+   isAllowed={(value) => {
+    const validPatternRegex = /^\d*(\.\d*)?%?$/; //Allow users to type values in the format '<X>%'
+    return validPatternRegex.test(value);
    }}
/>


```
