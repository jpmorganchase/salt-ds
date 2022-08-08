import "./OutlineBlock.css";

export const OutlineBlock = ({ outline }: { outline: string }) => {
  return (
    <div
      className={"OutlineBlock-cell"}
      style={{
        outline: `var(${outline})`,
      }}
    />
  );
};
