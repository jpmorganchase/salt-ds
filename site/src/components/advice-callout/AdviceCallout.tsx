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
}

export const AdviceCallout: FC<AdviceCalloutProps> = ({
  children,
  as,
  type,
  iconLabel,
}) => {
  const iconProps: Partial<IconProps> = {
    "aria-hidden": iconLabel === undefined,
    "aria-label": iconLabel,
    size: 1,
  };

  return (
    <FlexLayout as={as} className={styles.root}>
      {type === "positive" ? (
        <SuccessTickIcon
          {...iconProps}
          className={clsx(styles.icon, styles.iconPositive)}
        />
      ) : (
        <CloseIcon
          {...iconProps}
          className={clsx(styles.icon, styles.iconNegative)}
        />
      )}
      <FlexItem grow={1} className={styles.content}>
        {children}
      </FlexItem>
    </FlexLayout>
  );
};
