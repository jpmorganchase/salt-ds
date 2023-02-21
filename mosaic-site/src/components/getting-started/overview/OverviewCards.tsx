import { Card, CardProps } from "../../card/Card";
import styles from "./OverviewCards.module.css";

export const OverviewCard = ({
  keylineColor,
  children,
  ...rest
}: CardProps) => (
  <Card
    description={children}
    keyLineAnimation={false}
    keylineColor={`var(--site-tertiary-accent-${keylineColor})`}
    {...rest}
  />
);

export const OverviewCards = ({ children }) => (
  <div className={styles.overviewCards}>{children}</div>
);
