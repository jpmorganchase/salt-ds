import { ReactElement, useState } from "react";
import { CircularProgress, LinearProgress } from "@salt-ds/lab";
import {
  FlexItem,
  FlexLayout,
  FlowLayout,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/core";

export const WithMinVal = (): ReactElement => {
  const [selectedType, setSelectedType] = useState("circular");

  const max = 40;
  const min = 20;
  const value = 30;
  return (
    <FlexLayout direction="column" style={{ height: "100%" }}>
      <h3
        style={{ textAlign: "center" }}
      >{`max = ${max}, min = ${min}, value = ${value}`}</h3>
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
            style={{ height: "100%" }}
          />
        )}
      </FlexItem>
    </FlexLayout>
  );
};
