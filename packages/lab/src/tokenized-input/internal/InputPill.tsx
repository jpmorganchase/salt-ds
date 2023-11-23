import { clsx } from "clsx";
import { memo, MutableRefObject, useEffect, useRef, useState } from "react";
import {
  makePrefixer,
  Tooltip,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { getWidth } from "./useWidth";
import { PillNext, PillNextProps } from "../../pill-next";

const withBaseName = makePrefixer("saltInputPill");

export type InputPillProps = PillNextProps & {
  /**
   * An ref object holds pills index map to width.
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
  onClose?: (index: number) => void;
};

export const InputPill = memo(function InputPill(props: InputPillProps) {
  const {
    className,
    hidden,
    highlighted,
    index,
    lastVisible,
    label,
    onClose,
    pillsRef,
    ...rest
  } = props;

  const ref = useRef<HTMLButtonElement | null>(null);
  const [isEllipsisActive, setEllipsisActive] = useState(false);
  const isRemovable = Boolean(onClose);

  // useLayoutEffect to match the calcFirstHiddenIndex in TokenizedInputBase
  // We need to collect widths before the calculation
  useIsomorphicLayoutEffect(() => {
    const text = ref?.current?.firstElementChild as HTMLElement;
    if (!isRemovable && pillsRef.current) {
      pillsRef.current[index] = getWidth(ref.current);
    }
    setEllipsisActive(text?.offsetWidth < text?.scrollWidth);
  }, [pillsRef, index, isRemovable, lastVisible]);

  useIsomorphicLayoutEffect(
    () => () => {
      pillsRef.current[index] = undefined;
    },
    [pillsRef, index]
  );

  const handleClose = () => {
    onClose?.(index);
  };

  return (
    <Tooltip content={label} disabled={!isEllipsisActive}>
      <PillNext
        className={clsx(
          withBaseName(),
          {
            [withBaseName("pillHighlighted")]: highlighted,
            // TODO: can this be avoid by passing the close button to end adornment?
            [withBaseName("pillLastVisible")]: lastVisible,
            [withBaseName("hidden")]: hidden,
          },
          className
        )}
        // todo: we need to  be able to ignore tab to on close button
        tabIndex={-1}
        onClose={isRemovable ? handleClose : undefined}
        ref={ref}
        role="option"
        {...rest}
      >
        {label}
      </PillNext>
    </Tooltip>
  );
});
