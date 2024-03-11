import { ReactElement, useState, useEffect, useCallback } from "react";
import {
  Button,
  FlexItem,
  FlexLayout,
  FlowLayout,
  RadioButton,
  RadioButtonGroup,
  CircularProgress,
  LinearProgress,
} from "@salt-ds/core";

function useProgressingValue(updateInterval = 100) {
  const [bufferValue, setBufferValue] = useState(0);
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
    setBufferValue(0);
    handleStop();
  };

  useEffect(() => {
    if (isProgressing) {
      const id = setInterval(() => {
        setBufferValue((preValue) => preValue + 1);
      }, updateInterval);

      return () => {
        clearInterval(id);
      };
    }
    return;
  }, [isProgressing, updateInterval]);

  useEffect(
    function stopWhenComplete() {
      if (bufferValue === 100) {
        handleStop();
      }
    },
    [handleStop, bufferValue]
  );

  return {
    handleReset,
    handleStart,
    handleStop,
    isProgressing,
    bufferValue,
  };
}

export const WithProgBufferVal = (): ReactElement => {
  const { handleReset, handleStart, handleStop, isProgressing, bufferValue } =
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
          <CircularProgress aria-label="Download" bufferValue={bufferValue} />
        )}
        {selectedType === "linear" && (
          <LinearProgress
            aria-label="Download"
            bufferValue={bufferValue}
            style={{ height: "100%" }}
          />
        )}
      </FlexItem>
    </FlexLayout>
  );
};
