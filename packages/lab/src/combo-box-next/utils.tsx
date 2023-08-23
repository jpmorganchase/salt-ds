import { ListItemNext, ListItemNextProps } from "../list-next";
import { Highlighter } from "../list";
import { forwardRef } from "react";

export const defaultFilter = (source: string[], filterValue?: string) =>
  source.filter((item: string) =>
    !filterValue ? item : item.toLowerCase().includes(filterValue.toLowerCase())
  );

export interface ComboBoxItemProps<T> extends Omit<ListItemNextProps, "value"> {
  value: T;
  matchPattern?: RegExp | string;
}
export const DefaultListItem = forwardRef(function DefaultListItem({
  value,
  matchPattern,
  onMouseDown,
  ...rest
}: ComboBoxItemProps<string>) {
  return (
    <ListItemNext value={value} onMouseDown={onMouseDown} {...rest}>
      <Highlighter matchPattern={matchPattern} text={value} />
    </ListItemNext>
  );
});
