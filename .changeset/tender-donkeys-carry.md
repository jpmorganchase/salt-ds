---
"@salt-ds/core": minor
---

Promote updated `Slider` and `RangeSlider` components to core. The update includes:

- Improved accessibility and focus behavior.
- Enhanced API for slider customization, including options like `marks`, `showTicks`, and `showTooltip`.
- Fixed touch interactions on mobile to allow dragging of the slider thumb without horizontal screen scrolling.
- Set the default `max` value of the `Slider` and `RangeSlider` as 100 to be consistent with the HTML specification.

```tsx
<Slider
  min={0}
  max={30}
  defaultValue={15}
  marks={[
    { value: 0, label: "Minimum" },
    { value: 30, label: "Maximum" },
  ]}
  showTicks={true}
/>
```

```tsx
<RangeSlider
  min={0}
  max={30}
  defaultValue={15}
  marks={[
    { value: 0, label: "0" },
    { value: 10, label: "10" },
    { value: 15, label: "15" },
    { value: 19, label: "19" },
    { value: 30, label: "30" },
  ]}
  showTicks={true}
  minLabel="Very low"
  maxLabel="Very high"
  restrictToMarks={true}
/>
```
