import { GridLayout, GridItem } from "@salt-ds/core";
import Card, { CardProps } from "@site/src/components/card/Card";
import styles from "./SupportContributionsCards.module.css";

export const SupportContributionsCard = ({
  keylineColor,
  icon,
  children,
  ...rest
}: CardProps) => (
  <GridItem>
    <Card
      description={children}
      keyLineAnimation={false}
      keylineColor={`var(--site-tertiary-accent-${keylineColor})`}
      {...rest}
    />
  </GridItem>
);

const SupportContributionsCards = ({ children }) => (
  <div className={styles.supportContributionsCards}>
    <GridLayout
      columns={{
        xs: 1,
        md: 2,
      }}
      gap={3}
      rows={2}
    >
      {children}
    </GridLayout>
  </div>
);

export default SupportContributionsCards;
