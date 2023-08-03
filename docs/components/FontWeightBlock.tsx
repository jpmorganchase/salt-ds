import { CSSProperties } from "react";
import { ReplacementToken } from "./ReplacementToken";

import "./FontBlock.css";

export const FontWeightBlock = ({
  fontWeight,
  replacementToken,
  hideToken,
}: {
  fontWeight: string;
  replacementToken?: string;
  hideToken?: boolean;
}) => {
  return (
    <>
      <div
        className="FontBlock-cell"
        style={{ fontWeight: `var(${fontWeight})` } as CSSProperties}
      >
        T
      </div>
      {!hideToken && <code className="DocGrid-code">{fontWeight}</code>}
      {replacementToken && (
        <ReplacementToken replacementToken={replacementToken} />
      )}
    </>
  );
};
