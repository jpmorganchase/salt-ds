import {
  capitalize,
  makePrefixer,
  useControlled,
  useFormFieldProps,
  useId,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEvent,
  useRef,
  useState,
} from "react";
import ratingCss from "./Rating.css";
import { RatingItem } from "./RatingItem";

const withBaseName = makePrefixer("saltRating");

export interface RatingProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
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
  onChange?: (event: ChangeEvent<HTMLInputElement>, value: number) => void;
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
   * Function used to provider a user-friendly name for the current value of the rating. Primarily used by screen readers.
   */
  getLabel?: (value: number) => string;
  /**
   * Function used to provider a visible label for the rating.
   */
  getVisibleLabel?: (value: number, max: number) => string;
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

const defaultGetLabel = (value: number) =>
  `${value} Star${value > 1 ? "s" : ""}`;

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
    getLabel = defaultGetLabel,
    getVisibleLabel,
    labelPlacement = "right",
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...restProps
  },
  ref,
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

  const [hoveredValue, setHoveredValue] = useState(0);
  const [selected, setSelected] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: "Rating",
    state: "value",
  });
  const radioGroupRef = useRef<HTMLDivElement>(null);
  const name = useId(nameProp);

  const updateRating = (
    newValue: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setSelected(newValue);
    onChange?.(event, newValue);
  };

  const handleMouseEnter = (event: MouseEvent<HTMLInputElement>) => {
    if (readOnly || disabled) return;
    const itemValue = Number.parseInt(event.currentTarget.value, 10);
    setHoveredValue(itemValue);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (readOnly) {
      event.preventDefault();
      return;
    }

    const itemValue = Number.parseInt(event.currentTarget.value, 10);
    updateRating(itemValue, event);
  };

  const isTopLeft = labelPlacement === "top" || labelPlacement === "left";

  const displayLabel = getVisibleLabel && (
    <div
      className={clsx(
        withBaseName("label"),
        withBaseName(`label-${labelPlacement}`),
      )}
      aria-hidden
    >
      {getVisibleLabel(hoveredValue || selected, max)}
    </div>
  );

  return (
    <div
      ref={ref}
      className={clsx(
        withBaseName(),
        withBaseName(`label${capitalize(labelPlacement)}`),
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
        aria-label={ariaLabel}
        aria-labelledby={clsx(formFieldLabelledBy, ariaLabelledBy) || undefined}
        aria-describedby={
          clsx(formFieldDescribedBy, ariaDescribedBy) || undefined
        }
        onMouseLeave={() => setHoveredValue(0)}
      >
        {Array.from({ length: max }, (_, index) => {
          const itemValue = index + 1;
          const isHovered = hoveredValue > 0 && itemValue <= hoveredValue;
          const isSelected = hoveredValue === 0 && itemValue <= selected;
          const isUnselecting =
            hoveredValue > 0 &&
            itemValue > hoveredValue &&
            itemValue <= selected;
          return (
            <RatingItem
              key={itemValue}
              currentRating={selected}
              isHovered={isHovered}
              isSelected={isSelected}
              isUnselecting={isUnselecting}
              onMouseEnter={handleMouseEnter}
              onChange={handleChange}
              value={itemValue}
              readOnly={readOnly}
              disabled={disabled}
              name={name}
              aria-label={getLabel?.(itemValue)}
            />
          );
        })}
      </div>
      {!isTopLeft && displayLabel}
    </div>
  );
});
