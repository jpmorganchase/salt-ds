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
    setIsProgressing(false);
  }, []);
  const handleStart = () => {
    setIsProgressing(true);
  };

  const handleReset = () => {
    setBufferValue(0);
    setIsProgressing(false);
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
    [bufferValue]
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
    <FlexLayout direction="column" align="center" style={{ height: "100%" }}>
      <FlowLayout justify="center" gap={1}>
        <Button disabled={isProgressing} onClick={handleStart}>
          Start
        </Button>
        <Button disabled={!isProgressing} onClick={handleStop}>
          Stop
        </Button>
        <Button onClick={handleReset}>Reset</Button>
      </FlowLayout>

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
          <CircularProgress aria-label="Download" bufferValue={bufferValue} />
        )}
        {selectedType === "linear" && (
          <LinearProgress aria-label="Download" bufferValue={bufferValue} />
        )}
      </FlexItem>
    </FlexLayout>
  );
};
