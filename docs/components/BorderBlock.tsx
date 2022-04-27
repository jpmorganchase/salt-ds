import cx from "classnames";
import "./BorderBlock.css";

export const BorderBlock = ({
  borderBottom,
  className,
}: {
  borderBottom: string;
  className?: string;
}) => {
  return (
    <div
      className={cx("BorderBlock-cell", className)}
      style={{
        borderBottom: `var(${borderBottom})`,
      }}
    />
  );
};
