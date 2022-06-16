import { ToolkitProvider, Tooltip, useTooltip } from "@jpmorganchase/uitk-core";
import {
  DoubleChevronDownIcon,
  DoubleChevronUpIcon,
} from "@jpmorganchase/uitk-icons";
import {
  Dropdown,
  DropdownButton,
  DropdownProps,
  FormField,
  IndexedListItemProps,
  ListChangeHandler,
  ListItemBase,
  MultiSelectDropdown,
  useListItem,
} from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory, Story } from "@storybook/react";
import { ChangeEvent, FC, useState } from "react";
import {
  objectOptionsExampleData,
  objectOptionType,
  usStateExampleData,
} from "./exampleData";

export default {
  title: "Lab/Dropdown",
  component: Dropdown,
} as ComponentMeta<typeof Dropdown>;

export const DefaultDropdown: ComponentStory<typeof Dropdown> = () => {
  const handleChange: ListChangeHandler = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
  };
  return (
    <Dropdown
      initialSelectedItem={usStateExampleData[0]}
      source={usStateExampleData}
      onChange={handleChange}
    />
  );
};

export const MultiSelectDropdownExample: ComponentStory<
  typeof Dropdown
> = () => {
  const handleChange: ListChangeHandler<string, "multiple"> = (_, items) => {
    console.log(items);
  };
  return (
    <MultiSelectDropdown
      initialSelectedItem={[usStateExampleData[4], usStateExampleData[5]]}
      source={usStateExampleData}
      onChange={handleChange}
    />
  );
};

MultiSelectDropdownExample.storyName = "Multi Select Dropdown";

export const ItemToString: ComponentStory<typeof Dropdown> = () => {
  const itemToString = (item: objectOptionType) => {
    return item ? item.text : "";
  };
  return (
    <Dropdown<objectOptionType>
      initialSelectedItem={objectOptionsExampleData[0]}
      itemToString={itemToString}
      source={objectOptionsExampleData}
    />
  );
};

export const CustomButton: ComponentStory<typeof Dropdown> = () => (
  <Dropdown
    initialSelectedItem={usStateExampleData[3]}
    source={usStateExampleData}
  >
    {({ DropdownButtonProps, isOpen, buttonRef }) => {
      const { style, ...restButtonProps } = DropdownButtonProps;
      return (
        <DropdownButton
          {...restButtonProps}
          IconComponent={isOpen ? DoubleChevronUpIcon : DoubleChevronDownIcon}
          style={{ ...style, border: "1px solid rgba(213,213,213,1)" }}
          ref={buttonRef}
        />
      );
    }}
  </Dropdown>
);

export const CustomWidth: ComponentStory<typeof Dropdown> = () => (
  <Dropdown
    initialSelectedItem={usStateExampleData[0]}
    listWidth={300}
    source={usStateExampleData}
    width={200}
  />
);

const ItalicListItem: FC<IndexedListItemProps<string>> = (props) => {
  const { item, itemProps } = useListItem<string>(props);

  return (
    // Make sure to spread the props onto custom item
    <ListItemBase {...itemProps}>
      <i>{item}</i>
    </ListItemBase>
  );
};

export const CustomRowRenderer: ComponentStory<typeof Dropdown> = () => (
  <Dropdown
    ListItem={ItalicListItem}
    initialSelectedItem={usStateExampleData[0]}
    source={usStateExampleData}
  />
);

const ListItemWithTooltip: FC<IndexedListItemProps<string>> = (props) => {
  const { item, itemProps } = useListItem<string>(props);
  const { getTriggerProps, getTooltipProps } = useTooltip({
    placement: "right",
  });
  return (
    <ListItemBase {...getTriggerProps<typeof ListItemBase>(itemProps)}>
      <Tooltip {...getTooltipProps({ title: `I am a tooltip for ${item}` })} />
      <label style={{ width: "100%" }}>{item}</label>
    </ListItemBase>
  );
};

