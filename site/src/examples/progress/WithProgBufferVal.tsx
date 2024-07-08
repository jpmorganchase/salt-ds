import {
  Button,
  CircularProgress,
  FlexItem,
  FlowLayout,
  LinearProgress,
  StackLayout,
} from "@salt-ds/core";
import { ReactElement, useCallback, useEffect, useState } from "react";

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
    [bufferValue, handleStop]
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

  return (
    <StackLayout align="center">
      <FlowLayout justify="center" gap={1}>
        <Button disabled={isProgressing} onClick={handleStart}>
          Start
        </Button>
        <Button disabled={!isProgressing} onClick={handleStop}>
          Stop
        </Button>
        <Button onClick={handleReset}>Reset</Button>
      </FlowLayout>

      <FlexItem>
        <CircularProgress aria-label="Download" bufferValue={bufferValue} />
      </FlexItem>
      <FlexItem>
        <LinearProgress aria-label="Download" bufferValue={bufferValue} />
      </FlexItem>
    </StackLayout>
  );
};
