import { ListItemNext } from "../list-next";
import { Highlighter } from "../list";
import { SyntheticEvent } from "react";

export const defaultFilter = (source: string[], filterValue?: string) =>
  source.filter((item: string) =>
    !filterValue ? item : item.toLowerCase().includes(filterValue.toLowerCase())
  );

export interface ComboBoxDefaultItemProps {
  value: string;
  matchPattern?: RegExp | string;
  onMouseDown?: (event: SyntheticEvent<HTMLLIElement>) => void;
}

export const DefaultListItem = ({
  value,
  matchPattern,
  onMouseDown,
  ...rest
}: ComboBoxDefaultItemProps) => {
  return (
    <ListItemNext value={value} onMouseDown={onMouseDown} {...rest}>
      <Highlighter matchPattern={matchPattern} text={value} />
    </ListItemNext>
  );
};
