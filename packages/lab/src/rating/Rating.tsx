import { FlexLayout, type FlexLayoutProps, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEvent,
  type ReactElement,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ratingCss from "./Rating.css";
import { RatingItem, type RatingItemProps } from "./RatingItem";

const withBaseName = makePrefixer("saltRating");

export interface RatingProps extends FlexLayoutProps<"div"> {
  /**
   * current selected rating. If nothing is selected, 0 is assigned.
   */
  value?: number;
  /**
   * callback function for rating change.
   */
  onValueChange?: (itemValue: number) => void;
  /**
   * To pass additional props to button
   */
  ButtonProps?: ComponentPropsWithoutRef<"button">;
  /**
   * If true, the rating component will be in a read-only state.
   */
  readOnly?: boolean;
  /**
   * If true, the rating component will be in a disabled state.
   */
  disabled?: boolean;
  /**
   * Whether to allow clearing the rating when clicking the same rating again.
   */
  allowClear?: boolean;
  /**
   * Total number of icons displayed.
   */
  max?: number;
  /**
   * Defines the minimum increment value change allowed.
   */
  precision?: number;
  /**
   * Custom labels for each rating value. Can be an array of strings or a function
   * that generates labels dynamically (e.g., numerical values like "1/5").
   */
  semanticLabels?: string[] | ((value: number, max: number) => string);
  /**
   * Whether to display the label.
   */
  showLabel?: boolean;
  /**
   * Custom character for the rating icons.
   */
  character?: React.ReactNode | ((props: RatingItemProps) => React.ReactNode);
  /**
   * Position of the label relative to the rating component.
   * Can be "top", "right", "bottom", or "left".
   */
  labelPosition?: "top" | "right" | "bottom" | "left";
  /**
   * Custom icon for the outlined state.
   */
  outlinedIcon?: React.ReactNode;
  /**
   * Custom icon for the filled state.
   */
  filledIcon?: React.ReactNode;
  /**
   * Custom icon for the empty state.
   */
  emptyIcon?: React.ReactNode;
}

export const Rating = forwardRef<HTMLDivElement, RatingProps>(function Rating(
  {
    value = 0,
    onValueChange,
    className,
    ButtonProps,
    readOnly = false,
    disabled = false,
    allowClear = true,
    max = 5,
    precision = 1,
    semanticLabels,
    showLabel = false,
    character,
    outlinedIcon,
    filledIcon,
    emptyIcon,
    labelPosition = "right",
    ...restProps
  },
  ref?,
): ReactElement<RatingProps> {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-rating",
    css: ratingCss,
    window: targetWindow,
  });
  const [reset, setReset] = useState(false);
  const [currentHoveredStarIndex, setCurrentHoveredStarIndex] = useState(0);
  const [selected, setSelectedItem] = useState<number>(value ? value : 0);
  const groupRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => groupRef.current as HTMLDivElement);

  const getLabel = (value: number): string => {
    if (typeof semanticLabels === "function") {
      return semanticLabels(value, max); // Generate label dynamically
    }
    return semanticLabels?.[value - 1] || "No rating selected";
  };

  const [label, setLabel] = useState(
    value ? getLabel(value) : "No rating selected",
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (readOnly) {
      // Prevent focus movement in read-only mode
      if (
        ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(event.key)
      ) {
        event.preventDefault();
      }
      return;
    }
    const elements: HTMLElement[] = Array.from(
      groupRef.current?.querySelectorAll("button:not([disabled])") ?? [],
    );
    const currentIndex = elements.findIndex(
      (element) => element === document.activeElement,
    );
    const isLastStar = currentIndex === elements.length - 1; // Check if this is the last star
    const isFirstStar = currentIndex === 0; // Check if this is the first star

    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        if (!isLastStar) {
          const nextIndex = currentIndex + 1;
          elements[nextIndex]?.focus();
          setSelectedItem(nextIndex + 1); // Save the selection as the rating
          setLabel(getLabel(nextIndex + 1)); // Update the label
        }
        break;
      case "ArrowUp":
      case "ArrowLeft":
        if (!isFirstStar) {
          const prevIndex = currentIndex - 1;
          elements[prevIndex]?.focus();
          setSelectedItem(prevIndex + 1); // Save the selection as the rating
          setLabel(getLabel(prevIndex + 1)); // Update the label
        }
        break;
    }
  };

  const handleMouseHover = (
    _event: MouseEvent<HTMLButtonElement>,
    value: number,
  ) => {
    if (_event.type === "mouseenter") {
      setLabel(getLabel(value));
    } else if (_event.type === "mouseleave") {
      setReset(false);
      setLabel(selected > 0 ? getLabel(selected) : "No rating selected"); // Reset label
    }
    setCurrentHoveredStarIndex(value);
  };

  const handleFocus = () => {
    if (selected === 0) {
      setSelectedItem(1); // Save the selection as the first star
      setLabel(getLabel(1)); // Update the label
    }
  };

  const handleItemClick = (
    _event: MouseEvent<HTMLButtonElement>,
    value: number,
  ) => {
    if (selected === value) {
      if (allowClear) {
        // Clear the rating if `allowClear` is true
        setSelectedItem(0);
        setReset(true);
        setLabel("No rating selected"); // Reset label when cleared
      }
    } else {
      setSelectedItem(value);
      setReset(false);
      setLabel(getLabel(value)); // Update label based on selected star
    }
  };

  useEffect(() => {
    if (onValueChange) {
      onValueChange(selected);
    }
  }, [selected]);

  useEffect(() => {
    setSelectedItem(value);
  }, [value]);

  return (
    <FlexLayout
      gap={1}
      align="center"
      direction={
        labelPosition === "left" || labelPosition === "right" ? "row" : "column"
      }
    >
      {(showLabel || semanticLabels) &&
        (labelPosition === "top" || labelPosition === "left") && (
          <div
            className={clsx(
              withBaseName("label"),
              withBaseName(`label-${labelPosition}`),
            )}
          >
            {label}
          </div>
        )}
      <FlexLayout
        role="radiogroup"
        gap={0.5}
        ref={groupRef}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        className={clsx(withBaseName(), className)}
        {...restProps}
      >
        {Array.from({ length: max }, (_, index) => (
          <RatingItem
            reset={reset}
            currentRating={selected}
            isCurrentStarHovered={
              currentHoveredStarIndex > 0 &&
              index + 1 <= currentHoveredStarIndex
            }
            isSelectedStyle={index + 1 > 0 && index + 1 <= selected}
            isActiveState={
              currentHoveredStarIndex > 0 && // A star is being hovered
              index + 1 > currentHoveredStarIndex && // This star is beyond the hovered star
              index + 1 <= selected
            }
            onFeedbackItemHover={handleMouseHover}
            onFeedbackItemClick={handleItemClick}
            itemValue={index + 1}
            key={index + 1}
            {...ButtonProps}
            readOnly={readOnly}
            disabled={disabled}
            precision={precision}
            character={character}
            outlinedIcon={outlinedIcon}
            filledIcon={filledIcon}
            emptyIcon={emptyIcon}
            index={index}
          />
        ))}
      </FlexLayout>
      {(showLabel || semanticLabels) &&
        (labelPosition === "bottom" || labelPosition === "right") && (
          <div
            className={clsx(
              withBaseName("label"),
              withBaseName(`label-${labelPosition}`),
            )}
          >
            {label}
          </div>
        )}
    </FlexLayout>
  );
});
