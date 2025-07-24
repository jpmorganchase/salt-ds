import { capitalize, FlexLayout } from "@salt-ds/core";
import type { GridCellValueProps } from "@salt-ds/data-grid";
import { Icon, type IconProps } from "@salt-ds/icons";
import type { FC } from "react";
import styles from "./PatternIndication.module.css";

export type ColorValueCellProps = {
  color: "blue" | "orange" | "red" | "green" | "gray" | "accent";
};

const DotIcon = ({ fill, ...restProps }: { fill: string } & IconProps) => (
  <Icon viewBox="0 0 24 24" fill="none" {...restProps}>
    <circle cx="12" cy="12" r="12" fill={fill} />
  </Icon>
);

export const getIconColor = (color: ColorValueCellProps["color"]) => {
  return color === "accent"
    ? "var(--salt-palette-accent)"
    : `var(--salt-color-${color}-500)`;
};

export const ColorCellValue = (
  props: GridCellValueProps<ColorValueCellProps>,
) => {
  const { row } = props;

  const { color } = row.data;

  const fillColor = getIconColor(color);

  return (
    <FlexLayout gap={0.5} align="center" className={styles.valueCell}>
      <DotIcon fill={fillColor} size={1.5} />
      <span>{capitalize(color)}</span>
    </FlexLayout>
  );
};

export const IconDisplay = (props: {
  iconName: string;
  ExampleIcon: FC<IconProps>;
  color: ColorValueCellProps["color"];
}) => {
  const { ExampleIcon, color, iconName } = props;

  return (
    <FlexLayout gap={0.5} align="center" className={styles.valueCell}>
      <ExampleIcon
        style={{ color: `var(--salt-color-${color}-500)` }}
        size={1.5}
      />
      <code>{iconName}</code>
    </FlexLayout>
  );
};
