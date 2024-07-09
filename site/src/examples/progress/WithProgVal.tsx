import {
  Button,
  CircularProgress,
  FlexItem,
  FlowLayout,
  LinearProgress,
  StackLayout,
} from "@salt-ds/core";
import { type ReactElement, useCallback, useEffect, useState } from "react";

function useProgressingValue(updateInterval = 100) {
  const [value, setValue] = useState(0);
  const [isProgressing, setIsProgressing] = useState(false);

  const handleStop = useCallback(() => {
    setIsProgressing(false);
  }, []);
  const handleStart = () => {
    setIsProgressing(true);
  };

  const handleReset = () => {
    setValue(0);
    setIsProgressing(false);
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
    [handleStop, value],
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
        <CircularProgress aria-label="Download" value={value} />
      </FlexItem>
      <FlexItem>
        <LinearProgress aria-label="Download" value={value} />
      </FlexItem>
    </StackLayout>
  );
};
