import {
  CSSProperties,
  FC,
  MouseEventHandler,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { ChevronRightIcon } from "@jpmorganchase/uitk-icons";
import { ListItem } from "../../list";
import { QueryInputCategory } from "../QueryInput";
import { useCategoryListContext } from "./CategoryListContext";

const withBaseName = makePrefixer("uitkCategoryListItem");

export interface CategoryListItemProps {
  category: QueryInputCategory;
  index: number;
  onMouseMove: (category: QueryInputCategory, index: number) => void;
}

export const CategoryListItem: FC<CategoryListItemProps> =
  function CategoryListItem(props) {
    const textRef = useRef<HTMLDivElement>(null);
    const context = useCategoryListContext();
    const { category, index } = props;

    const textStyle: CSSProperties = useMemo(
      () => ({
        minWidth: context.width,
      }),
      [context.width]
    );

    const onMouseMove: MouseEventHandler = useCallback(() => {
      props.onMouseMove(category, index);
    }, [props.onMouseMove, category, index]);

    return (
      <ListItem item={category} onMouseMove={onMouseMove}>
        <div ref={textRef} className={withBaseName("text")} style={textStyle}>
          {category.name}
        </div>
        <div className={withBaseName("valuesContainer")}>
          <span>(</span>
          <span className={withBaseName("values")}>
            {category.values.join(", ")}
          </span>
          <span>)</span>
        </div>
        <ChevronRightIcon className={withBaseName("chevron")} />
      </ListItem>
    );
  };
