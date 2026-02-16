import {
  type FlexLayoutProps,
  makePrefixer,
  useControlled,
  useFormFieldProps,
  useIcon,
  useId,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  forwardRef,
  type MouseEvent,
  type SyntheticEvent,
  useRef,
  useState,
} from "react";
import ratingCss from "./Rating.css";
import { RatingItem } from "./RatingItem";

const withBaseName = makePrefixer("saltRating");

export interface RatingProps extends Omit<FlexLayoutProps<"div">, "onChange"> {
  /**
   * When provided, the component is controlled.
   */
  value?: number;
  /**
   * Default rating value for uncontrolled mode.
   * @default 0
   */
  defaultValue?: number;
  /**
   * Callback function for rating change.
   * The first parameter is the event, and the second is the selected rating value.
   */
  onChange?: (event: SyntheticEvent, value: number) => void;
  /**
   * If true, the rating component will be in a read-only state.
   */
  readOnly?: boolean;
  /**
   * If true, the rating component will be in a disabled state.
   */
  disabled?: boolean;
  /**
   * Total number of icons displayed.
   * @default 5
   */
  max?: number;
  /**
   * Function that generates labels dynamically based on the value and max.
   */
  getLabel?: (value: number, max: number) => string;
  /**
   * Position of the label relative to the rating component.
   * Can be "top", "right", "bottom", or "left".
   * @default "right"
   */
  labelPlacement?: "top" | "right" | "bottom" | "left";
  /**
   * The name to be set on each radio button within the group. If not set, then one will be generated for you.
   */
  name?: string;
}

export const Rating = forwardRef<HTMLDivElement, RatingProps>(function Rating(
  {
    value: valueProp,
    defaultValue = 0,
    name: nameProp,
    onChange,
    className,
    readOnly,
    disabled,
    max = 5,
    getLabel,
    labelPlacement = "right",
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...restProps
  },
  ref?,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-rating",
    css: ratingCss,
    window: targetWindow,
  });
  const {
    a11yProps: {
      "aria-describedby": formFieldDescribedBy,
      "aria-labelledby": formFieldLabelledBy,
    } = {},
  } = useFormFieldProps();

  const [currentHoveredIndex, setCurrentHoveredIndex] = useState(0);
  const [selected, setSelected] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: "Rating",
    state: "value",
  });
  const radioGroupRef = useRef<HTMLDivElement>(null);
  const name = useId(nameProp);
  const { RatingIcon, RatingSelectedIcon, RatingUnselectingIcon } = useIcon();

  const getSemanticLabels = (value: number): string =>
    value > 0
      ? getLabel?.(value, max) || `${value} out of ${max}`
      : "No rating selected";

  const updateRating = (newValue: number, event: any) => {
    setSelected(newValue);
    onChange?.(event, newValue);
  };

  const handleMouseHover =
    (itemValue: number) => (event: MouseEvent<HTMLLabelElement>) => {
      if (readOnly) return;
      setCurrentHoveredIndex(event.type === "mouseenter" ? itemValue : 0);
    };

  const handleClick =
    (itemValue: number) => (event: MouseEvent<HTMLInputElement>) => {
      if (readOnly) {
        event.preventDefault();
        return;
      }
      updateRating(itemValue, event);
    };

  const isTopLeft = labelPlacement === "top" || labelPlacement === "left";
  const label = getSemanticLabels(currentHoveredIndex || selected);

  const displayLabel = getLabel && (
    <div
      className={clsx(
        withBaseName("label"),
        withBaseName(`label-${labelPlacement}`),
      )}
    >
      {label}
    </div>
  );

  const ariaLabelledByValue =
    clsx(formFieldLabelledBy, ariaLabelledBy) || undefined;

  return (
    <div
      ref={ref}
      className={clsx(
        withBaseName("wrapper"),
        withBaseName(`wrapper-${labelPlacement}`),
        className,
      )}
      {...restProps}
    >
      {isTopLeft && displayLabel}
      <div
        role="radiogroup"
        className={withBaseName("container")}
        ref={radioGroupRef}
        aria-readonly={readOnly || undefined}
        aria-labelledby={ariaLabelledByValue}
        aria-describedby={
          clsx(formFieldDescribedBy, ariaDescribedBy) || undefined
        }
      >
        {Array.from({ length: max }, (_, index) => {
          const itemValue = index + 1;
          const isHovered =
            currentHoveredIndex > 0 && itemValue <= currentHoveredIndex;
          const isSelected = currentHoveredIndex === 0 && itemValue <= selected;
          const isActive =
            currentHoveredIndex > 0 &&
            itemValue > currentHoveredIndex &&
            itemValue <= selected;
          return (
            <RatingItem
              currentRating={selected}
              isHovered={isHovered}
              isSelected={isSelected}
              isActive={isActive}
              onHover={handleMouseHover(itemValue)}
              onClick={handleClick(itemValue)}
              value={itemValue}
              key={itemValue}
              readOnly={readOnly}
              disabled={disabled}
              strongIcon={<RatingUnselectingIcon />}
              filledIcon={<RatingSelectedIcon />}
              emptyIcon={<RatingIcon />}
              index={index}
              name={name}
            />
          );
        })}
      </div>
      {!isTopLeft && displayLabel}
    </div>
  );
});
