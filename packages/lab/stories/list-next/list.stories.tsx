import { ComponentMeta, Story } from "@storybook/react";
import { ListNext, ListItemNext, ListNextProps } from "../../src";
import { Button, FlexItem, FlexLayout } from "@salt-ds/core";
import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";
import {useEffect, useState} from "react";

export default {
  title: "Lab/List Next",
  component: ListNext,
} as ComponentMeta<typeof ListNext>;

const SimpleListExample = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
];

const getListItems = ({disabledItems}) =>
  SimpleListExample.map((item, index) => {
    return (
      <ListItemNext
        key={index}
        disabled={disabledItems.includes(index)}
        value={item}
      >
        {item}
      </ListItemNext>
    );
  });

export const Default: Story<ListNextProps> = ({ children, ...rest }) => {
  return (
    <ListNext {...rest} aria-label="Declarative List example">
      {children ||
        getListItems({
          disabledItems: [1, 5],
        })}
    </ListNext>
  );
};

Default.args = {
  style: { width: "200px" },
};

export const Borderless = Default.bind({});
Borderless.args = {
  borderless: true,
};

export const ConfigurableHeight = Default.bind({});
ConfigurableHeight.args = {
  displayedItemCount: 6,
};

export const Deselectable = Default.bind({});
Deselectable.args = {
  deselectable: true,
};

export const Disabled = Default.bind({});
Disabled.args = {
  disabled: true,
};

export const DisabledSelected = Default.bind({});
DisabledSelected.args = {
  children: getListItems({
    disabledItems: [1],
  }),
  selectedIndexes: [1]
};

export const Empty: Story<ListNextProps> = ({ children, ...rest }) => {
  return (
    <FlexLayout>
      <FlexItem>
        <p>Default message</p>
        <ListNext aria-label="Empty List default example" />
      </FlexItem>
      <FlexItem>
        <p>Custom message</p>
        <ListNext {...rest} aria-label="Empty List custom message example" />
      </FlexItem>
    </FlexLayout>
  );
};
Empty.args = {
  emptyMessage: "List is empty",
};

export const Controlled: Story<ListNextProps> = (props) => {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    // console.log('highlighed index chabged ti ', highlightedIndex)
  }, [highlightedIndex])

  useEffect(() => {
    // console.log('selectedItems index chabged ti ', selectedItems)
  }, [selectedItems])

  const handleArrowDown = () => {
    setHighlightedIndex((prevHighlightedIndex) =>
      Math.min(SimpleListExample.length - 1, prevHighlightedIndex + 1)
    );
  };

  const handleArrowUp = () => {
    setHighlightedIndex((prevHighlightedIndex) =>
      Math.max(0, prevHighlightedIndex - 1)
    );
  };

  const handleSelect = () => {
    console.log("setting selected", highlightedIndex);
    setSelectedItems([highlightedIndex]);
    setHighlightedIndex(highlightedIndex)

  };

  const listItems = () => {
    return getListItems({
      disabledItems: [],
    });
  };

  const onHoverChange = (item) => {
    console.log("on hover change from inside hook", item);
    // setSelectedItems(item);
  };

  return (
    <FlexLayout direction="column" gap={0}>
      <FlexLayout gap={0}>
        <Button
          disabled={highlightedIndex === SimpleListExample.length - 1}
          onClick={handleArrowDown}
          aria-label="Move down"
        >
          <ChevronDownIcon aria-hidden />
        </Button>
        <Button
          disabled={highlightedIndex <= 0}
          onClick={handleArrowUp}
          aria-label="Move up"
        >
          <ChevronUpIcon aria-hidden />
        </Button>
        <Button onClick={handleSelect}>Select</Button>
      </FlexLayout>
      <ListNext
        {...props}
        onSelect={(item) => setSelectedItems(item)}
        onHoverChange={onHoverChange}
        selectedIndexes={selectedItems}
        hoveredIndex={highlightedIndex}
        aria-label="Declarative List example"
      >
        {listItems()}
      </ListNext>
    </FlexLayout>
  );
};

Controlled.args = {};
