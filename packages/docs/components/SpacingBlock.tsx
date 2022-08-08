import "./SpacingBlock.css";

export const SpacingBlock = ({ spacingVar }: { spacingVar: string }) => {
  return (
    <>
      <div
        className="SpacingBlock-cell"
        style={{ width: `var(${spacingVar})` }}
      />
      <code className="DocGrid-code">{spacingVar}</code>
    </>
  );
};
