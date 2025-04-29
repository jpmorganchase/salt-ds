import { FlowLayout, ToggleButton } from "@salt-ds/core";
import { useState, type ReactElement } from "react";

export const TextOnly = (): ReactElement => {
  const [selected, setSelected] = useState(false);

  return (
    <FlowLayout>
      <ToggleButton value="pin">Pin</ToggleButton>
      <ToggleButton
        onChange={() => setSelected(!selected)}
        value={selected ? "unlocked" : "locked"}
      >
        {selected ? "Unlock" : "Lock"}
      </ToggleButton>
    </FlowLayout>
  );
};
