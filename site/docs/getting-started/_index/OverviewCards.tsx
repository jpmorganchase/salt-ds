import Card, { CardProps } from "@site/src/components/card/Card";
import styles from "./OverviewCards.module.css";

export const OverviewCard = ({
  description,
  keylineColor,
  ...rest
}: CardProps) => (
  <Card
    description={<p>{description}</p>}
    keyLineAnimation={false}
    keylineColor={`var(--site-tertiary-accent-${keylineColor})`}
    {...rest}
  />
);

const OverviewCards = ({ children }) => (
  <div className={styles.overviewCards}>{children}</div>
);

export default OverviewCards;
