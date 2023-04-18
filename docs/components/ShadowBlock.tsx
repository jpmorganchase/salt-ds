
import { makePrefixer } from "@salt-ds/core";
import { ReplacementToken } from "./ReplacementToken";
import "./ShadowBlock.css";

const withBaseName = makePrefixer("ShadowBlock");
export const ShadowBlockCell = ({ shadowVar }: { shadowVar: string }) => {
  return (
    <div
      className={"ShadowBlock-cell"}
      style={{ boxShadow: `var(${shadowVar})` }}
    />
  );
};

export const ShadowBlock = ({ shadowVar, hideToken, replacementToken }: { shadowVar: string, hideToken?: boolean, replacementToken?: string }) => {
  return (

<>
<div
  style={{ boxShadow: `var(${shadowVar})` }}
  className={
    withBaseName()}
/>
{!hideToken && <code className="DocGrid-code">{shadowVar}</code>}
{replacementToken ? (
  <ReplacementToken replacementToken={replacementToken} />
) : (
  ""
)}
</>
  );
};
