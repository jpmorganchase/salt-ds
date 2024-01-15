import { clsx } from "clsx";
import {
  ComponentPropsWithoutRef,
  memo,
  MutableRefObject,
  SyntheticEvent,
  useRef,
  useState,
} from "react";
import {
  makePrefixer,
  Pill,
  Tooltip,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { getWidth } from "./useWidth";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import inputPillCss from "./InputPill.css";
import { CloseIcon } from "@salt-ds/icons";

const withBaseName = makePrefixer("saltInputPill");

export type InputPillProps = ComponentPropsWithoutRef<"button"> & {
  /**
   * A ref object holds pills index map to width.
   */
  pillsRef: MutableRefObject<Record<number, number | undefined>>;
  /**
   * Index of the pill within Input.
   */
  index: number;
  /**
   * Whether the pill is the last visible one within Input.
   */
  lastVisible?: boolean;
  /**
   * Pill label.
   */
  label?: string;
  /**
   * Whether the pill is highlighted.
   */
  highlighted?: boolean;

  /**
   * Callback when pill is deleted.
   */
  onClose?: (event: SyntheticEvent, index: number) => void;
};

export const InputPill = memo(function InputPill(props: InputPillProps) {
  const {
    className,
    hidden,
    highlighted,
    index,
    label,
    onClose,
    pillsRef,
    ...rest
  } = props;
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-input-pill",
    css: inputPillCss,
    window: targetWindow,
  });

  const ref = useRef<HTMLButtonElement | null>(null);
  const [isEllipsisActive, setEllipsisActive] = useState(false);
  const isRemovable = Boolean(onClose);

  // useIsomorphicLayoutEffect to match the calcFirstHiddenIndex
  // We need to collect widths before the calculation
  useIsomorphicLayoutEffect(() => {
    const text = ref?.current?.firstElementChild as HTMLElement;
    if (!isRemovable && pillsRef.current) {
      pillsRef.current[index] = getWidth(ref.current);
    }
    setEllipsisActive(text?.offsetWidth < text?.scrollWidth);
  }, [pillsRef, index, isRemovable]);

  useIsomorphicLayoutEffect(
    () => () => {
      pillsRef.current[index] = undefined;
    },
    [pillsRef, index]
  );

  const handleClose = (event: SyntheticEvent) => {
    onClose?.(event, index);
  };
  return (
    <Tooltip content={label} disabled={!isEllipsisActive}>
      <Pill
        className={clsx(
          withBaseName(),
          {
            [withBaseName("pillHighlighted")]: highlighted,
            [withBaseName("expanded")]: isRemovable,
            [withBaseName("hidden")]: hidden,
          },
          className
        )}
        tabIndex={-1}
        onClick={isRemovable ? handleClose : undefined}
        ref={ref}
        role="option"
        {...rest}
      >
        <span className={withBaseName("label")}>{label}</span>
        {isRemovable && <CloseIcon />}
      </Pill>
    </Tooltip>
  );
});
