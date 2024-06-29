import { Card, type CardProps } from "../../card/Card";

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
