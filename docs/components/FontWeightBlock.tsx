import { CSSProperties } from "react";
import { ReplacementToken } from "./ReplacementToken";

import "./FontBlock.css";

export const FontWeightBlock = ({
  fontWeight,
  replacementToken,
}: {
  fontWeight: string;
  replacementToken?: string;
}) => {
  return (
    <>
      <div
        className="FontBlock-cell"
        style={{ fontWeight: `var(${fontWeight})` } as CSSProperties}
      >
        T
      </div>
      <code className="DocGrid-code">{fontWeight}</code>
      {replacementToken && (
        <ReplacementToken replacementToken={replacementToken} />
      )}
    </>
  );
};
