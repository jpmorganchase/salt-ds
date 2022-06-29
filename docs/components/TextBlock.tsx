/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { CSSProperties } from "react";

import "./TextBlock.css";

interface TextBlockProps {
  fontSize?: string;
  fontStyle?: string;
  fontWeight?: string;
  lineHeight?: string;
  fontFamily?: string;
  textDecoration?: string;
  color?: string;
  textAlign?: string;
  textTransform?: string;
}

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
}: TextBlockProps) => {
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
          } as unknown as CSSProperties
        }
      >
        The quick brown fox jumps over the lazy dog
      </div>
    </>
  );
};
