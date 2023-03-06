import { GridLayout, GridItem } from "@salt-ds/core";
import {
  DiamondIcon,
  DocumentIcon,
  FlagIcon,
  MessageIcon,
} from "@salt-ds/icons";
import { Card, CardProps } from "../card";
import styles from "./SupportContributionsCards.module.css";

const cardIcons = {
  diamond: DiamondIcon,
  document: DocumentIcon,
  flag: FlagIcon,
  message: MessageIcon,
};

export interface SupportContributionsCardProps extends CardProps {
  cardIcon: string;
}

export const SupportContributionsCard = ({
  keylineColor,
  children,
  cardIcon,
  ...rest
}: SupportContributionsCardProps) => {
  const CardIcon = cardIcons[cardIcon];

  return (
    <GridItem>
      <Card
        description={children}
        keyLineAnimation={false}
        inlineIcon={<CardIcon size={1.7} />}
        keylineColor={`var(--site-tertiary-accent-${keylineColor})`}
        {...rest}
      />
    </GridItem>
  );
};

export const SupportContributionsCards = ({ children }) => (
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
