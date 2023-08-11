---
"@salt-ds/lab": minor
---

Added ComboBox component to labs

Combo Box helps users select an item from a large list of options without scrolling. The typeahead functionality makes this selection quicker, easier, and reduces errors.
Users can see a list of available options when they click on the component and filter the list as they type. Once they’ve made their selection, it populates the field and the overlay list closes.

```

const handleChange = (event: SyntheticEvent, data: { value: string }) => {
console.log("input value changed", data);
};

const handleSelect = (event: SyntheticEvent<HTMLInputElement>) => {
console.log("selected item", event.currentTarget.value);
};
return (
<ComboBoxNext onInputChange={handleInputChange} onSelect={handleSelect} source={['Option 1','Option 2','Option 3']} />
);

```
