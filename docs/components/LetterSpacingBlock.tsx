import { CSSProperties } from "react";

import "./LetterSpacingBlock.css";

export const LetterSpacingBlock = ({
  letterSpacing,
  hideToken,
}: {
  letterSpacing: string;
  hideToken?: boolean;
}) => {
  return (
    <>
      <div
        className="LetterSpacingBlock-cell"
        style={{ letterSpacing: `var(${letterSpacing})` } as CSSProperties}
      >
        abc
      </div>
      {!hideToken && <code className="DocGrid-code">{letterSpacing}</code>}
    </>
  );
};
