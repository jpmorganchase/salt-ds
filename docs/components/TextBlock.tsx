import type { CSSProperties } from "react";

import "./TextBlock.css";

export const TextBlock = ({
  fontSize,
  fontStyle,
  fontWeight,
  lineHeight,
  fontFamily,
}: {
  fontSize?: string;
  fontStyle?: string;
  fontWeight?: string;
  lineHeight?: string;
  fontFamily?: string;
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
            fontFamily: `var(${fontFamily})`,
          } as CSSProperties
        }
      >
        The quick brown fox jumps over the lazy dog
      </div>
    </>
  );
};
