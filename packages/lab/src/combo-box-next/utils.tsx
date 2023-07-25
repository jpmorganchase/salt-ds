import { ListItemNext } from "../list-next";
import { Highlighter } from "../list";

export const defaultFilter = (source: string[], filterValue?: string) =>
  source.filter((item) =>
    !filterValue ? item : item.toLowerCase().includes(filterValue.toLowerCase())
  );

export const defaultItemRenderer = (
  key: number,
  value: string,
  matchPattern?: RegExp | string
) => {
  return (
    <ListItemNext value={value} key={key}>
      <Highlighter matchPattern={matchPattern} text={value} />
    </ListItemNext>
  );
};
