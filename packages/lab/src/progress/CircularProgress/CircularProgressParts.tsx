import React, { CSSProperties } from "react";
import "./CircularProgress.css";

export const SIZE = 44;

export const circularGradientId = "uitk-circular-progress-gradient";

export const ViewBox: React.FC = (props) => {
  return (
    <svg
      className="uitkCircularProgress-svg"
      viewBox={`${SIZE / 2} ${SIZE / 2} ${SIZE} ${SIZE}`}
    >
      {props.children}
    </svg>
  );
};

export const LinearGradient: React.FC = () => (
  <defs>
    <linearGradient gradientTransform="rotate(90)" id={circularGradientId}>
      <stop className="uitkCircularProgress-gradientStart" offset="0%" />
      <stop className="uitkCircularProgress-gradientStop" offset="100%" />
    </linearGradient>
  </defs>
);

export interface CircleProps {
  strokeWidth: number;
  style?: CSSProperties;
  className?: string;
}

export const Circle: React.FC<CircleProps> = ({
  strokeWidth,
  style,
  className,
}) => {
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
