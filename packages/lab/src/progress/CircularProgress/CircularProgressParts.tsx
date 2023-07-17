import { CSSProperties, ReactNode } from "react";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import circularProgressCSS from "./CircularProgress.css";

export const circularGradientId = "salt-circular-progress-gradient";

export const ViewBox = (props: { children?: ReactNode }) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-circular-progress",
    css: circularProgressCSS,
    window: targetWindow,
  });

  return (
    <svg
      className="saltCircularProgress-svg"
    >
      {props.children}
    </svg>
  );
};

export const LinearGradient = () => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-circular-progress",
    css: circularProgressCSS,
    window: targetWindow,
  });

  return (
    <defs>
      <linearGradient gradientTransform="rotate(90)" id={circularGradientId}>
        <stop className="saltCircularProgress-gradientStart" offset="0%" />
        <stop className="saltCircularProgress-gradientStop" offset="100%" />
      </linearGradient>
    </defs>
  );
};

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
    <circle
      cx="50%"
      cy="50%"
      fill="none"
      style={style}
      className={className}
    />
  );
};
