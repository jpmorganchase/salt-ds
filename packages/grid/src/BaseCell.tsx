import { clsx } from "clsx";
import "./BaseCell.css";
import { makePrefixer } from "@salt-ds/core";
import { GridCellProps } from "./GridColumn";
import { GridColumnModel } from "./Grid";
import { Cell, Cursor, useFocusableContent } from "./internal";
import { CornerTag } from "./CornerTag";

const withBaseName = makePrefixer("saltGridBaseCell");

export function getCellId<T>(rowKey: string, column: GridColumnModel<T>) {
  return `R${rowKey}C${column.info.props.id}`;
}

const noop = () => undefined;
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
    getValidationStatus = noop,
    getValidationMessage = noop,
    value,
  } = props;

  const { ref, isFocusableContent, onFocus } =
    useFocusableContent<HTMLTableCellElement>();
  const validationFnArg = {
    row,
    column,
    isFocused,
    value,
  };
  const validationStatus = getValidationStatus(validationFnArg);
  const validationMessage = getValidationMessage(validationFnArg);
  const cellId = getCellId(row.key, column);
  const hasValidationMessage =
    validationMessage || (validationStatus && validationStatus !== "none");
  const validationMessageId = `${cellId}-statusMessage`;
  return (
    <Cell
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
      className={className}
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
        >
          {validationMessage
            ? validationMessage
            : `Cell validation state is ${validationStatus as string}`}
        </div>
      ) : null}
      <div
        role="status"
        className={clsx(withBaseName("valueContainer"), {
          [withBaseName(`valueContainer-status-${validationStatus as string}`)]:
            validationStatus,
        })}
      >
        {children}
      </div>
      {isFocused && isEditable && <CornerTag focusOnly={true} />}
      {isFocused && !isFocusableContent && <Cursor />}
    </Cell>
  );
}
