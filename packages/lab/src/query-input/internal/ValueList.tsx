import { QueryInputCategory } from "../QueryInput";
import {
  Dispatch,
  FC,
  MouseEventHandler,
  ReactElement,
  SetStateAction,
} from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { ChevronLeftIcon } from "@jpmorganchase/icons";
import { List, ListItem } from "../../list";

const withBaseName = makePrefixer("uitkQueryInputValueList");

export interface ValueListProps {
  category: QueryInputCategory | null;
  rootWidth: number;
  onBack: () => void;
  selectedValues: string[];
  onValueToggle: (category: QueryInputCategory, value: string) => void;
  highlightedValueIndex?: number;
  setHighlightedValueIndex: Dispatch<SetStateAction<number>>;
}

export interface ValueListItemProps {
  value: string;
  onClick: (value: string) => void;
  onMouseMove: (value: string) => void;
}

export const ValueListItem: FC<ValueListItemProps> = (props) => {
  const { value } = props;

  const onClick = () => {
    props.onClick(value);
  };

  const onMouseMove: MouseEventHandler = (event) => {
    props.onMouseMove(value);
  };

  return (
    <ListItem item={value} onClick={onClick} onMouseMove={onMouseMove}>
      {value}
    </ListItem>
  );
};

export const ValueList: FC<ValueListProps> = function ValueList(props) {
  const {
    category,
    rootWidth,
    onBack,
    selectedValues,
    onValueToggle,
    highlightedValueIndex,
    setHighlightedValueIndex,
  } = props;

  const onItemClick = (value: string) => {
    onValueToggle(category!, value);
  };

  const onBackMouseMove = () => {
    setHighlightedValueIndex(0);
  };

  const onMouseMove = (value: string) => {
    const index = category?.values.indexOf(value);
    if (index != undefined) {
      setHighlightedValueIndex(index + 1);
    }
  };

  const items: ReactElement[] = category
    ? category.values.map((value) => (
        <ValueListItem
          key={value}
          value={value}
          onClick={onItemClick}
          onMouseMove={onMouseMove}
        >
          {value}
        </ValueListItem>
      ))
    : [];

  return (
    <div className={withBaseName()} tabIndex={0} data-testid="value-list">
      <List
        selectionVariant="multiple"
        selectedItem={selectedValues}
        width={rootWidth}
        borderless={true}
        highlightedIndex={highlightedValueIndex}
      >
        <ListItem
          className={withBaseName("back")}
          onMouseMove={onBackMouseMove}
        >
          <ChevronLeftIcon />
          <div className={withBaseName("category")} onClick={onBack}>
            {category ? category.name : ""}
          </div>
        </ListItem>
        {items}
      </List>
    </div>
  );
};
