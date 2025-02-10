import { Text, makePrefixer } from "@salt-ds/core";
import clsx from "clsx";

const withBaseName = makePrefixer("saltSliderTooltip");

interface SliderTooltipProps {
  value: number | string;
  isVisible?: boolean;
  id: string;
}

export const SliderTooltip = ({ value, isVisible, id }: SliderTooltipProps) => {
  return (
    <div
      className={clsx(withBaseName(), {
        [withBaseName("visible")]: isVisible,
      })}
      role="tooltip"
      id={id}
    >
      <svg
        className={withBaseName("arrow")}
        aria-hidden="true"
        viewBox="0 1 14 14"
      >
        <path d="M0,0 H14 L7,7 Q7,7 7,7 Z" />
      </svg>
      <Text>{value}</Text>
    </div>
  );
};
