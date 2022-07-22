import { useGridContext } from "../GridContext";
import { useCallback, useRef } from "react";

export function useAutoscroll() {
  const stateRef = useRef<{
    removeEvents: () => void;
    screenX: number;
    screenY: number;
  }>();
  const { model } = useGridContext();

  const stopAutoscroll = useCallback(() => {
    stateRef.current?.removeEvents();
    stateRef.current = undefined;
    // TODO
  }, []);

  const onMouseMove = useCallback((event: MouseEvent) => {
    // TODO
  }, []);

  const startAutoscroll = useCallback(
    (rootElement: HTMLDivElement, screenX: number, screenY: number) => {
      document.addEventListener("mousemove", onMouseMove);

      // const clientRect = rootElement.getBoundingClientRect();

      // stateRef.current = {
      //   removeEvents: () => {
      //     document.addEventListener("mousemove", onMouseMove);
      //   },
      // };
    },
    []
  );

  return {
    startAutoscroll,
    stopAutoscroll,
  };
}
