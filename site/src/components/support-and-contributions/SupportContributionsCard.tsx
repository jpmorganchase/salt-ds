import { GridItem } from "@salt-ds/core";
import {
  DiamondIcon,
  DocumentIcon,
  FlagIcon,
  type IconProps,
  MessageIcon,
} from "@salt-ds/icons";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { Card, type CardProps } from "../card";

type IconType = ForwardRefExoticComponent<
  IconProps & RefAttributes<SVGSVGElement>
>;

type IconName = "diamond" | "document" | "flag" | "message";

type CardsIconsType = Record<IconName, IconType>;

const cardIcons: CardsIconsType = {
  diamond: DiamondIcon,
  document: DocumentIcon,
  flag: FlagIcon,
  message: MessageIcon,
};

export interface SupportContributionsCardProps extends CardProps {
  cardIcon: IconName;
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
        keyLineAnimation={false}
        inlineIcon={<CardIcon size={1.7} />}
        keylineColor={`var(--site-tertiary-accent-${keylineColor})`}
        {...rest}
        description={children}
      />
    </GridItem>
  );
};
