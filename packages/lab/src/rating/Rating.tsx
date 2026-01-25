import {
  type FlexLayoutProps,
  makePrefixer,
  useControlled,
  useForkRef,
  useId,
  useFormFieldProps,
  useIcon
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
   * Function that generates labels dynamically based on the value and max.
   */
  getLabel?: (value: number, max: number) => string;
  /**
   * Custom character for the rating icons.
   */
  character?: React.ReactNode | ((props: RatingItemProps) => React.ReactNode);
  /**
   * Position of the label relative to the rating component.
   * Can be "top", "right", "bottom", or "left".
   * @default "right"
   */
  labelPlacement?: "top" | "right" | "bottom" | "left";
  /**
   * Custom icon for the outlined state.
   */
  strongIcon?: React.ReactNode;
  /**
   * Custom icon for the filled state.
   */
  filledIcon?: React.ReactNode;
  /**
   * Custom icon for the empty state.
   */
  emptyIcon?: React.ReactNode;
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
    enableDeselect = true,
    max = 5,
    getLabel,
    character,
    strongIcon,
    filledIcon,
    emptyIcon,
    labelPlacement = "right",
    onKeyDown,
    onFocus,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const handleWrapperRef = useForkRef(ref, wrapperRef);
  const name = useId(nameProp);
  const labelId = useId();
  const { FavoriteEmptyIcon, FavoriteSolidIcon, FavoriteStrongIcon } = useIcon();

  const getSemanticLabels = (value: number): string => 
    value > 0 
      ? getLabel?.(value, max) || `${value}/${max}`
      : "No rating selected";

  const updateRating = (newValue: number, event: any) => {
    setSelected(newValue);
    onChange?.(event, newValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (readOnly) {
      if (["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
      }
      return;
    }

    const elements: HTMLElement[] = Array.from(
      wrapperRef.current?.querySelectorAll("input[type='radio']") ?? [],
    );
    const currentIndex = elements.findIndex((el) => el === document.activeElement);

    let newValue: number | null = null;
    let targetIndex = -1;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        if (currentIndex < elements.length - 1) {
          targetIndex = currentIndex + 1;
          newValue = targetIndex + 1;
        }
        break;

      case "ArrowUp":
      case "ArrowLeft":
        if (currentIndex > 0) {
          targetIndex = currentIndex - 1;
          newValue = targetIndex + 1;
        }
        break;

      case "Enter":
      case " ":
        if (currentIndex !== -1 && enableDeselect) {
          newValue = selected === currentIndex + 1 ? 0 : currentIndex + 1;
        }
        break;

      default:
        onKeyDown?.(event);
        return;
    }

    event.preventDefault();
    
    if (targetIndex >= 0) {
      elements[targetIndex]?.focus();
    }
    
    if (newValue !== null) {
      updateRating(newValue, event);
      setCurrentHoveredIndex(0);
    }

    onKeyDown?.(event);
  };

  const handleMouseHover = (itemValue: number) => (event: MouseEvent<HTMLLabelElement>) => {
    if (readOnly) return;
    setCurrentHoveredIndex(event.type === "mouseenter" ? itemValue : 0);
  };

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    if (selected === 0 && !readOnly) {
      updateRating(1, event);
    }
    onFocus?.(event);
  };

  const handleClick = (itemValue: number) => (event: MouseEvent<HTMLInputElement>) => {
    if (readOnly) {
      event.preventDefault();
      return;
    }
    const newValue = selected === itemValue && enableDeselect ? 0 : itemValue;
    updateRating(newValue, event);
  };

  const isTopLeft = labelPlacement === "top" || labelPlacement === "left";
  const label = getSemanticLabels(currentHoveredIndex || selected);

  const displayLabel = getLabel && (
    <div id={labelId} className={clsx(withBaseName("label"), withBaseName(`label-${labelPlacement}`))}>
      {label}
    </div>
  );

  return (
    <div
      ref={handleWrapperRef}
      className={clsx(
        withBaseName("wrapper"),
        withBaseName(`wrapper-${labelPlacement}`),
        className
      )}
      {...restProps}
    >
      <div aria-live="polite" aria-atomic="true" className="salt-visuallyHidden">
        {selected === 0 ? "Rating cleared" : `Rating updated to ${getSemanticLabels(selected)}`}
      </div>
      {isTopLeft && displayLabel}
      <div
        role="radiogroup"
        className={withBaseName("container")}
        ref={wrapperRef}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        aria-labelledby={
          clsx(
            getLabel && labelId,
            formFieldLabelledBy,
            ariaLabelledBy
          ) || undefined
        }
        aria-describedby={
          clsx(formFieldDescribedBy, ariaDescribedBy) || undefined
        }
      >
        {Array.from({ length: max }, (_, index) => {
          const itemValue = index + 1;
          const isHovered = currentHoveredIndex > 0 && itemValue <= currentHoveredIndex;
          const isFocusable = itemValue === selected || (selected === 0 && itemValue === 1);
          const isSelected = currentHoveredIndex === 0 && itemValue <= selected;
          const isActive = currentHoveredIndex > 0 && 
                          itemValue > currentHoveredIndex && 
                          itemValue <= selected;
          return (
            <RatingItem
              currentRating={selected}
              isHovered={isHovered}
              isFocusable={isFocusable}
              isSelected={isSelected}
              isActive={isActive}
              onHover={handleMouseHover(itemValue)}
              onClick={handleClick(itemValue)}
              value={itemValue}
              key={itemValue}
              readOnly={readOnly}
              disabled={disabled}
              character={character}
              strongIcon={<FavoriteStrongIcon />}
              filledIcon={<FavoriteSolidIcon />}
              emptyIcon={<FavoriteEmptyIcon />}
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
