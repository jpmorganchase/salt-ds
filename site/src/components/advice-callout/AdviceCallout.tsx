import { ElementType, FC, ReactNode } from "react";
import { FlexItem, FlexLayout } from "@salt-ds/core";
import { CloseIcon, SuccessTickIcon } from "@salt-ds/icons";
import styles from "./AdviceCallout.module.css";

export interface AdviceCalloutProps {
  children: ReactNode;
  as: ElementType<any>;
  type: "positive" | "negative";
}

export const AdviceCallout: FC<AdviceCalloutProps> = ({
  children,
  as,
  type,
}) => (
  <FlexLayout as={as} className={styles.root}>
    {type === "positive" ? (
      <SuccessTickIcon size={1.5} className={styles.iconPositive} />
    ) : (
      <CloseIcon size={1.5} className={styles.iconNegative} />
    )}
    <FlexItem grow={1} className={styles.content}>
      {children}
    </FlexItem>
  </FlexLayout>
);
