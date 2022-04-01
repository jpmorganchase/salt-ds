import type { CSSProperties } from "react";

import "./TextBlock.css";

export const TextBlock = ({
  fontSize,
  fontStyle,
  fontWeight,
  lineHeight,
}: {
  fontSize?: string;
  fontStyle?: string;
  fontWeight?: string;
  lineHeight?: string;
}) => {
  return (
    <>
      <div
        className="TextBlock"
        style={
          {
            fontSize: `var(${fontSize})`,
            fontWeight: `var(${fontWeight})`,
            lineHeight: `var(${lineHeight})`,
            fontStyle: `var(${fontStyle})`,
          } as CSSProperties
        }
      >
        The quick brown fox jumps over the lazy dog
      </div>
    </>
  );
};
