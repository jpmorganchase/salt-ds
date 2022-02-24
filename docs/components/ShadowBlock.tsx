import "./ShadowBlock.css";

export const ShadowBlock = ({ shadowVar }: { shadowVar: string }) => {
  return (
    <div className="ShadowBlock" style={{ boxShadow: `var(${shadowVar})` }}>
      {shadowVar}
    </div>
  );
};
