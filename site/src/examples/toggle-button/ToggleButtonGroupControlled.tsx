import { ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import { useState } from "react";

export const ToggleButtonGroupControlled = () => {
  const [selected, setSelected] = useState("sell");

  return (
    <ToggleButtonGroup
      value={selected}
      onChange={(event) => setSelected(event.currentTarget.value)}
    >
      <ToggleButton value="buy">Buy</ToggleButton>
      <ToggleButton value="sell">Sell</ToggleButton>
      <ToggleButton value="hold">Hold</ToggleButton>
      <ToggleButton value="review">Review</ToggleButton>
    </ToggleButtonGroup>
  );
};
