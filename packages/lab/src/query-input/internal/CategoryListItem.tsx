import { CSSProperties, useMemo, useRef } from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { ChevronRightIcon } from "@jpmorganchase/uitk-icons";
import { ListItem as ListItem, ListItemProps, ListItemType } from "../../list";
import { QueryInputCategory } from "../queryInputTypes";
import { useCategoryListContext } from "./CategoryListContext";

const withBaseName = makePrefixer("uitkCategoryListItem");

export interface CategoryListItemProps
  extends ListItemProps<QueryInputCategory> {
  category: QueryInputCategory;
}

export const CategoryListItem: ListItemType<QueryInputCategory> =
  function CategoryListItem({ item: category, ...props }) {
    const textRef = useRef<HTMLDivElement>(null);
    const context = useCategoryListContext();

    const textStyle: CSSProperties = useMemo(
      () => ({
        minWidth: context.width,
      }),
      [context.width]
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
        <ChevronRightIcon className={withBaseName("chevron")} />
      </ListItem>
    );
  };
