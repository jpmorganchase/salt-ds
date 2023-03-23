import { ReplacementToken } from "./ReplacementToken";
import "./SpacingBlock.css";

export const SpacingBlock = ({
  spacingVar,
  replacementToken,
}: {
  spacingVar: string;
  replacementToken?: string;
}) => {
  return (
    <>
      <div
        className="SpacingBlock-cell"
        style={{ width: `var(${spacingVar})` }}
      />
      <code className="DocGrid-code">{spacingVar}</code>
      {replacementToken ? <ReplacementToken replacementToken={replacementToken} /> : (
        ""
      )}
    </>
  );
};
