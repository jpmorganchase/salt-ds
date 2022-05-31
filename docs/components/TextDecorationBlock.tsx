import type { CSSProperties } from "react";

import "./TextDecorationBlock.css";

export const TextDecorationBlock = ({
  textDecoration,
}: {
  textDecoration: string;
}) => {
  return (
    <>
      <div
        className="TextAlignBlock-cell"
        style={{
          textDecoration:
            `var(${textDecoration})` as CSSProperties["textAlign"],
        }}
      >
        T
      </div>
      <code className="DocGrid-code">{textDecoration}</code>
    </>
  );
};
