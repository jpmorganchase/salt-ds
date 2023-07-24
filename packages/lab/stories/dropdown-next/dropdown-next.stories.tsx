import { Story, ComponentMeta } from "@storybook/react";

import { DropdownNext, DropdownNextProps, ListItemNext } from "@salt-ds/lab";
import { Button, FlexLayout, Text } from "@salt-ds/core";
import { ArrowDownIcon, ArrowUpIcon, Icon } from "@salt-ds/icons";
import { useRef, useState } from "react";

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
  "Colorsfddhehrehyyhado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
];

const ListExample = [
  { value: "OrangeIcon", name: "Orange", disabled: false },
  { value: "AppleIcon", name: "Apple", disabled: false },
  { value: "MelonIcon", name: "Melon", disabled: true },
  { value: "PineappleIcon", name: "Pineapple", disabled: false },
  { value: "PearIcon", name: "Pear", disabled: false },
];

// example using source
export const Default: Story<DropdownNextProps<T>> = ({
  source,
  defaultSelected,
  ...props
}) => {
  const handleSelect = (event) => {
    console.log("handleSelect", event?.target?.value);
  };

  return (
    <>
      <FlexLayout
        style={{
          maxHeight: "100%",
          maxWidth: "100%",
          width: "300vw",
          margin: "auto",
        }}
      >
        <Text>Salt DropdownNext component</Text>
        <br />
        <DropdownNext
          defaultSelected="California"
          source={SimpleListExample}
          onMouseDown={(event) => {
            console.log("MouseDown");
            handleSelect(event);
          }}
          onKeyDown={(event) => {
            console.log("KeyDown");
            handleSelect(event);
          }}
          {...props}
        />
      </FlexLayout>
    </>
  );
};

// example using source
export const Second: Story<DropdownNextProps<T>> = ({
  source,
  defaultSelected,
  ...props
}) => {
  return (
    <>
      <Text>Salt DropdownNext component</Text>
      <br />
      <DropdownNext
        defaultSelected="MelonIcon"
        source={ListExample}
        {...props}
      />
    </>
  );
};

// example using source
export const Third: Story<DropdownNextProps<T>> = ({
  source,
  defaultSelected,
  ...props
}) => {
  return (
    <>
      <Text>Salt DropdownNext component</Text>
      <br />
      <DropdownNext
        defaultSelected="MelonIcon Melon"
        source={ListExample.map((item) => {
          return `${item.value} ${item.name}`;
        })}
        {...props}
      />
    </>
  );
};

// example using source
export const Controlled: Story<DropdownNextProps<T>> = ({
  source,
  defaultSelected,
  ...props
}) => {
  const buttonsRef = useRef(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    undefined
  );
  const [open, setOpen] = useState(false);

  const handleOpenClose = () => {
    console.log("handleOpenClose");
    setOpen(!open);
  };

  const handleArrowDown = () => {
    setOpen(true);
    setHighlightedIndex((prevHighlightedIndex) =>
      Math.min(SimpleListExample.length - 1, prevHighlightedIndex + 1)
    );
  };

  const handleArrowUp = () => {
    setOpen(true);
    setHighlightedIndex((prevHighlightedIndex) =>
      Math.max(0, prevHighlightedIndex - 1)
    );
  };

  const handleSelect = () => {
    highlightedIndex && setSelectedItem(SimpleListExample[highlightedIndex]);
  };

  const handleClick = (index: number) => {
    setSelectedItem(SimpleListExample[index]);
    setHighlightedIndex(index);
  };

  return (
    <>
      <Text>Salt DropdownNext component</Text>
      <br />
      <div
        ref={buttonsRef}
        style={{ display: "flex", justifyContent: "flex-end", zIndex: 1 }}
      >
        <Button onClick={handleOpenClose}>
          {open ? "Close DD" : "Open DD"}
        </Button>
        <Button
          disabled={highlightedIndex === SimpleListExample.length - 1}
          onClick={handleArrowDown}
        >
          <ArrowDownIcon />
        </Button>
        <Button disabled={highlightedIndex <= 0} onClick={handleArrowUp}>
          <ArrowUpIcon />
        </Button>
        <Button
          disabled={highlightedIndex === undefined}
          onClick={handleSelect}
        >
          Select
        </Button>
      </div>
      <DropdownNext
        selected={selectedItem}
        defaultSelected="California"
        source={SimpleListExample}
        // onOpenChange={handleOpenClose}
        open={open}
        listId={"list-id"}
        {...props}
      />
    </>
  );
};

// example using source
export const Empty: Story<DropdownNextProps<T>> = ({
  source,
  defaultSelected,
  ...props
}) => {
  return (
    <>
      <Text>Salt DropdownNext component</Text>
      <br />
      <DropdownNext source={[]} {...props} />
    </>
  );
};

export const Disabled = Default.bind({});
Disabled.args = {
  disabled: true,
};
