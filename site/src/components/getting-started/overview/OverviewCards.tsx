import { ReactNode } from "react";
import { clsx } from "clsx";
import { Card, CardProps } from "../../card/Card";
import styles from "./OverviewCards.module.css";

export const OverviewCard = ({
  keylineColor,
  children,
  ...rest
}: CardProps) => (
  <Card
    keyLineAnimation={false}
    keylineColor={`var(--site-tertiary-accent-${keylineColor})`}
    {...rest}
    description={children}
  />
);

export const OverviewCards = ({
  children,
  columns = 2,
}: {
  children: ReactNode;
  columns?: 2 | 3;
}) => (
  <div
    className={clsx(styles.overviewCards, {
      [styles.overviewCards3Col]: columns === 3,
    })}
  >
    {children}
  </div>
);
