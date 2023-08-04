import { CSSProperties } from "react";

import "./CursorBlock.css";

/* TODO: Add cursor icons */

export const CursorBlock = ({
  cursor,
  hideToken,
}: {
  cursor: string;
  hideToken?: boolean;
}) => {
  return (
    <>
      <div
        className="CursorBlock-cell"
        style={{ cursor: `var(${cursor})` } as CSSProperties}
      />
      {!hideToken && <code className="DocGrid-code">{cursor}</code>}
    </>
  );
};
