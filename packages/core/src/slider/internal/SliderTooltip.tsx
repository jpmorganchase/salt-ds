import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { Text } from "../../text";
import { makePrefixer } from "../../utils";
import sliderTooltipCss from "./SliderTooltip.css";

const withBaseName = makePrefixer("saltSliderTooltip");

interface SliderTooltipProps {
  value: number | string;
  open?: boolean;
}

export const SliderTooltip = ({ value, open }: SliderTooltipProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-slider-tooltip",
    css: sliderTooltipCss,
    window: targetWindow,
  });

  return (
    <div
      aria-hidden
      className={clsx(withBaseName(), {
        [withBaseName("visible")]: open,
      })}
      data-testid="sliderTooltip"
    >
      <svg
        className={withBaseName("arrow")}
        aria-hidden="true"
        viewBox="0 1 14 14"
      >
        <path
          d="M0,0 H14 L7,7 Q7,7 7,7 Z"
          stroke=" var(--salt-container-primary-background)"
        />
        <path
          d="M0,0 H14 L7,7 Q7,7 7,7 Z"
          stroke="var(--salt-container-primary-borderColor)"
        />
      </svg>
      <Text className={withBaseName("text")}>{value}</Text>
    </div>
  );
};
