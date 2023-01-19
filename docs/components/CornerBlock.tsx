import { ReactNode } from "react";
import { clsx } from "clsx";

import "./CornerBlock.css";

export const CornerBlockCell = ({ cornerRadius }: { cornerRadius: string }) => {
  return (
    <div className={clsx("CornerBlock-cell")}>
      <div
        className="CornerBlock-inner"
        style={{ borderTopRightRadius: `var(${cornerRadius})` }}
      />
    </div>
  );
};

export const CornerBlockCode = ({ children }: { children: ReactNode }) => {
  return <code className="DocGrid-code">{children}</code>;
};

export const CornerBlock = ({ cornerRadius }: { cornerRadius: string }) => {
  return (
    <>
      <CornerBlockCell cornerRadius={cornerRadius} />
      <CornerBlockCode>{cornerRadius}</CornerBlockCode>
    </>
  );
};
