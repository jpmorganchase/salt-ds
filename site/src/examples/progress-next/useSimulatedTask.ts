import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Runs a fake task: its size is unknown for `sizeUnknownFor` ms, then it fills over `duration` ms, then it calls
 * `onComplete`.
 */
export function useSimulatedTask({
  duration = 4000,
  sizeUnknownFor = 0,
  onComplete,
}: {
  duration?: number;
  sizeUnknownFor?: number;
  onComplete?: () => void;
} = {}) {
  const [running, setRunning] = useState(false);
  const [value, setValue] = useState<number | undefined>(undefined);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = useCallback(() => {
    for (const timer of timers.current) clearTimeout(timer);
    timers.current = [];
  }, []);

  useEffect(() => clear, [clear]);

  const start = () => {
    clear();
    setRunning(true);
    setValue(undefined);
    const steps = 20;
    for (let step = 0; step <= steps; step++) {
      timers.current.push(
        setTimeout(
          () => {
            setValue((step / steps) * 100);
            if (step === steps) {
              setRunning(false);
              onComplete?.();
            }
          },
          sizeUnknownFor + (duration / steps) * step,
        ),
      );
    }
  };

  const reset = () => {
    clear();
    setRunning(false);
    setValue(undefined);
  };

  return { running, value, start, reset };
}
