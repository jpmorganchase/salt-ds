import { Story, ComponentMeta } from "@storybook/react";

import { DropdownNext, DropdownNextProps } from "@salt-ds/lab";
import { Button, FlexLayout, StackLayout } from "@salt-ds/core";
import { ArrowDownIcon, ArrowUpIcon } from "@salt-ds/icons";
import { SyntheticEvent, useState } from "react";

export default {
  title: "Lab/Dropdown Next",
  component: DropdownNext,
} as ComponentMeta<typeof DropdownNext>;

const ListExample = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
];

const DropdownTemplate: Story<DropdownNextProps> = ({ source, ...args }) => {
  const handleSelect = (_event: SyntheticEvent, data: { value: string }) => {
    console.log("selected item", data.value);
  };
  return (
    <DropdownNext source={ListExample} onSelect={handleSelect} {...args} />
  );
};

export const Default = DropdownTemplate.bind({});

export const WithDefaultSelected = DropdownTemplate.bind({});
WithDefaultSelected.args = {
  defaultSelected: "California",
};

export const Readonly = DropdownTemplate.bind({});
Readonly.args = {
  readOnly: true,
  defaultSelected: "California",
};

export const Disabled = DropdownTemplate.bind({});
Disabled.args = {
  disabled: true,
  defaultSelected: "California",
};

export const Variants: Story<DropdownNextProps> = ({
  source = ListExample,
}) => {
  return (
    <StackLayout>
      <DropdownNext source={source} />
      <DropdownNext source={source} variant="secondary" />
    </StackLayout>
  );
};

export const Controlled: Story<DropdownNextProps> = ({
  source = ListExample,
  ...props
}) => {
  const initialValue = "California";

  const [highlightedIndex, setHighlightedIndex] = useState(
    ListExample.indexOf(initialValue) ?? 0
  );
  const [selectedItem, setSelectedItem] = useState(initialValue);
  const [open, setOpen] = useState(false);

  const handleOpenClose = () => {
    setOpen(!open);
  };

  const handleArrowDown = () => {
    setOpen(true);
    const nextIndex = highlightedIndex === undefined ? 0 : highlightedIndex + 1;
    setHighlightedIndex(nextIndex);
  };

  const handleArrowUp = () => {
    setOpen(true);
    const prevIndex = highlightedIndex === undefined ? 0 : highlightedIndex - 1;
    setHighlightedIndex(prevIndex);
  };

  const handleSelect = () => {
    highlightedIndex && setSelectedItem(ListExample[highlightedIndex]);
    setOpen(false);
  };

  return (
    <FlexLayout>
      <FlexLayout gap={1}>
        <Button onClick={handleOpenClose}>{open ? "Close" : "Open"}</Button>
        <Button
          disabled={highlightedIndex === ListExample.length - 1}
          onClick={handleArrowDown}
        >
          <ArrowDownIcon />
        </Button>
        <Button
          disabled={!highlightedIndex || highlightedIndex === 0}
          onClick={handleArrowUp}
        >
          <ArrowUpIcon />
        </Button>
        <Button
          disabled={highlightedIndex === undefined}
          onClick={handleSelect}
        >
          Select
        </Button>
      </FlexLayout>
      <DropdownNext
        {...props}
        source={source}
        open={open}
        selected={selectedItem}
        highlightedItem={ListExample[highlightedIndex]}
      />
    </FlexLayout>
  );
};
