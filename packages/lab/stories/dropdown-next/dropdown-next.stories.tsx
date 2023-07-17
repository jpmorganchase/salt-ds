import { Story, ComponentMeta } from "@storybook/react";

import { DropdownNext, DropdownNextProps, ListItemNext } from "@salt-ds/lab";
import { Text } from "@salt-ds/core";

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

export const Default: Story<DropdownNextProps> = (props) => {
  return (
    <>
      <Text>Salt DropdownNext component</Text>
      <br />
      <DropdownNext defaultSelected="California" {...props}>
        {SimpleListExample.map((item, index) => {
          return (
            <ListItemNext key={index} value={item}>
              {item}
            </ListItemNext>
          );
        })}
      </DropdownNext>
    </>
  );
};

export const Disabled = Default.bind({});
Disabled.args = {
  disabled: true,
};
