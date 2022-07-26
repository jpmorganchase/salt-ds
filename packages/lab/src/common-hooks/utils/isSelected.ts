import { CollectionItem } from "../collectionTypes";

export function isSelected<Item>(
  selected: CollectionItem<Item> | CollectionItem<Item>[] | null,
  item: CollectionItem<Item>
): boolean {
  const isSelected = Array.isArray(selected)
    ? selected.includes(item)
    : selected === item;
  return isSelected;
  // return Array.isArray(selected) ? selected.includes(item) : selected === item;
}
