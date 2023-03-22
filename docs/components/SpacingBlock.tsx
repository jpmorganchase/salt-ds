import "./SpacingBlock.css";

export const SpacingBlock = ({
  spacingVar,
  replacementToken,
}: {
  spacingVar: string;
  replacementToken: string;
}) => {
  return (
    <>
      <div
        className="SpacingBlock-cell"
        style={{ width: `var(${spacingVar})` }}
      />
      <code className="DocGrid-code">{spacingVar}</code>
      {replacementToken ? (
        <div className="DocGrid-notes">
          <p>
            <strong>Deprecated</strong>: use{" "}
            <code className="DocGrid-code">{replacementToken}</code> instead
          </p>
        </div>
      ) : (
        ""
      )}
    </>
  );
};
