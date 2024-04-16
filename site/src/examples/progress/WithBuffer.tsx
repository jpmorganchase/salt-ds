import { ReactElement, useState } from "react";
import {
  FlexItem,
  FlexLayout,
  FlowLayout,
  H3,
  RadioButton,
  RadioButtonGroup,
  CircularProgress,
  LinearProgress,
} from "@salt-ds/core";

export const WithBuffer = (): ReactElement => {
  const [selectedType, setSelectedType] = useState("circular");

  return (
    <FlexLayout direction="column" align="center" style={{ height: "100%" }}>
      <H3> value = 38, buffer value = 60</H3>
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
          <CircularProgress aria-label="Download" value={38} bufferValue={60} />
        )}
        {selectedType === "linear" && (
          <LinearProgress aria-label="Download" value={38} bufferValue={60} />
        )}
      </FlexItem>
    </FlexLayout>
  );
};
