import {
  CircularProgress,
  FlexItem,
  FlexLayout,
  FlowLayout,
  H3,
  LinearProgress,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const WithMaxVal = (): ReactElement => {
  const [selectedType, setSelectedType] = useState("circular");

  return (
    <FlexLayout direction="column" align="center" style={{ height: "100%" }}>
      <H3> max = 500, value = 250</H3>
      <FlowLayout justify="center" gap={1}>
        <RadioButtonGroup
          direction="horizontal"
          value={selectedType}
          aria-label="Progress type control"
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <RadioButton label="Circular" value="circular" />
          <RadioButton label="Linear" value="linear" />
        </RadioButtonGroup>
      </FlowLayout>

      <FlexItem style={{ margin: "auto" }}>
        {selectedType === "circular" && (
          <CircularProgress aria-label="Download" value={250} max={500} />
        )}
        {selectedType === "linear" && (
          <LinearProgress aria-label="Download" value={250} max={500} />
        )}
      </FlexItem>
    </FlexLayout>
  );
};
