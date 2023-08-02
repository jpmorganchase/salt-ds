---
"@salt-ds/lab": patch
---

Updated Switch's styling
Refactored Switch and updated its change handler.

```diff
- const Controlled: ComponentStory<typeof Switch> = (args) => {
-   const [checked, setChecked] = useState(false);
-
-   const handleChange = (
-     _: ChangeEvent<HTMLInputElement>,
-     isChecked: boolean
-   ) => {
-     setChecked(isChecked);
-   };
-
-   return <Switch {...args} checked={checked} onChange={handleChange} />;
- };
+ const Controlled: ComponentStory<typeof Switch> = (args) => {
+   const [checked, setChecked] = useState(false);
+
+   const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
+     setChecked(event.target.checked);
+   };
+
+   return <Switch {...args} checked={checked} onChange={handleChange} />;
+ };
```