export const CustomRowRendererWithTooltip: ComponentStory<
  typeof Dropdown
> = () => (
  <Dropdown
    ListItem={ListItemWithTooltip}
    source={usStateExampleData}
    initialSelectedItem={usStateExampleData[0]}
  />
);

export const FullWidth: ComponentStory<typeof Dropdown> = () => {
  const [width, setWidth] = useState(200);

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setWidth(Number.parseInt(e.target.value));
  };

  return (
    <div
      style={{
        width,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <label htmlFor="width">Width: {width}px</label>
      <input
        id="width"
        max={500}
        min={100}
        onChange={handleWidthChange}
        value={width}
      />
      <Dropdown
        fullWidth
        initialSelectedItem={usStateExampleData[0]}
        isOpen
        source={usStateExampleData}
      />
    </div>
  );
};

export const Virtualized: ComponentStory<typeof Dropdown> = () => (
  <Dropdown
    adaExceptions={{ virtualized: true }}
    displayedItemCount={8}
    initialSelectedItem={usStateExampleData[1]}
    source={usStateExampleData}
  />
);

export const WithFormFieldLabelTop: ComponentStory<typeof Dropdown> = () => {
  return (
    <div style={{ width: 250 }}>
      <FormField helperText="Select a value" label="ADA compliant label">
        <Dropdown
          initialSelectedItem={usStateExampleData[2]}
          source={usStateExampleData}
        />
      </FormField>
    </div>
  );
};

export const WithFormFieldLabelLeft: ComponentStory<typeof Dropdown> = () => {
  return (
    <div style={{ width: 250 }}>
      <FormField
        helperText="This is some help text"
        label="ADA compliant label"
        labelPlacement="left"
      >
        <Dropdown
          initialSelectedItem={usStateExampleData[2]}
          source={usStateExampleData}
        />
      </FormField>
    </div>
  );
};

// We supply `height` to the div so that the popper can be captured in visual
// regression test
export const InitialIsOpen: ComponentStory<typeof Dropdown> = () => {
  return (
    <div style={{ width: 250, height: 500 }}>
      <FormField
        helperText="This is some help text"
        label="ADA compliant label"
      >
        <Dropdown
          initialSelectedItem={usStateExampleData[2]}
          initialIsOpen
          source={usStateExampleData}
        />
      </FormField>
    </div>
  );
};

export const TouchDensityDropdown: Story<DropdownProps> = ({
  initialSelectedItem,
  source,
  onChange,
  ...props
}) => {
  const handleChange: ListChangeHandler = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
    onChange?.(event, selectedItem);
  };
  return (
    <ToolkitProvider density="touch">
      <Dropdown
        initialSelectedItem={initialSelectedItem || usStateExampleData[0]}
        source={source || usStateExampleData}
        onChange={handleChange}
        {...props}
      />
    </ToolkitProvider>
  );
};

export const LowDensityDropdown: ComponentStory<typeof Dropdown> = () => {
  const handleChange: ListChangeHandler = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
  };
  return (
    <ToolkitProvider density="low">
      <Dropdown
        initialSelectedItem={usStateExampleData[0]}
        source={usStateExampleData}
        onChange={handleChange}
      />
    </ToolkitProvider>
  );
};

export const HighDensityDropdown: Story<DropdownProps> = ({
  initialSelectedItem,
  source,
  onChange,
}) => {
  const handleChange: ListChangeHandler = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
    onChange?.(event, selectedItem);
  };
  return (
    <ToolkitProvider density="high">
      <Dropdown
        initialSelectedItem={initialSelectedItem || usStateExampleData[0]}
        source={source || usStateExampleData}
        onChange={handleChange}
      />
    </ToolkitProvider>
  );
};

const constArray = ["A", "B", "C"] as const;

/** Illustration of using readonly source */
export const ConstReadonlySource: ComponentStory<typeof Dropdown> = () => (
  <Dropdown initialSelectedItem={constArray[0]} source={constArray} />
);
