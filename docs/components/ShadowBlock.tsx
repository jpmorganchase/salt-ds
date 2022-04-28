import "./ShadowBlock.css";

export const ShadowBlockCell = ({ shadowVar }: { shadowVar: string }) => {
  return (
    <div
      className={"ShadowBlock-cell"}
      style={{ boxShadow: `var(${shadowVar})` }}
    />
  );
};

export const ShadowBlock = ({ shadowVar }: { shadowVar: string }) => {
  return (
    <div className="ShadowBlock" style={{ boxShadow: `var(${shadowVar})` }}>
      {shadowVar}
    </div>
  );
};
