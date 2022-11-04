import { useCallback, useState } from "react";
import { Story } from "@storybook/react";

import {
  Button,
  FormField,
  Tooltip,
  useTooltip,
} from "@jpmorganchase/uitk-core";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DoubleChevronDownIcon,
  DoubleChevronUpIcon,
} from "@jpmorganchase/uitk-icons";

import {
  DropdownButton,
  Dropdown,
  DropdownProps,
  ListItem,
  ListItemType,
} from "@jpmorganchase/uitk-lab";
import { usa_states } from "./list.data";

import { SelectionChangeHandler } from "../src/common-hooks";

export default {
  title: "Lab/Dropdown",
  component: Dropdown,
};

export const DefaultDropdown: Story<DropdownProps> = () => {
  const handleChange: SelectionChangeHandler = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
  };
  return (
    <Dropdown
      defaultSelected={usa_states[0]}
      onSelectionChange={handleChange}
      source={usa_states}
    />
  );
};

export const MultiSelectDropdownExample: Story<DropdownProps> = () => {
  const handleChange: SelectionChangeHandler<string, "multiple"> = (
    _e,
    [items]
  ) => {
    console.log({ selected: items });
  };
  return (
    <Dropdown
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

export const ItemToString: Story<DropdownProps<objectOptionType>> = () => {
  const itemToString = (item: objectOptionType) => {
    return item ? item.text : "";
  };
  return (
    <Dropdown<objectOptionType>
      defaultSelected={objectOptionsExampleData[0]}
      itemToString={itemToString}
      source={objectOptionsExampleData}
    />
  );
};

export const CustomButton: Story<DropdownProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("Arkansas");
  const handleChange: SelectionChangeHandler = (event, selectedItem) => {
    if (selectedItem) {
      setSelectedValue(selectedItem);
    }
  };

  return (
    <Dropdown
      selected={selectedValue}
      onOpenChange={setIsOpen}
      onSelectionChange={handleChange}
      placement="bottom-end"
      source={usa_states}
      triggerComponent={
        <DropdownButton
          IconComponent={isOpen ? DoubleChevronUpIcon : DoubleChevronDownIcon}
          label={selectedValue}
        />
      }
    ></Dropdown>
  );
};

export const CustomWidth: Story<DropdownProps> = () => (
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

export const CustomRowRenderer: Story<DropdownProps> = () => (
  <Dropdown
    ListItem={ItalicListItem}
    defaultSelected={usa_states[0]}
    source={usa_states}
  />
);

const ListItemWithTooltip: ListItemType<string> = ({
  item = "uknown",
  ...props
}) => {
  const { getTriggerProps, getTooltipProps } = useTooltip({
    placement: "right",
  });
  const { ref: triggerRef, ...triggerProps } =
    getTriggerProps<typeof ListItem>(props);

  return (
    <ListItem ref={triggerRef} {...triggerProps}>
      <label style={{ width: "100%" }}>{item}</label>
      <Tooltip {...getTooltipProps({ title: `I am a tooltip for ${item}` })} />
    </ListItem>
  );
};

export const CustomRowRendererWithTooltip: Story<DropdownProps> = () => (
  <Dropdown
    ListItem={ListItemWithTooltip}
    source={usa_states}
    defaultSelected={usa_states[0]}
  />
);

export const WithFormFieldLabelTop: Story<DropdownProps> = () => {
  return (
    <div style={{ width: 250 }}>
      <FormField helperText="Select a value" label="ADA compliant label">
        <Dropdown defaultSelected={usa_states[2]} source={usa_states} />
      </FormField>
    </div>
  );
};

export const WithFormFieldLabelLeft: Story<DropdownProps> = () => {
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
export const InitialIsOpen: Story<DropdownProps> = () => {
  return (
    <div style={{ width: 250, height: 500 }}>
      <FormField
        helperText="This is some help text"
        label="ADA compliant label"
      >
        <Dropdown
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
export const ConstReadonlySource: Story<DropdownProps> = () => (
  <Dropdown defaultSelected={constArray[0]} source={constArray} />
);

export const DisabledDropdownList: Story<DropdownProps> = () => {
  const handleChange: SelectionChangeHandler = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
  };
  return (
    <Dropdown
      disabled
      id="test"
      onSelectionChange={handleChange}
      source={["Bar", "Foo", "Foo Bar", "Baz"]}
      style={{ width: 180 }}
    />
  );
};

export const ControlledOpenDropdown: Story<DropdownProps> = () => {
  const [isOpen, setIsOpen] = useState(true);
  const handleChange: any = (open: boolean) => {
    console.log({ openChanged: open });
  };
  const toggleDropdown = useCallback(() => {
    console.log(`toggleDropdoen isOpen = ${isOpen}`);
    setIsOpen(!isOpen);
  }, [isOpen]);
  return (
    <>
      <Button onClick={toggleDropdown}>
        {isOpen ? "Hide Dropdown" : "Show Dropdown"}
      </Button>
      <Dropdown
        isOpen={isOpen}
        defaultSelected="Alaska"
        onOpenChange={handleChange}
        source={usa_states}
        style={{ width: 180 }}
      />
    </>
  );
};

export const FullyControlledDropdown: Story<DropdownProps> = () => {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleArrowDown = () => {
    setHighlightedIndex((prevHighlightedIndex) =>
      Math.min(usa_states.length - 1, prevHighlightedIndex + 1)
    );
  };

  const handleArrowUp = () => {
    setHighlightedIndex((prevHighlightedIndex) =>
      Math.max(0, prevHighlightedIndex - 1)
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
