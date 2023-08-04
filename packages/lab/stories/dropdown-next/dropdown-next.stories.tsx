import { Story, ComponentMeta } from "@storybook/react";

import { DropdownNext, DropdownNextProps } from "@salt-ds/lab";
import { Button } from "@salt-ds/core";
import { ArrowDownIcon, ArrowUpIcon } from "@salt-ds/icons";
import { useState } from "react";

export default {
  title: "Lab/Dropdown Next",
  component: DropdownNext,
} as ComponentMeta<typeof DropdownNext>;

const SimpleListExample = [
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

const ListExample = [
  { value: "🍊", id: "Orange" },
  { value: "🍏", id: "Apple" },
  {
    value: "🍈",
    id: "Melon",
  },
  { value: "🍍", id: "Pineapple" },
  { value: "🍐", id: "Pear" },
];

const DropdownTemplate: Story<DropdownNextProps> = ({ ...args }) => {
  return <DropdownNext {...args} />;
};

export const Default = DropdownTemplate.bind({});
Default.args = {
  source: SimpleListExample,
};

export const Secondary = DropdownTemplate.bind({});
Secondary.args = {
  variant: "secondary",
  defaultSelected: `${ListExample[2].value} ${ListExample[2].id}`,
  source: ListExample.map((item) => {
    return `${item.value} ${item.id}`;
  }),
};

export const Readonly = DropdownTemplate.bind({});
Readonly.args = {
  readOnly: true,
  defaultSelected: `${ListExample[3].value} ${ListExample[3].id}`,
  source: ListExample.map((item) => {
    return `${item.value} ${item.id}`;
  }),
};

export const Disabled = Default.bind({});
Disabled.args = {
  disabled: true,
  defaultSelected: SimpleListExample[7],
  source: SimpleListExample,
};

export const Controlled: Story<DropdownNextProps> = ({
  source = SimpleListExample,
  defaultSelected = "California",
  ...props
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState(
    SimpleListExample.indexOf(defaultSelected) ?? 0
  );
  const [selectedItem, setSelectedItem] = useState(
    defaultSelected ?? undefined
  );
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
    highlightedIndex && setSelectedItem(SimpleListExample[highlightedIndex]);
    setOpen(false);
  };

  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <div
        style={{
          display: "flex",
          paddingRight: "20px",
        }}
      >
        <Button onClick={handleOpenClose}>{open ? "Close" : "Open"}</Button>
        <Button
          disabled={highlightedIndex === SimpleListExample.length - 1}
          onClick={handleArrowDown}
          style={{ marginLeft: "5px" }}
        >
          <ArrowDownIcon />
        </Button>
        <Button
          disabled={!highlightedIndex || highlightedIndex === 0}
          onClick={handleArrowUp}
          style={{ marginLeft: "5px" }}
        >
          <ArrowUpIcon />
        </Button>
        <Button
          disabled={highlightedIndex === undefined}
          onClick={handleSelect}
          style={{ marginLeft: "5px" }}
        >
          Select
        </Button>
      </div>
      <DropdownNext
        {...props}
        defaultSelected={defaultSelected}
        source={source}
        open={open}
        selectedItem={selectedItem}
        highlightedItem={SimpleListExample[highlightedIndex]}
      />
    </div>
  );
};
