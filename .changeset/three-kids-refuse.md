---
"@salt-ds/lab": minor
---

`InputNext`: `InputProps` interface changed to extend `Omit<ComponentPropsWithoutRef<"div">,"defaultValue">, Pick<ComponentPropsWithoutRef<"input">, "disabled" | "value" | "defaultValue">`

`ref` prop moved to target container div: for direct ref on input component, use new `inputRef` prop
