import {
  type FlexLayoutProps,
  makePrefixer,
  useControlled,
  useForkRef,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  forwardRef,
  type MouseEvent,
  type ReactElement,
  useRef,
  useState,
} from "react";
import ratingCss from "./Rating.css";
import { RatingItem, type RatingItemProps } from "./RatingItem";

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
  onChange?: (
    event: React.MouseEvent<HTMLButtonElement>,
    itemValue: number,
  ) => void;
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
   * @default true
   */
  enableDeselect?: boolean;
  /**
   * Total number of icons displayed.
   * @default 5
   */
  max?: number;
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
   * @default "right"
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
    value: valueProp,
    defaultValue = 0,
    onChange,
    className,
    readOnly = false,
    disabled = false,
    enableDeselect = true,
    max = 5,
    semanticLabels,
    showLabel = false,
    character,
    outlinedIcon,
    filledIcon,
    emptyIcon,
    labelPosition = "right",
    onKeyDown,
    onFocus,
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
  const [currentHoveredIndex, setCurrentHoveredIndex] = useState(0);
  const [selected, setSelected] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: "Rating",
    state: "value",
  });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const handleWrapperRef = useForkRef(ref, wrapperRef);

  const getLabel = (value: number): string => {
    if (typeof semanticLabels === "function") {
      return semanticLabels(value, max); // Generate label dynamically
    }
    return semanticLabels?.[value - 1] || "No rating selected";
  };

  const label = currentHoveredIndex > 0 
  ? getLabel(currentHoveredIndex)
  : selected > 0 
    ? getLabel(selected) 
    : "No rating selected";

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
      wrapperRef.current?.querySelectorAll("button:not([disabled])") ?? [],
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
          const newValue = nextIndex + 1;
          elements[nextIndex]?.focus();
          setSelected(newValue); // Save the selection as the rating

          // Trigger onChange for controlled mode
          if (onChange) {
            // Create a synthetic event since keyboard events don't have a button target
            onChange(event as any, newValue);
          }
        }
        break;
      case "ArrowUp":
      case "ArrowLeft":
        if (!isFirstStar) {
          const prevIndex = currentIndex - 1;
          const newValue = prevIndex + 1;
          elements[prevIndex]?.focus();
          setSelected(newValue); // Save the selection as the rating
          // Trigger onChange for controlled mode
          if (onChange) {
            onChange(event as any, newValue);
          }
        }
        break;
    }

    onKeyDown?.(event);
  };

  const handleMouseHover = (
    event: MouseEvent<HTMLButtonElement>,
    value: number,
  ) => {
    if (event.type === "mouseenter") {
      setCurrentHoveredIndex(value);
    } else if (event.type === "mouseleave") {
      setCurrentHoveredIndex(0);
    }
  };

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    if (selected === 0) {
      const newValue = 1;
      setSelected(newValue);
      
      // Trigger onChange for controlled mode
      if (onChange) {
        onChange(event as any, newValue);
      }
    }
    
    onFocus?.(event);
  };

  const handleItemClick = (
    event: MouseEvent<HTMLButtonElement>,
    value: number,
  ) => {
    const newValue = selected === value && enableDeselect ? 0 : value;
    
    setSelected(newValue);
    
    if (onChange) {
      onChange(event, newValue);
    }
  };

  return (
    <div
      ref={handleWrapperRef}
      className={clsx(
        withBaseName("wrapper"),
        withBaseName(`wrapper-${labelPosition}`),
        className
      )}
      {...restProps}
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
      <div
        role="radiogroup"
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        className={clsx(withBaseName("container"))}
      >
        {Array.from({ length: max }, (_, index) => {
          const itemValue = index + 1;
          const isHovered =
            currentHoveredIndex > 0 && itemValue <= currentHoveredIndex;
          const isSelected = itemValue > 0 && itemValue <= selected;
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
              onHover={handleMouseHover}
              onItemClick={handleItemClick}
              value={itemValue}
              key={itemValue}
              readOnly={readOnly}
              disabled={disabled}
              character={character}
              outlinedIcon={outlinedIcon}
              filledIcon={filledIcon}
              emptyIcon={emptyIcon}
              index={index}
            />
          );
        })}
      </div>
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
    </div>
  );
});
