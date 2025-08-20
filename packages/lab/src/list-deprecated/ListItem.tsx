import { type ForwardedRef, forwardRef, type ReactElement } from "react";
import { useDescendant } from "./internal/DescendantContext";
import { isPlainObject } from "./internal/helpers";
import { ListItemBase, type ListItemBaseProps } from "./ListItemBase";
import { useListItem } from "./useListItem";

export interface ListItemProps<Item = string>
  extends Omit<
    ListItemBaseProps,
    "focusVisible" | "highlighted" | "selected" | "tooltipText"
  > {
  item?: Item;
  itemToString?: (item: Item) => string;
}

function ListItem<Item = string>(
  props: ListItemProps<Item>,
  ref?: ForwardedRef<HTMLDivElement>,
) {
  const {
    children,
    item = props.item === undefined && !isPlainObject(children)
      ? (children as unknown as Item)
      : props.item,
    ...restProps
  } = props;

  const { itemToString, itemProps } = useListItem({
    index: useDescendant(item),
    item,
    ...restProps,
  });

  const itemText = itemToString(item as Item);

  return (
    <ListItemBase tooltipText={itemText} {...itemProps} ref={ref}>
      {children !== undefined ? children : itemText}
    </ListItemBase>
  );
}

// `const` could not be generic, but we has to use `forwardRef` so that React would use the component correctly..?
// So we have to override the type definition of forwardRef to be our own
type GenericListItem = <Item = string>(
  p: ListItemProps<Item> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement<ListItemProps<Item>>;

const _ListItem = forwardRef(ListItem) as GenericListItem;

export { _ListItem as ListItem };
