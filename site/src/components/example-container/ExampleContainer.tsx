import { ElementType, FC, ReactNode } from "react";
import clsx from "clsx";
import { CloseIcon, SuccessTickIcon, IconProps } from "@salt-ds/icons";
import styles from "./ExampleContainer.module.css";

export interface ExampleContainerProps {
  children: ReactNode;
  type: "positive" | "negative" | "neutral";
  customPillText?: string;
  className?: string;
}

const TypePill = ({
  text,
  type,
}: {
  text: string;
  type: ExampleContainerProps["type"];
}) => {
  const iconProps: Partial<IconProps> = {
    "aria-hidden": true,
    size: 1,
    className: styles.pillIcon,
  };

  return (
    <strong className={styles.pill}>
      {type === "positive" ? (
        <SuccessTickIcon {...iconProps} />
      ) : type === "negative" ? (
        <CloseIcon {...iconProps} />
      ) : null}
      {text}
    </strong>
  );
};

export const ExampleContainer: FC<ExampleContainerProps> = ({
  children,
  type,
  customPillText,
  className,
}) => {
  console.log({ customPillText });
  return (
    <div
      className={clsx(
        styles.root,
        type === "positive" ? styles.positive : styles.negative,
        className
      )}
    >
      {customPillText || type !== "neutral" ? (
        <TypePill
          type={type}
          text={customPillText || (type === "positive" ? "Do" : "Don't")}
        />
      ) : null}
      <div className={styles.content}>{children}</div>
    </div>
  );
};
