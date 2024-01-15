import { clsx } from "clsx";
import {ComponentPropsWithoutRef, memo, MutableRefObject, useRef} from "react";
import { Pill, makePrefixer, useIsomorphicLayoutEffect } from "@salt-ds/core";
import { getWidth } from "./useWidth";
import {CloseIcon} from "@salt-ds/icons";

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
   * Pill label.
   */
  label?: string;
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
  onDelete?: (index: number) => void;
};

export const InputPill = memo(function InputPill(props: InputPillProps) {
  const {
    active,
    className,
    disabled,
    label,
    hidden,
    highlighted,
    index,
    lastVisible,
    onDelete,
    pillsRef,
    ...restProps
  } = props;

  const ref = useRef<HTMLButtonElement | null>(null);
  const isRemovable = Boolean(onDelete);

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

  const handleDelete = () => {
    onDelete?.(index);
  };

  return (
    <Pill
      className={clsx(
        withBaseName(),
        {
          [withBaseName("pillActive")]: active || highlighted,
          [withBaseName("pillLastVisible")]: lastVisible,
          [withBaseName("hidden")]: hidden,
        },
        className
      )}
      disabled={disabled}
      onClick={isRemovable ? handleDelete : undefined}
      ref={ref}
      role="option"
      //  style={useMemo(() => ({ maxWidth }), [maxWidth])}
      tabIndex={undefined}
      {...restProps}
    >
      {label}
      {isRemovable && <CloseIcon />}
    </Pill>
  );
});
