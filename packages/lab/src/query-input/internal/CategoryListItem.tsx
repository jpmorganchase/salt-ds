import { makePrefixer, useIcon } from "@salt-ds/core";
import { type CSSProperties, useMemo, useRef } from "react";
import { ListItem, type ListItemProps, type ListItemType } from "../../list";
import type { QueryInputCategory } from "../queryInputTypes";
import { useCategoryListContext } from "./CategoryListContext";

const withBaseName = makePrefixer("saltCategoryListItem");

export interface CategoryListItemProps
  extends ListItemProps<QueryInputCategory> {
  category: QueryInputCategory;
}

export const CategoryListItem: ListItemType<QueryInputCategory> =
  function CategoryListItem({ item: category, ...props }) {
    const textRef = useRef<HTMLDivElement>(null);
    const context = useCategoryListContext();
    const { ExpandGroupIcon } = useIcon();
    const textStyle: CSSProperties = useMemo(
      () => ({
        minWidth: context.width,
      }),
      [context.width],
    );

    return (
      <ListItem {...props} label={category?.name}>
        <div ref={textRef} className={withBaseName("text")} style={textStyle}>
          {category?.name}
        </div>
        <div className={withBaseName("valuesContainer")}>
          <span>(</span>
          <span className={withBaseName("values")}>
            {category?.values.join(", ")}
          </span>
          <span>)</span>
        </div>
        <ExpandGroupIcon className={withBaseName("chevron")} />
      </ListItem>
    );
  };
