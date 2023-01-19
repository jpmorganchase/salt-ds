import { clsx } from "clsx";
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
      className={clsx("BorderBlock-cell", className)}
      style={{
        borderBottom: `var(${borderBottom})`,
      }}
    />
  );
};
