import {
  CSSProperties,
  memo,
  MutableRefObject,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import classnames from "classnames";
import { makePrefixer } from "@brandname/core";
import { Pill, PillProps } from "../../pill";

import { getWidth } from "./useWidth";

const withBaseName = makePrefixer("uitkInputPill");

export type InputPillProps = Omit<
  PillProps<"basic" | "closable">,
  "variant" | "onDelete" | "clickable"
> & {
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
   * Max width of the pill to be applied to `style`.
   */
  maxWidth?: CSSProperties["maxWidth"];
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
    hidden,
    highlighted,
    index,
    lastVisible,
    onDelete,
    pillsRef,
    tabIndex: tabIndexProp,
    // TODO: Style API. Shall we remove this API in favor of directly use `style`
    maxWidth,
    ...restProps
  } = props;

  const ref = useRef<HTMLDivElement | null>(null);
  const isRemovable = Boolean(onDelete);

  // useLayoutEffect to match the calcFirstHiddenIndex in TokenizedInputBase
  // We need to collect widths before the calculation
  useLayoutEffect(() => {
    if (!isRemovable && pillsRef.current) {
      pillsRef.current[index] = getWidth(ref.current);
    }
  }, [pillsRef, index, isRemovable, lastVisible]);

  useLayoutEffect(
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
      className={classnames(
        withBaseName(),
        {
          [withBaseName("pillActive")]: active || highlighted,
          [withBaseName("pillLastVisible")]: lastVisible,
          [withBaseName("hidden")]: hidden,
        },
        className
      )}
      disabled={disabled}
      onDelete={isRemovable ? handleDelete : undefined}
      ref={ref}
      role="option"
      style={useMemo(() => ({ maxWidth }), [maxWidth])}
      tabIndex={undefined}
      variant={isRemovable ? "closable" : "basic"}
      {...restProps}
    />
  );
});
