import { Slider } from "@salt-ds/lab";

export const WithHiddenTooltip = () => (
  <Slider
    aria-label="With hidden tooltip"
    min={0}
    max={50}
    defaultValue={30}
    style={{ width: "80%" }}
    showTooltip={false}
    minLabel="Low"
    maxLabel="High"
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
