import { makePrefixer } from "@salt-ds/core";
import { ChevronLeftIcon } from "@salt-ds/icons";
import type { Dispatch, ReactElement, SetStateAction } from "react";
import type { SelectHandler } from "../../common-hooks";
import { List, ListItem } from "../../list";
import type { QueryInputCategory } from "../queryInputTypes";

const withBaseName = makePrefixer("saltQueryInputValueList");

export interface ValueListProps {
  category: QueryInputCategory | null;
  rootWidth: number;
  onBack: () => void;
  selectedValues: string[];
  onValueToggle: (category: QueryInputCategory, value: string) => void;
  highlightedValueIndex?: number;
  setHighlightedValueIndex: Dispatch<SetStateAction<number>>;
}

export function ValueList(props: ValueListProps) {
  const {
    category,
    rootWidth,
    onBack,
    selectedValues,
    onValueToggle,
    highlightedValueIndex,
    setHighlightedValueIndex,
  } = props;

  const handleSelect: SelectHandler = (_, value: string) => {
    onValueToggle(category!, value);
  };

  const items: ReactElement[] = category
    ? category.values.map((value) => (
        <ListItem key={value} item={value}>
          {value}
        </ListItem>
      ))
    : [];

  return (
    <div className={withBaseName()} tabIndex={0} data-testid="value-list">
      <List
        borderless={true}
        checkable={false}
        highlightedIndex={highlightedValueIndex}
        onHighlight={setHighlightedValueIndex}
        onSelect={handleSelect}
        selectionStrategy="multiple"
        selected={selectedValues}
        width={rootWidth}
      >
        <ListItem
          className={withBaseName("back")}
          onClick={onBack}
          selectable={false}
        >
          <ChevronLeftIcon />
          <div className={withBaseName("category")}>
            {category ? category.name : ""}
          </div>
        </ListItem>
        {items}
      </List>
    </div>
  );
}
