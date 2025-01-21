import { Text, makePrefixer } from "@salt-ds/core";

const withBaseName = makePrefixer("saltSliderTooltip");

interface SliderTooltipProps {
  value: number | string;
}

export const SliderTooltip = ({ value }: SliderTooltipProps) => {
  return (
    <div className={withBaseName()} role="tooltip">
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
