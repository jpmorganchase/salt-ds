import { ElementType, FC, ReactNode } from "react";
import { FlexItem, FlexLayout } from "@salt-ds/core";
import { CloseIcon, SuccessTickIcon } from "@salt-ds/icons";
import styles from "./AdviceCallout.module.css";

export interface AdviceCalloutProps {
  children: ReactNode;
  as: ElementType<any>;
  type: "positive" | "negative";
  iconLabel?: string;
}

export const AdviceCallout: FC<AdviceCalloutProps> = ({
  children,
  as,
  type,
  iconLabel,
}) => (
  <FlexLayout as={as} className={styles.root}>
    {type === "positive" ? (
      <SuccessTickIcon
        aria-hidden={iconLabel === undefined}
        aria-label={iconLabel}
        size={1.5}
        className={styles.iconPositive}
      />
    ) : (
      <CloseIcon
        aria-hidden={iconLabel === undefined}
        aria-label={iconLabel}
        size={1.5}
        className={styles.iconNegative}
      />
    )}
    <FlexItem grow={1} className={styles.content}>
      {children}
    </FlexItem>
  </FlexLayout>
);
