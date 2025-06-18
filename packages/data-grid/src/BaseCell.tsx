import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import baseCellCss from "./BaseCell.css";
import { CellFrame } from "./CellFrame";
import { CornerTag } from "./CornerTag";
import type { GridColumnModel } from "./Grid";
import type { GridCellProps } from "./GridColumn";
import { Cursor, useFocusableContent } from "./internal";
import {
  CellErrorIcon,
  CellSuccessIcon,
  CellWarningIcon,
} from "./internal/CellStatusIcons";

const withBaseName = makePrefixer("saltGridBaseCell");

export function getCellId<T>(rowKey: string, column: GridColumnModel<T>) {
  return `R${rowKey}C${column.info.props.id}`;
}

const icons = {
  warning: CellWarningIcon,
  error: CellErrorIcon,
  success: CellSuccessIcon,
};

// Default component for grid cells. Provides selection, on-hover highlighting,
// cursor etc.
export function BaseCell<T>(props: GridCellProps<T>) {
  const {
    column,
    className,
    row,
    style,
    isFocused,
    isSelected,
    isEditable,
    children,
    validationStatus,
    validationMessage,
    validationType = "light",
    align,
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-base-cell",
    css: baseCellCss,
    window: targetWindow,
  });

  const { ref, isFocusableContent, onFocus } =
    useFocusableContent<HTMLTableCellElement>();
  const cellId = getCellId(row.key, column);
  const hasValidation = !!validationStatus;
  const hasValidationMessage = !!validationMessage || hasValidation;
  const validationMessageId = `${cellId}-statusMessage`;
  return (
    <CellFrame
      ref={ref}
      id={cellId}
      data-row-index={row.index}
      data-column-index={column.index}
      data-testid={isFocused ? "grid-cell-focused" : undefined}
      // aria-colindex uses one-based array indexing
      aria-colindex={column.index + 1}
      role="gridcell"
      separator={column.separator}
      isSelected={isSelected}
      isEditable={isEditable}
      className={clsx(className, {
        [withBaseName("hasValidation")]: hasValidation,
        [withBaseName(`status-${validationStatus as string}`)]:
          validationStatus,
      })}
      style={style}
      tabIndex={isFocused && !isFocusableContent ? 0 : -1}
      onFocus={onFocus}
      aria-invalid={validationStatus === "error" || undefined}
      aria-describedby={hasValidationMessage ? validationMessageId : undefined}
    >
      {hasValidationMessage ? (
        <div
          id={validationMessageId}
          className="salt-visuallyHidden"
          aria-hidden
          role="status"
        >
          {validationMessage
            ? validationMessage
            : `Cell validation state is ${validationStatus as string}`}
        </div>
      ) : null}
      <div className={clsx(withBaseName("valueContainer"))}>{children}</div>
      {hasValidation && validationType === "strong" ? (
        <div
          className={clsx(withBaseName("statusContainer"), {
            [withBaseName(`statusContainer-align-${align as string}`)]: align,
          })}
        >
          {icons[validationStatus]}
        </div>
      ) : null}
      {isFocused && isEditable && <CornerTag focusOnly={true} />}
      {isFocused && !isFocusableContent && <Cursor />}
    </CellFrame>
  );
}
