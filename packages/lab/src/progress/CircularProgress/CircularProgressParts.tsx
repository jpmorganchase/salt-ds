import { CSSProperties, ReactNode } from "react";
import "./CircularProgress.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import circularProgressCSS from "./CircularProgress.css";

export const SIZE = 44;

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
      viewBox={`${SIZE / 2} ${SIZE / 2} ${SIZE} ${SIZE}`}
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
  strokeWidth: number;
  style?: CSSProperties;
  className?: string;
}

export const Circle = ({ strokeWidth, style, className }: CircleProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-circular-progress",
    css: circularProgressCSS,
    window: targetWindow,
  });

  return (
    <circle
      cx={SIZE}
      cy={SIZE}
      fill="none"
      r={(SIZE - strokeWidth) / 2}
      strokeWidth={strokeWidth}
      style={style}
      className={className}
    />
  );
};
