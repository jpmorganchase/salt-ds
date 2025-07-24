import { Tag } from "@salt-ds/core";
import {
  CloseIcon,
  type IconProps,
  SuccessCircleSolidIcon,
} from "@salt-ds/icons";
import { clsx } from "clsx";
import type { FC, ReactNode } from "react";
import styles from "./GuidanceCallout.module.css";

export interface GuidanceCalloutProps {
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
  type: GuidanceCalloutProps["type"];
}) => {
  const iconProps: Partial<IconProps> = {
    "aria-hidden": true,
    size: 1,
    className: styles.pillIcon,
  };

  return (
    <Tag className={clsx(styles.pill)}>
      {type === "positive" ? (
        <SuccessCircleSolidIcon {...iconProps} />
      ) : type === "negative" ? (
        <CloseIcon {...iconProps} />
      ) : null}
      {text}
    </Tag>
  );
};

export const GuidanceCallout: FC<GuidanceCalloutProps> = ({
  children,
  type,
  customPillText,
  className,
}) => {
  return (
    <div
      className={clsx(
        styles.root,
        type === "positive" ? styles.positive : styles.negative,
        className,
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
