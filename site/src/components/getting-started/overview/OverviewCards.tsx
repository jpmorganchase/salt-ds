import { ReactNode } from "react";
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

export const OverviewCards = ({ children }: { children: ReactNode }) => (
  <div className={styles.overviewCards}>{children}</div>
);
