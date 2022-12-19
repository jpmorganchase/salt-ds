import { QueryInputCategory } from "../queryInputTypes";
import { Dispatch, ReactElement, SetStateAction } from "react";
import { makePrefixer } from "@salt-ds/core";
import { ChevronLeftIcon } from "@salt-ds/icons";
import { List, ListItem } from "../../list";
import { SelectHandler } from "../../common-hooks";

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
