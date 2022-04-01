import "./NumberBlock.css";

export const NumberBlock = ({
  number,
  cssVariable,
}: {
  number: string;
  cssVariable: string;
}) => {
  return (
    <>
      <div className="NumberBlock-cell">{number}</div>
      <code className="DocGrid-code">{cssVariable}</code>
    </>
  );
};
