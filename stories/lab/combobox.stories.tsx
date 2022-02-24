import { ChangeEventHandler, useState } from "react";
import { Button } from "@brandname/core";
import {
  ComboBox,
  FormField,
  ListChangeHandler,
  ListSelectHandler,
} from "@brandname/lab";
import { ComponentStory, ComponentMeta } from "@storybook/react";

export default {
  title: "Lab/ComboBox",
  component: ComboBox,
} as ComponentMeta<typeof ComboBox>;

const listData = [
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
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const handleChange: ListChangeHandler<string> = (_, item) => {
  console.log("selection changed", item);
};

const handleSelect: ListSelectHandler<string> = (_, selectedItem) => {
  console.log("selected item", selectedItem);
};

export const Default: ComponentStory<typeof ComboBox> = () => (
  <ComboBox
    onChange={handleChange}
    onSelect={handleSelect}
    source={listData}
    width={292}
  />
);

export const Controlled: ComponentStory<typeof ComboBox> = () => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    setInputValue(target.value.trim().toUpperCase());
  };

  const handleSelect: ListSelectHandler<string> = (_, item) => {
    setInputValue(item ? item.toUpperCase() : "");
  };

  const handleChange: ListChangeHandler<string> = (_, selectedItem) => {
    console.log("selection changed", selectedItem);
  };

  return (
    <FormField label="Select" style={{ maxWidth: 292 }}>
      <ComboBox
        inputValue={inputValue}
        onChange={handleChange}
        onInputChange={handleInputChange}
        onSelect={handleSelect}
        source={listData}
      />
    </FormField>
  );
};

type Item = {
  label: string;
  disabled?: boolean;
};

const source: Array<Item> = listData.map((label, index) => ({
  label,
  ...(index % 4 === 3 && { disabled: true }),
}));

const itemToString = ({ label }: Item) => label;

export const Disabled: ComponentStory<typeof ComboBox> = () => {
  const [disabled, setDisabled] = useState(false);

  const handleChange: ListChangeHandler<Item> = (_, item) => {
    console.log("selection changed", item);
  };

  const handleSelect: ListSelectHandler<Item> = (_, selectedItem) => {
    console.log("selected item", selectedItem);
  };

  const handleToggleDisabled = () => {
    setDisabled((prevDisabled) => !prevDisabled);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        maxWidth: 292,
      }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={handleToggleDisabled}>
          {disabled ? "Enable" : "Disable"} combo box
        </Button>
      </div>
      <FormField disabled={disabled} label="Select" style={{ maxWidth: 292 }}>
        <ComboBox
          itemToString={itemToString}
          onChange={handleChange}
          onSelect={handleSelect}
          source={source}
        />
      </FormField>
    </div>
  );
};
