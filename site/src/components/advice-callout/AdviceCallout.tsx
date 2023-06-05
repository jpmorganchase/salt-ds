import { ElementType, FC, ReactNode } from "react";
import clsx from "clsx";
import { FlexItem, FlexLayout } from "@salt-ds/core";
import { CloseIcon, SuccessTickIcon, IconProps } from "@salt-ds/icons";
import styles from "./AdviceCallout.module.css";

export interface AdviceCalloutProps {
  children: ReactNode;
  as: ElementType<any>;
  type: "positive" | "negative";
  iconLabel?: string;
  headingText?: string;
}

export const AdviceCallout: FC<AdviceCalloutProps> = ({
  children,
  as,
  type,
  iconLabel,
  headingText,
}) => {
  const iconProps: Partial<IconProps> = {
    "aria-hidden": iconLabel === undefined,
    "aria-label": iconLabel,
    size: 1,
    className: styles.icon,
  };

  return (
    <FlexLayout
      as={as}
      className={clsx(
        styles.root,
        type === "positive" ? styles.positive : styles.negative
      )}
      gap={1}
    >
      <FlexItem shrink={0} className={styles.topBar}>
        {type === "positive" ? (
          <SuccessTickIcon {...iconProps} />
        ) : (
          <CloseIcon {...iconProps} />
        )}
      </FlexItem>
      <FlexItem grow={1} className={styles.content}>
        <h3 className={styles.heading}>
          {headingText || type === "positive" ? "Do" : "Don't"}
        </h3>
        {children}
      </FlexItem>
    </FlexLayout>
  );
};
