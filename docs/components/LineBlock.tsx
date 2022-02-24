import { ReactNode } from "react";

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

export const LineBlock = ({ lineWidth }: { lineWidth: string }) => {
  return (
    <>
      <div className="LineBlock-cell">
        <svg viewBox="0 0 16 16" className="LineBlock-svg">
          <path
            d="M 0,8 L 16,8"
            vectorEffect="non-scaling-stroke"
            strokeWidth={`var(${lineWidth})`}
          />
        </svg>
      </div>
      <code className="DocGrid-code">{lineWidth}</code>
    </>
  );
};
