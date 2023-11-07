import { ReactElement, useState, useEffect, useCallback } from "react";
import { CircularProgress, LinearProgress } from "@salt-ds/lab";
import {
  Button,
  FlexItem,
  FlexLayout,
  FlowLayout,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/core";

function useProgressingValue(updateInterval = 100) {
  const [value, setValue] = useState(0);
  const [isProgressing, setIsProgressing] = useState(false);

  const handleStop = useCallback(() => {
    if (isProgressing) {
      setIsProgressing(false);
    }
  }, [isProgressing]);

  const handleStart = () => {
    if (!isProgressing) {
      setIsProgressing(true);
    }
  };

  const handleReset = () => {
    setValue(0);
    handleStop();
  };

  useEffect(() => {
    if (isProgressing) {
      const id = setInterval(() => {
        setValue((preValue) => preValue + 1);
      }, updateInterval);

      return () => {
        clearInterval(id);
      };
    }
    return;
  }, [isProgressing, updateInterval]);

  useEffect(
    function stopWhenComplete() {
      if (value === 100) {
        handleStop();
      }
    },
    [handleStop, value]
  );

  return {
    handleReset,
    handleStart,
    handleStop,
    isProgressing,
    value,
  };
}

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
