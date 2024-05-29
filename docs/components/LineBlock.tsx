import { ReactNode } from "react";
import { ReplacementToken } from "./ReplacementToken";

import "./LineBlock.css";

export const LineBlockCell = () => {
  return (
    <div className="LineBlock-cell">
      <svg viewBox="0 0 16 16" className="LineBlock-svg">
        <path d="M 0,8 L 16,8" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};

export const LineBlockCode = ({ children }: { children: ReactNode }) => {
  return <code className="DocGrid-code">{children}</code>;
};

export const LineBlock = ({
  token,
  lineWidth,
  lineStyle,
  replacementToken,
  hideToken,
}: {
  token: string;
  lineWidth?: string;
  lineStyle?: string;
  replacementToken?: string;
  hideToken?: boolean;
}) => {
  return (
    <>
      <div className="LineBlock-cell">
        <svg viewBox="0 0 16 16" className="LineBlock-svg">
          <path
            d="M 0,8 L 16,8"
            vectorEffect="non-scaling-stroke"
            strokeWidth={lineWidth ? `var(${lineWidth})` : "1px"}
            strokeDasharray={
              lineStyle === "dashed"
                ? "10,10"
                : lineStyle === "dotted"
                ? "3,3"
                : "0"
            }
          />
        </svg>
      </div>
      {!hideToken && <code className="DocGrid-code">{token}</code>}
      {replacementToken && (
        <ReplacementToken replacementToken={replacementToken} />
      )}
    </>
  );
};
