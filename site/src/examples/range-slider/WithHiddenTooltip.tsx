import { RangeSlider } from "@salt-ds/lab";

export const WithHiddenTooltip = () => (
  <RangeSlider
    aria-label="single"
    min={0}
    max={50}
    defaultValue={[20, 40]}
    style={{ width: "600px" }}
    showTooltip={false}
    minLabel="Very low"
    maxLabel="Very high"
    step={10}
    marks={[
      {
        value: 0,
        label: "0",
      },
      {
        value: 10,
        label: "10",
      },
      {
        value: 20,
        label: "20",
      },
      {
        value: 30,
        label: "30",
      },
      {
        value: 40,
        label: "40",
      },
      {
        value: 50,
        label: "50",
      },
    ]}
  />
);
