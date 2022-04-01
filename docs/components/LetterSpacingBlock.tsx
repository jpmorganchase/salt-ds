import { CSSProperties } from "react";

import "./LetterSpacingBlock.css";

export const LetterSpacingBlock = ({
  letterSpacing,
}: {
  letterSpacing: string;
}) => {
  return (
    <>
      <div
        className="LetterSpacingBlock-cell"
        style={{ letterSpacing: `var(${letterSpacing})` } as CSSProperties}
      >
        abc
      </div>
      <code className="DocGrid-code">{letterSpacing}</code>
    </>
  );
};
