import { Tooltip } from "@salt-ds/core";
import { clsx } from "clsx";
import { ReplacementToken } from "./ReplacementToken";

import "./OpacityBlock.css";

export const OpacityBlock = ({
  opacity,
  cssVariable,
  className,
  replacementToken,
}: {
  opacity: string;
  className?: string;
  cssVariable: string;
  replacementToken?: string;
}) => (
  <>
    <div className={clsx("OpacityBlock-cell")}>
      <Tooltip placement="left" content={opacity}>
        <div
          className={clsx("OpacityBlock-cellInner", className)}
          style={{ background: `rgba(36, 37, 38, var(${opacity}))` }}
        />
      </Tooltip>
    </div>
    <code className="DocGrid-code">{cssVariable}</code>
    {replacementToken ? (
      <ReplacementToken replacementToken={replacementToken} />
    ) : (
      ""
    )}
  </>
);
