import { ReactElement, useState } from "react";
import { CircularProgress, LinearProgress } from "@salt-ds/lab";
import {
  Button,
  FlexItem,
  FlexLayout,
  FlowLayout,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/core";
import { useProgressingValue } from "./useProgressingValue";

export const WithProgVal = (): ReactElement => {
  const { handleReset, handleStart, handleStop, isProgressing, value } =
    useProgressingValue();
  const [selectedType, setSelectedType] = useState("circular");

  return (
    <FlexLayout direction="column" style={{ height: "100%" }}>
      <FlexItem>
        <FlowLayout justify="center" className="controls" gap={1}>
          <Button disabled={isProgressing} onClick={handleStart}>
            Start
          </Button>
          <Button disabled={!isProgressing} onClick={handleStop}>
            Stop
          </Button>
          <Button onClick={handleReset}>Reset</Button>
        </FlowLayout>
      </FlexItem>

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
          <CircularProgress aria-label="Download" value={value} />
        )}
        {selectedType === "linear" && (
          <LinearProgress
            aria-label="Download"
            value={value}
            style={{ height: "100%" }}
          />
        )}
      </FlexItem>
    </FlexLayout>
  );
};
