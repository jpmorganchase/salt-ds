import { Button } from "@salt-ds/core";
import { Input, type InputProps } from "@salt-ds/lab";
import {
  type CSSProperties,
  type ReactNode,
  useReducer,
  useRef,
  useState,
} from "react";

export interface AdjustableFlexboxProps {
  children?: ReactNode;
  containerWidth?: number | string;
  style?: CSSProperties;
  height?: number;
  row?: boolean;
  width?: number;
}

/**
 * Container for testing responsive components - a bit basic, but
 * does the job for now
 */
export const AdjustableFlexbox = ({
  children,
  containerWidth = "auto",
  style,
  height = 300,
  row = false,
  width: widthProp = 600,
}: AdjustableFlexboxProps) => {
  const widthRef = useRef(widthProp);
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const [width, setWidth] = useState(widthProp);
  const handleWidthChange: InputProps["onChange"] = (e, value) => {
    const newValue = Number.parseInt(value);
    widthRef.current = Number.isNaN(newValue) ? 0 : newValue;
    forceUpdate();
  };
  const applyWidth = () => {
    setWidth(widthRef.current);
  };

  const handleKeyDown: InputProps["onKeyDown"] = (e) => {
    if (e.key === "ArrowUp") {
      const amt = e.shiftKey ? 10 : 1;
      widthRef.current = widthRef.current + amt;
      setWidth(widthRef.current);
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      const amt = e.shiftKey ? 10 : 1;
      widthRef.current = widthRef.current - amt;
      setWidth(widthRef.current);
      e.preventDefault();
    }
  };

  return (
    <>
      <div style={{ minWidth: containerWidth }}>
        <Input
          value={`${widthRef.current}`}
          onChange={handleWidthChange}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={applyWidth}>Apply</Button>
        <span style={{ marginLeft: 12 }}>
          Use Up/Down arrow keys to nudge width by 1px&nbsp;&nbsp;&nbsp;(+ SHIFT
          10px)
        </span>
      </div>
      <br />
      <div
        className="Flexbox"
        style={{
          height,
          width,
          ...style,
          flexDirection: row ? "row" : "column",
        }}
      >
        {children}
      </div>
    </>
  );
};
