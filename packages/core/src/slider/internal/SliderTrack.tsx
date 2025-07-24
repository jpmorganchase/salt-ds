import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type RefObject } from "react";
import { Text } from "../../text";
import { makePrefixer } from "../../utils";
import sliderTrackCss from "./SliderTrack.css";
import { calculateMarkPosition, calculatePercentage } from "./utils";

const withBaseName = makePrefixer("saltSliderTrack");

interface SliderTrackProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  children: React.ReactNode;
  constrainLabelPosition?: boolean;
  disabled: boolean;
  showTicks?: boolean;
  format?: (value: number) => string | number;
  handlePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  isRange?: boolean;
  marks?: { label: string; value: number }[];
  max: number;
  maxLabel?: number | string;
  min: number;
  minLabel?: number | string;
  progressPercentage?: number;
  progressPercentageRange?: [number, number];
  sliderRef: RefObject<HTMLDivElement>;
}

export const SliderTrack = forwardRef<HTMLDivElement, SliderTrackProps>(
  function SliderTrack(
    {
      children,
      className,
      constrainLabelPosition = false,
      disabled,
      showTicks,
      format,
      handlePointerDown,
      isDragging,
      isRange = false,
      marks,
      max,
      maxLabel,
      min,
      minLabel,
      progressPercentage = 0,
      progressPercentageRange = [0, 0],
      sliderRef,
      ...rest
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-slider-track",
      css: sliderTrackCss,
      window: targetWindow,
    });

    const checkIsMarkSelected = (value: number) => {
      const markPercentage = calculatePercentage(value, max, min);
      if (isRange) {
        return (
          markPercentage > progressPercentageRange[0] &&
          markPercentage < progressPercentageRange[1]
        );
      }
      return markPercentage < progressPercentage;
    };

    const checkIsMarkOverlapped = (value: number) => {
      const markPercentage = calculatePercentage(value, max, min);
      if (isRange) {
        return (
          markPercentage === progressPercentageRange[0] ||
          markPercentage === progressPercentageRange[1]
        );
      }
      return markPercentage === progressPercentage;
    };

    const hasMinTick = () => {
      return marks?.some((mark) => mark.value === min) || false;
    };

    const hasMaxTick = () => {
      return marks?.some((mark) => mark.value === max) || false;
    };

    return (
      <div
        className={clsx(withBaseName(), className, {
          [withBaseName("disabled")]: disabled,
          [withBaseName("dragging")]: isDragging,
          [withBaseName("range")]: isRange,
          [withBaseName("withMarks")]: marks,
          [withBaseName("constrainLabelPosition")]: constrainLabelPosition,
          [withBaseName("withTicks")]: showTicks,
        })}
        data-testid="sliderTrack"
        ref={ref}
        {...rest}
      >
        <div className={clsx(withBaseName("container"))}>
          {minLabel && (
            <Text
              aria-hidden
              className={withBaseName("minLabel")}
              color="secondary"
              disabled={disabled}
              styleAs="label"
            >
              {minLabel || format?.(min)}
            </Text>
          )}
          {/* Slider Track */}
          <div
            onPointerDown={handlePointerDown}
            className={withBaseName("wrapper")}
          >
            <div
              className={clsx(withBaseName("rail"), {
                [withBaseName("hasMinTick")]: hasMinTick() && showTicks,
                [withBaseName("hasMaxTick")]: hasMaxTick() && showTicks,
              })}
              ref={sliderRef}
              style={
                {
                  ...(progressPercentage !== undefined && {
                    "--slider-progressPercentage": `${progressPercentage}%`,
                  }),
                  ...(progressPercentageRange?.[0] !== undefined && {
                    "--slider-progressPercentageStart": `${progressPercentageRange[0]}%`,
                  }),
                  ...(progressPercentageRange?.[1] !== undefined && {
                    "--slider-progressPercentageEnd": `${progressPercentageRange[1]}%`,
                  }),
                } as React.CSSProperties
              }
            >
              {isRange && <div className={clsx(withBaseName("fill"))} />}
              {children}
            </div>
            {/* Ticks */}
            {marks && showTicks && (
              <div className={withBaseName("ticks")}>
                {marks.map(({ value }) => (
                  <span
                    key={`${value}-tick`}
                    style={{
                      left: `${calculateMarkPosition(value, max, min)}%`,
                    }}
                    className={clsx(
                      withBaseName("tick"),
                      {
                        [withBaseName("tickSelected")]:
                          checkIsMarkSelected(value),
                      },
                      {
                        [withBaseName("tickHidden")]:
                          checkIsMarkOverlapped(value),
                      },
                    )}
                  />
                ))}
              </div>
            )}
            {/* Marks */}
            {marks && (
              <div className={withBaseName("marks")}>
                {marks.map(({ label, value }) => (
                  <span
                    data-testid="mark"
                    key={`${value}-mark`}
                    className={withBaseName("markLabel")}
                    style={{
                      left: `${calculateMarkPosition(value, max, min)}%`,
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
          {maxLabel && (
            <Text
              aria-hidden
              className={withBaseName("maxLabel")}
              color="secondary"
              disabled={disabled}
              styleAs="label"
            >
              {maxLabel || format?.(max)}
            </Text>
          )}
        </div>
      </div>
    );
  },
);
