import { useCallback } from "react";

const animationDuration = "0.15s";
// TODO track running transitions, disable running transitions when a new one is triggered
export const useTransition = () => {
  const applyTransition = useCallback(
    (element: HTMLElement, property: string, value: string) => {
      element.style.cssText = `${property}: ${value};transition: ${property} ${animationDuration};`;
    },
    [],
  );

  return {
    applyTransition,
  };
};
