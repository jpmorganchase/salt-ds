import styles from "./LineBlock.module.css";

export const LineBlock = ({
  token,
  lineWidth,
  lineStyle,
  hideToken,
}: {
  token: string;
  lineWidth?: string;
  lineStyle?: string;
  hideToken?: boolean;
}) => {
  return (
    <>
      <div className={styles.cell}>
        <svg viewBox="0 0 16 16" className={styles.svg}>
          <path
            d="M 0,8 L 16,8"
            vectorEffect="non-scaling-stroke"
            strokeWidth={lineWidth ? `var(${lineWidth})` : "1px"}
            strokeDasharray={
              lineStyle === "dashed"
                ? "10,10"
                : lineStyle === "dotted"
                  ? "3,3"
                  : "0"
            }
          />
        </svg>
      </div>
      {!hideToken && <code>{token}</code>}
    </>
  );
};
