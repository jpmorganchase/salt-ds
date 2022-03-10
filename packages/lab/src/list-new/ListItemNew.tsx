import {
  ComponentType,
  forwardRef,
  HTMLAttributes,
  MouseEventHandler,
  useEffect,
  useRef,
} from "react";

import cn from "classnames";
import { useListContextNew } from "./ListContextNew";
import { ListItemModelNew } from "./ListModelNew";
import { makePrefixer } from "@brandname/core";
import { useForkRef } from "../utils";

const withBaseName = makePrefixer("uitkListItemNew");

export interface ListItemNewProps<G = any, T = any>
  extends HTMLAttributes<HTMLDivElement> {
  itemModel: ListItemModelNew;
  itemComponent?: ComponentType<{ index: number; sourceItem: T }>;
  groupComponent?: ComponentType<{ index: number; groupItem: G }>;
  isSticky?: boolean;
  measureSize?: boolean;
}

const DefaultItemComponent = function DefaultItemComponent<T>(props: {
  index: number;
  sourceItem: T;
}) {
  return <span>{String(props.sourceItem)}</span>;
};

const DefaultGroupComponent = function DefaultGroupComponent<G>(props: {
  index: number;
  groupItem: G;
}) {
  return <span>{String(props.groupItem)}</span>;
};

export const ListItemNew = forwardRef<HTMLDivElement, ListItemNewProps>(
  function ListItemNew(props, externalRef) {
    const {
      itemModel,
      className,
      itemComponent,
      groupComponent,
      isSticky,
      measureSize,
      ...restProps
    } = props;
    const { listModel } = useListContextNew();
    const isHighlighted = itemModel.useIsHighlighted();
    const isSelected = itemModel.useIsSelected();
    const sourceItem = itemModel.useSourceItem();
    const rootRef = useRef<HTMLDivElement>(null);
    const ref = useForkRef(rootRef, externalRef);

    const onMouseEnter: MouseEventHandler = (event) => {
      listModel.onListItemMouseEnter({ listItemIndex: itemModel.index });
    };

    const onMouseDown: MouseEventHandler = (event) => {
      listModel.onSelect({
        listItemIndex: itemModel.index,
        clearPrevious: !event.metaKey,
      });
    };

    const ItemComponent = itemComponent || DefaultItemComponent;
    const GroupComponent = groupComponent || DefaultGroupComponent;

    useEffect(() => {
      if (rootRef.current && measureSize) {
        const height = rootRef.current.clientHeight;
        const width = rootRef.current.clientWidth;
        listModel.setItemSize({ height, width });
      }
    }, [rootRef.current, measureSize]);

    return (
      <div
        className={cn(className, withBaseName(), {
          [withBaseName("highlighted")]: isHighlighted && !isSelected,
          [withBaseName("group")]: itemModel.isGroup,
          [withBaseName("sticky")]: isSticky,
          [withBaseName("regular")]: !isSticky,
          [withBaseName("selected")]: isSelected,
        })}
        ref={ref}
        {...restProps}
        onMouseEnter={onMouseEnter}
        onMouseDown={onMouseDown}
      >
        {itemModel.isGroup ? (
          <GroupComponent groupItem={sourceItem} index={itemModel.index} />
        ) : (
          <ItemComponent sourceItem={sourceItem} index={itemModel.index} />
        )}
      </div>
    );
  }
);
