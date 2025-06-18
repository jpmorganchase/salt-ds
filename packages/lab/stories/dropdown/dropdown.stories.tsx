import { Button, Tooltip } from "@salt-ds/core";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DoubleChevronDownIcon,
  DoubleChevronUpIcon,
} from "@salt-ds/icons";
import {
  Dropdown,
  DropdownButton,
  type DropdownProps,
  FormField,
  ListItem,
  type ListItemType,
  type SelectionChangeHandler,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";
import { useCallback, useState } from "react";
import { usa_states } from "../list/list.data";

export default {
  title: "Lab/Dropdown",
  component: Dropdown,
};

export const Default: StoryFn<DropdownProps> = (props) => {
  const handleChange: SelectionChangeHandler = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
    props.onSelectionChange?.(event, selectedItem);
  };
  return (
    <Dropdown
      defaultSelected={usa_states[0]}
      onSelectionChange={handleChange}
      source={usa_states}
    />
  );
};

export const MultiSelect: StoryFn<DropdownProps<string, "multiple">> = (
  props,
) => {
  const handleChange: SelectionChangeHandler<string, "multiple"> = (
    _e,
    items,
  ) => {
    console.log({ selected: items });
    props.onSelectionChange?.(_e, items);
  };
  return (
    <Dropdown
      {...props}
      defaultSelected={["California", "Colorado"]}
      onSelectionChange={handleChange}
      selectionStrategy="multiple"
      source={usa_states}
    />
  );
};

interface objectOptionType {
  value: number;
  text: string;
  id: number;
}
const objectOptionsExampleData: objectOptionType[] = [
  { value: 10, text: "A Option", id: 1 },
  { value: 20, text: "B Option", id: 2 },
  { value: 30, text: "C Option", id: 3 },
  { value: 40, text: "D Option", id: 4 },
];

export const ItemToString: StoryFn<DropdownProps<objectOptionType>> = (
  props,
) => {
  const itemToString = (item: objectOptionType) => {
    return item ? item.text : "";
  };
  return (
    <Dropdown<objectOptionType>
      {...props}
      defaultSelected={objectOptionsExampleData[0]}
      itemToString={itemToString}
      source={objectOptionsExampleData}
    />
  );
};

export const CustomButton: StoryFn<DropdownProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("Arkansas");
  const handleOpenChange = (isOpen: boolean) => {
    setIsOpen(isOpen);
    props.onOpenChange?.(isOpen);
  };
  const handleChange: SelectionChangeHandler = (event, selectedItem) => {
    if (selectedItem) {
      setSelectedValue(selectedItem);
    }
    props.onSelectionChange?.(event, selectedItem);
  };

  return (
    <Dropdown
      {...props}
      selected={selectedValue}
      onOpenChange={handleOpenChange}
      onSelectionChange={handleChange}
      placement="bottom-end"
      source={usa_states}
      triggerComponent={
        <DropdownButton
          IconComponent={isOpen ? DoubleChevronUpIcon : DoubleChevronDownIcon}
          label={selectedValue}
        />
      }
    />
  );
};

export const CustomWidth: StoryFn<DropdownProps> = () => (
  <Dropdown
    ListProps={{ width: 300 }}
    defaultSelected={usa_states[0]}
    source={usa_states}
    width={200}
  />
);

const ItalicListItem: ListItemType<string> = ({ item, ...props }) => {
  return (
    // Make sure to spread the props onto custom item
    <ListItem {...props}>
      <i>{item}</i>
    </ListItem>
  );
};

export const CustomRowRenderer: StoryFn<DropdownProps> = (props) => (
  <Dropdown
    {...props}
    ListItem={ItalicListItem}
    defaultSelected={usa_states[0]}
    source={usa_states}
  />
);

const ListItemWithTooltip: ListItemType<string> = ({ item, ...props }) => {
  return (
    <Tooltip content={`I am a tooltip for ${item}`} {...props}>
      <ListItem>
        <span style={{ width: "100%" }}>{item}</span>
      </ListItem>
    </Tooltip>
  );
};

export const CustomRowRendererWithTooltip: StoryFn<DropdownProps> = (props) => (
  <Dropdown
    {...props}
    ListItem={ListItemWithTooltip}
    source={usa_states}
    defaultSelected={usa_states[0]}
  />
);

