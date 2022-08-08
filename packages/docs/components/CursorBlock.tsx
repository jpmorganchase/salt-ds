import { CSSProperties } from "react";

import "./CursorBlock.css";

/* TODO: Add cursor icons */

export const CursorBlock = ({ cursor }: { cursor: string }) => {
  return (
    <>
      <div
        className="CursorBlock-cell"
        style={{ cursor: `var(${cursor})` } as CSSProperties}
      />
      <code className="DocGrid-code">{cursor}</code>
    </>
  );
};
