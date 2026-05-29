import { Slider, Text, useId } from "@salt-ds/core";
import { type ReactNode, useState } from "react";
import styles from "./ResizableExample.module.css";

interface ResizableExampleProps {
  children: ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  label?: string;
}

export const ResizableExample = ({
  children,
  defaultWidth = 100,
  minWidth = 25,
  maxWidth = 100,
  label = "Container width",
}: ResizableExampleProps) => {
  const labelId = useId();
  const [width, setWidth] = useState(defaultWidth);
  return (
    <div className={styles.root}>
      <div className={styles.control}>
        <Text id={labelId} styleAs="label">
          {label}
        </Text>
        <Slider
          aria-labelledby={labelId}
          min={minWidth}
          max={maxWidth}
          value={width}
          minLabel={`${minWidth}%`}
          maxLabel={`${maxWidth}%`}
          format={(value) => `${value}%`}
          onChange={(_, value) => setWidth(value)}
        />
      </div>
      <div className={styles.preview} style={{ inlineSize: `${width}%` }}>
        {children}
      </div>
    </div>
  );
};
