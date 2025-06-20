import { capitalize, FlexLayout, Text } from "@salt-ds/core";
import { Icon, type IconProps } from "@salt-ds/icons";

const COLORS = ["blue", "orange", "red", "green", "gray", "accent"] as const;
const getToken = (color: (typeof COLORS)[number]) => {
  return color === "accent"
    ? "var(--salt-palette-accent)"
    : `var(--salt-color-${color}-500)`;
};

export const ColorIndicator = ({
  fillColor,
  ...restProps
}: { fillColor: (typeof COLORS)[number] } & IconProps) => {
  return (
    <FlexLayout gap={0.5} align="center">
      <Icon viewBox="0 0 24 24" fill="none" aria-hidden {...restProps}>
        <circle cx="12" cy="12" r="12" fill={getToken(fillColor)} />
      </Icon>
      <Text>{capitalize(fillColor)}</Text>
    </FlexLayout>
  );
};
