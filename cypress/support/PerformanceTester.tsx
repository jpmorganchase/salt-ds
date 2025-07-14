import {
  Profiler,
  type ProfilerOnRenderCallback,
  type PropsWithChildren,
  useRef,
} from "react";

export type PerformanceResult = {
  renderCount: number;
  renderTime: number;
};

export function PerformanceTester({
  children,
  onRender,
}: PropsWithChildren<{ onRender: (results: PerformanceResult) => void }>) {
  const cumulativeDuration = useRef(0);
  const renderCount = useRef(0);

  const handleRender: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
  ) => {
    if (phase === "mount") {
      cumulativeDuration.current = 0;
      renderCount.current = 0;
    }

    renderCount.current = renderCount.current + 1;
    cumulativeDuration.current = Number(
      (cumulativeDuration.current + actualDuration).toFixed(2),
    );

    onRender?.({
      renderCount: renderCount.current,
      renderTime: cumulativeDuration.current,
    });
  };

  return (
    // biome-ignore lint/nursery/useUniqueElementIds: Profiler needs a static id
    <Profiler id="performanceTest" onRender={handleRender}>
      {children}
    </Profiler>
  );
}
