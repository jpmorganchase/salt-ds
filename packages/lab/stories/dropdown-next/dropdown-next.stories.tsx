import { Story } from "@storybook/react";
import {
  DropdownNext,
  DropdownNextProps,
  SelectionChangeHandler,
} from "@salt-ds/lab";
import { usa_states } from "../list/list.data";

export default {
  title: "Lab/Dropdown Next",
  component: DropdownNext,
};

export const Default: Story<DropdownNextProps> = (props) => {
  const handleChange: SelectionChangeHandler = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
    props.onSelectionChange?.(event, selectedItem);
  };
  return (
    <DropdownNext
      defaultSelected={usa_states[0]}
      onSelectionChange={handleChange}
      source={usa_states}
    />
  );
};
