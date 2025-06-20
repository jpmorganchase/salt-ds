import {
  makePrefixer,
  Pill,
  type PillProps,
  Tooltip,
  useIcon,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type MutableRefObject,
  memo,
  type SyntheticEvent,
  useRef,
  useState,
} from "react";
import inputPillCss from "./InputPill.css";
import { getWidth } from "./useWidth";

const withBaseName = makePrefixer("saltInputPill");

export type InputPillProps = PillProps & {
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

  const { CloseIcon } = useIcon();
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
    [pillsRef, index],
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
          className,
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
