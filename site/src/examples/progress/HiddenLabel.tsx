import { ReactElement, useState } from "react";
import {
  FlexItem,
  FlexLayout,
  FlowLayout,
  RadioButton,
  RadioButtonGroup,
  CircularProgress,
  LinearProgress,
} from "@salt-ds/core";

export const HiddenLabel = (): ReactElement => {
  const [selectedType, setSelectedType] = useState("circular");

  return (
    <FlexLayout direction="column" style={{ height: "100%" }}>
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
          <CircularProgress aria-label="Download" value={38} hideLabel />
        )}
        {selectedType === "linear" && (
          <LinearProgress aria-label="Download" value={38} hideLabel />
        )}
      </FlexItem>
    </FlexLayout>
  );
};
