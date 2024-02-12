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

export const WithMaxVal = (): ReactElement => {
  const [selectedType, setSelectedType] = useState("circular");

  return (
    <FlexLayout direction="column" style={{ height: "100%" }}>
      <H3 style={{ textAlign: "center" }}> max = 500, value = 250</H3>
      <FlexItem>
        <FlowLayout justify="center" className="controls" gap={1}>
          <RadioButtonGroup direction="horizontal" defaultChecked>
            <RadioButton
              key="circular"
              label="Circular"
              value="circular"
              checked
              onChange={() => setSelectedType("circular")}
            />
            <RadioButton
              key="linear"
              label="Linear"
              value="linear"
              onChange={() => setSelectedType("linear")}
            />
          </RadioButtonGroup>
        </FlowLayout>
      </FlexItem>

      <FlexItem align="center" grow={1}>
        {selectedType === "circular" && (
          <CircularProgress aria-label="Download" value={250} max={500} />
        )}
        {selectedType === "linear" && (
          <LinearProgress
            aria-label="Download"
            value={250}
            max={500}
            style={{ height: "100%" }}
          />
        )}
      </FlexItem>
    </FlexLayout>
  );
};
