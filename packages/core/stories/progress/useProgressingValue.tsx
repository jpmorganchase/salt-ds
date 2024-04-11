import { useCallback, useEffect, useState } from "react";

export function useProgressingValue(updateInterval = 100) {
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
