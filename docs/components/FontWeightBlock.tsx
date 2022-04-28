import { CSSProperties } from "react";

import "./FontBlock.css";

export const FontWeightBlock = ({ fontWeight }: { fontWeight: string }) => {
  return (
    <>
      <div
        className="FontBlock-cell"
        style={{ fontWeight: `var(${fontWeight})` } as CSSProperties}
      >
        T
      </div>
      <code className="DocGrid-code">{fontWeight}</code>
    </>
  );
};