export const WithFormFieldLabelTop: StoryFn<DropdownProps> = () => {
  return (
    <div style={{ width: 250 }}>
      <FormField helperText="Select a value" label="ADA compliant label">
        <Dropdown defaultSelected={usa_states[2]} source={usa_states} />
      </FormField>
    </div>
  );
};

export const WithFormFieldLabelLeft: StoryFn<DropdownProps> = () => {
  return (
    <div style={{ width: 250 }}>
      <FormField
        helperText="This is some help text"
        label="ADA compliant label"
        labelPlacement="left"
      >
        <Dropdown defaultSelected={usa_states[2]} source={usa_states} />
      </FormField>
    </div>
  );
};

// We supply `height` to the div so that the popper can be captured in visual
// regression test
export const InitialIsOpen: StoryFn<DropdownProps> = (props) => {
  return (
    <div style={{ width: 250, height: 500 }}>
      <FormField
        helperText="This is some help text"
        label="ADA compliant label"
      >
        <Dropdown
          {...props}
          defaultSelected={usa_states[2]}
          defaultIsOpen
          source={usa_states}
        />
      </FormField>
    </div>
  );
};

const constArray = ["A", "B", "C"] as const;

/** Illustration of using readonly source */
export const ConstReadonlySource: StoryFn<DropdownProps> = (props) => (
  <Dropdown {...props} defaultSelected={constArray[0]} source={constArray} />
);

export const DisabledList: StoryFn<DropdownProps> = (props) => {
  const handleChange: SelectionChangeHandler = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
    props.onSelectionChange?.(event, selectedItem);
  };
  return (
    <Dropdown
      {...props}
      disabled
      id="test"
      onSelectionChange={handleChange}
      source={["Bar", "Foo", "Foo Bar", "Baz"]}
      style={{ width: 180 }}
    />
  );
};

export const ControlledOpen: StoryFn<DropdownProps> = (props) => {
  const [isOpen, setIsOpen] = useState(true);
  const handleChange = (open: boolean) => {
    console.log({ openChanged: open });
    setIsOpen(open);
    props.onOpenChange?.(open);
  };
  const toggleDropdown = useCallback(() => {
    console.log(`toggleDropdoen isOpen = ${isOpen}`);
    setIsOpen((x) => !x);
  }, [isOpen]);
  return (
    <>
      <Button onClick={toggleDropdown}>
        {isOpen ? "Hide Dropdown" : "Show Dropdown"}
      </Button>
      <Dropdown
        {...props}
        isOpen={isOpen}
        defaultSelected="Alaska"
        onOpenChange={handleChange}
        source={usa_states}
        style={{ width: 180 }}
      />
    </>
  );
};

export const FullyControlled: StoryFn<DropdownProps> = (props) => {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleArrowDown = () => {
    setHighlightedIndex((prevHighlightedIndex) =>
      Math.min(usa_states.length - 1, prevHighlightedIndex + 1),
    );
  };

  const handleArrowUp = () => {
    setHighlightedIndex((prevHighlightedIndex) =>
      Math.max(0, prevHighlightedIndex - 1),
    );
  };

  const handleSelect = () => {
    setSelectedItem(usa_states[highlightedIndex] || null);
  };
  const handleOpen = () => {
    setOpen(!open);
  };

  return (
    <div style={{ display: "inline-flex", gap: 16 }}>
      <Dropdown
        {...props}
        ListProps={{
          highlightedIndex,
        }}
        defaultSelected={usa_states[0]}
        isOpen={open}
        selected={selectedItem}
        source={usa_states}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", zIndex: 1 }}>
        <Button onClick={handleOpen} style={{ width: 80 }}>
          {open ? "Close" : "Open"}
        </Button>
        <Button
          disabled={!open || highlightedIndex === usa_states.length - 1}
          onClick={handleArrowDown}
        >
          <ArrowDownIcon />
        </Button>
        <Button
          disabled={!open || highlightedIndex <= 0}
          onClick={handleArrowUp}
        >
          <ArrowUpIcon />
        </Button>
        <Button disabled={!open} onClick={handleSelect}>
          Select
        </Button>
      </div>
    </div>
  );
};
