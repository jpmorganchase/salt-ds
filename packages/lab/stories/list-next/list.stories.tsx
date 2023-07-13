import { ComponentMeta, Story } from "@storybook/react";
import { ListItemNext, ListNext, ListNextProps } from "../../src";
import { Button, FlexLayout } from "@salt-ds/core";
import { useState } from "react";
import { usStateExampleData } from "../assets/exampleData";
import { ArrowDownIcon, ArrowUpIcon } from "@salt-ds/icons";

export default {
  title: "Lab/List Next",
  component: ListNext,
} as ComponentMeta<typeof ListNext>;

const getListItems = ({ disabledItems = [] }: { disabledItems?: number[] }) =>
  usStateExampleData.map((item, index) => {
    return (
      <ListItemNext
        key={index}
        disabled={disabledItems.includes(index)}
        id={`controlled-list-item-${index}`}
        value={item}
      >
        {item}
      </ListItemNext>
    );
  });

export const Default: Story<ListNextProps> = ({ children, ...rest }) => {
  return (
    <ListNext
      {...rest}
      aria-label="Declarative List example"
      style={{ height: "150px" }}
    >
      {children ||
        getListItems({
          disabledItems: [1, 5],
        })}
    </ListNext>
  );
};

Default.args = {};

export const Controlled: Story<ListNextProps> = ({ children, ...rest }) => {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    undefined
  );

  const handleArrowDown = () => {
    setHighlightedIndex((prevHighlightedIndex) =>
      Math.min(usStateExampleData.length - 1, prevHighlightedIndex + 1)
    );
  };

  const handleArrowUp = () => {
    setHighlightedIndex((prevHighlightedIndex) =>
      Math.max(0, prevHighlightedIndex - 1)
    );
  };

  const handleSelect = () => {
    setSelectedItem(usStateExampleData[highlightedIndex] || undefined);
  };

  const handleClick = (index: number) => {
    setSelectedItem(usStateExampleData[index]);
    setHighlightedIndex(index);
  };

  return (
    <FlexLayout direction="column" gap={0}>
      <FlexLayout>
        <Button
          disabled={highlightedIndex === usStateExampleData.length - 1}
          onClick={handleArrowDown}
        >
          <ArrowDownIcon />
        </Button>
        <Button disabled={highlightedIndex <= 0} onClick={handleArrowUp}>
          <ArrowUpIcon />
        </Button>
        <Button onClick={handleSelect}>Select</Button>
      </FlexLayout>
      <ListNext
        {...rest}
        aria-label="Controlled List example"
        selected={selectedItem}
        highlightedIndex={highlightedIndex}
        style={{ height: "150px" }}
      >
        {usStateExampleData.map((item, index) => {
          return (
            <ListItemNext
              key={index}
              onClick={() => handleClick(index)}
              value={item}
            >
              {item}
            </ListItemNext>
          );
        })}
      </ListNext>
    </FlexLayout>
  );
};

export const Disabled = Default.bind({});
Disabled.args = {
  disabled: true,
};

export const DisabledSelected = Default.bind({});
DisabledSelected.args = {
  defaultSelected: "Alaska",
};

export const Empty: Story<ListNextProps> = ({ children, ...rest }) => {
  const [showList, setShowList] = useState(false);
  const listItems = showList
    ? getListItems({
        disabledItems: [1, 5],
      })
    : [];

  return (
    <FlexLayout direction="column" style={{ height: "200px" }}>
      <Button onClick={() => setShowList(!showList)}>Toggle list</Button>

      {listItems.length > 0 ? (
        <ListNext {...rest} aria-label="Populated List example">
          {listItems}
        </ListNext>
      ) : (
        <div>List is empty</div>
      )}
    </FlexLayout>
  );
};
