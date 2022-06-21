import type { CSSProperties } from "react";

import "./TextBlock.css";

export const TextBlock = ({
  fontSize,
  fontStyle,
  fontWeight,
  lineHeight,
  fontFamily,
  textDecoration,
  color,
  textAlign,
  textTransform,
}: {
  fontSize?: string;
  fontStyle?: string;
  fontWeight?: string;
  lineHeight?: string;
  fontFamily?: string;
  textDecoration?: string;
  color?: string;
  textAlign?: string;
  textTransform?: string;
}) => {
  return (
    <>
      <div
        className="TextBlock"
        style={
          {
            color: `var(${color})`,
            textDecoration: `var(${textDecoration})`,
            fontSize: `var(${fontSize})`,
            fontWeight: `var(${fontWeight})`,
            lineHeight: `var(${lineHeight})`,
            fontStyle: `var(${fontStyle})`,
            fontFamily: `var(${fontFamily})`,
            textAlign: `var(${textAlign})`,
            textTransform: `var(${textTransform})`,
          } as CSSProperties
        }
      >
        The quick brown fox jumps over the lazy dog
      </div>
    </>
  );
};
