import { ListItemNext } from "../list-next";
import { Highlighter } from "../list";
import { MouseEvent } from "react";

export const defaultFilter = (source: string[], filterValue?: string) =>
  source.filter((item) =>
    !filterValue ? item : item.toLowerCase().includes(filterValue.toLowerCase())
  );

export const defaultItemRenderer = (
  key: number,
  value: string,
  matchPattern?: RegExp | string,
  onMouseDown?: (event: MouseEvent<HTMLLIElement>) => void
) => {
  return (
    <ListItemNext value={value} key={key} onMouseDown={onMouseDown}>
      <Highlighter matchPattern={matchPattern} text={value} />
    </ListItemNext>
  );
};
