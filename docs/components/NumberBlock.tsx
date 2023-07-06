import "./NumberBlock.css";
import { ReplacementToken } from "./ReplacementToken";

export const NumberBlock = ({
  number,
  cssVariable,
  replacementToken
}: {
  number: string;
  cssVariable: string;
  replacementToken?: string;
}) => {
  return (
    <>
      <div className="NumberBlock-cell">{number}</div>
      <code className="DocGrid-code">{cssVariable}</code>
      {replacementToken ? (
        <ReplacementToken replacementToken={replacementToken} />
      ) : (
        ""
      )}
    </>
  );
};
