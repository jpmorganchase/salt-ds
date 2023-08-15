import { ListItemNext, ListItemNextProps } from "../list-next";
import { Highlighter } from "../list";

export const defaultFilter = (source: string[], filterValue?: string) =>
  source.filter((item: string) =>
    !filterValue ? item : item.toLowerCase().includes(filterValue.toLowerCase())
  );

export interface ComboBoxDefaultItemProps extends ListItemNextProps {
  matchPattern?: RegExp | string;
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
