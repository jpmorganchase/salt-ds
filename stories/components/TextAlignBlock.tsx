import type { CSSProperties } from "react";

import "./TextAlignBlock.css";

export const TextAlignBlock = ({ textAlign }: { textAlign: string }) => {
  return (
    <>
      <div
        className="TextAlignBlock-cell"
        style={{ textAlign: `var(${textAlign})` } as CSSProperties}
      >
        T
      </div>
      <code className="DocGrid-code">{textAlign}</code>
    </>
  );
};
