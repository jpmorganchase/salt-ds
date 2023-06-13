import { IconProps } from "../icon";
import { lazyMap } from "./lazyMap";

type IconName = keyof typeof lazyMap;

export type LazyIconProps = {
  name: IconName;
} & IconProps;

export const LazyIcon = ({
  name,
  ...props
}: LazyIconProps) => {
  const Component = lazyMap[name];

  if (!Component && process.env.NODE_ENV !== "production") {
    console.warn(
      `Setting icon name to ${name} which is invalid for <LazyIcon />`
    );
  }

  return <Component {...props} />;
};
