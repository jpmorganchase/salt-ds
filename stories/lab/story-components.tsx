import { FC, CSSProperties, useRef, useState, useReducer } from "react";
import { Input, InputProps } from "@brandname/lab";
import { Button } from "@brandname/core";

export interface FlexboxProps {
  style?: CSSProperties;
  height?: number;
  row?: boolean;
  width?: number;
}

/**
 * Container for testing responsive components - a bit basic, but
 * does the job for now
 */
export const AdjustableFlexbox: FC<FlexboxProps> = ({
  children,
  style,
  height = 300,
  row = false,
  width: widthProp = 600,
}) => {
  const widthRef = useRef(widthProp);
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const [width, setWidth] = useState(widthProp);
  const handleWidthChange: InputProps["onChange"] = (e, value) => {
    const newValue = parseInt(value);
    widthRef.current = isNaN(newValue) ? 0 : newValue;
    forceUpdate();
  };
  const applyWidth = () => {
    setWidth(widthRef.current);
  };

  const handleKeyDown: InputProps["onKeyDown"] = (e) => {
    if (e.key === "ArrowUp") {
      const amt = e.shiftKey ? 10 : 1;
      setWidth((widthRef.current = widthRef.current + amt));
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      const amt = e.shiftKey ? 10 : 1;
      setWidth((widthRef.current = widthRef.current - amt));
      e.preventDefault();
    }
  };

  return (
    <>
      <div>
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
