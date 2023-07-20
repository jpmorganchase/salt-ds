import { CSSProperties } from "react";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import circularProgressCSS from "./CircularProgress.css";

export const circularGradientId = "salt-circular-progress-gradient";
export interface CircleProps {
  style?: CSSProperties;
  className?: string;
}

export const Circle = ({ style, className }: CircleProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-circular-progress",
    css: circularProgressCSS,
    window: targetWindow,
  });

  return (
    <circle cx="50%" cy="50%" fill="none" style={style} className={className} />
  );
};
