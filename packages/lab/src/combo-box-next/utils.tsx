import { ListItemNext } from "../list-next";
import { Highlighter } from "../list";
import { SyntheticEvent } from "react";

export const defaultFilter = (source: string[], filterValue?: string) =>
  source.filter((item: string) =>
    !filterValue ? item : item.toLowerCase().includes(filterValue.toLowerCase())
  );

export const defaultItemRenderer = (
  key: number,
  value: string,
  matchPattern?: RegExp | string,
  onMouseDown?: (event: SyntheticEvent<HTMLLIElement>) => void
) => {
  return (
    <ListItemNext value={value} key={key} onMouseDown={onMouseDown}>
      <Highlighter matchPattern={matchPattern} text={value} />
    </ListItemNext>
  );
};
