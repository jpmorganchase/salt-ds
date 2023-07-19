import { clsx } from "clsx";
import { memo, MutableRefObject, useRef } from "react";
import { makePrefixer, useIsomorphicLayoutEffect } from "@salt-ds/core";
import { getWidth } from "./useWidth";
import { Pill, PillProps } from "../../pill";

const withBaseName = makePrefixer("saltInputPill");

export type InputPillProps = Omit<PillProps, "onClose"> & {
  /**
   * An ref object holds pills index map to width.
   */
  pillsRef: MutableRefObject<{ [index: number]: number | undefined }>;
  /**
   * Index of the pill within Input.
   */
  index: number;
  /**
   * Whether the pill is the last visible one within Input.
   */
  lastVisible?: boolean;
  /**
   * Whether the pill is highlighted.
   */
  highlighted?: boolean;
  /**
   * Whether the pill is active.
   */
  active?: boolean;
  /**
   * Callback when pill is deleted.
   */
  onClose?: (index: number) => void;
};

export const InputPill = memo(function InputPill(props: InputPillProps) {
  const {
    active,
    className,
    disabled,
    hidden,
    highlighted,
    index,
    lastVisible,
    onClose,
    pillsRef,
    tabIndex: tabIndexProp,
    ...restProps
  } = props;

  const ref = useRef<HTMLDivElement | null>(null);
  const isRemovable = Boolean(onClose);

  // useLayoutEffect to match the calcFirstHiddenIndex in TokenizedInputBase
  // We need to collect widths before the calculation
  useIsomorphicLayoutEffect(() => {
    if (!isRemovable && pillsRef.current) {
      pillsRef.current[index] = getWidth(ref.current);
    }
  }, [pillsRef, index, isRemovable, lastVisible]);

  useIsomorphicLayoutEffect(
    () => () => {
      pillsRef.current[index] = undefined;
    },
    [pillsRef, index]
  );

  return (
    <Pill
      className={clsx(
        withBaseName(),
        {
          [withBaseName("pillActive")]: active || highlighted,
          [withBaseName("pillLastVisible")]: lastVisible,
        },
        className
      )}
      disabled={disabled}
      ref={ref}
      role="option"
      tabIndex={undefined}
      {...restProps}
    />
  );
});
