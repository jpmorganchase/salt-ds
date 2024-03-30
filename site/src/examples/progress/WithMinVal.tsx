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

export const WithMinVal = (): ReactElement => {
  const [selectedType, setSelectedType] = useState("circular");

  const max = 40;
  const min = 20;
  const value = 30;
  return (
    <FlexLayout direction="column" align="center" style={{ height: "100%" }}>
      <H3>{`max = ${max}, min = ${min}, value = ${value}`}</H3>
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
          <CircularProgress
            aria-label="Download"
            value={value}
            min={min}
            max={max}
          />
        )}
        {selectedType === "linear" && (
          <LinearProgress
            aria-label="Download"
            value={value}
            min={min}
            max={max}
          />
        )}
      </FlexItem>
    </FlexLayout>
  );
};
