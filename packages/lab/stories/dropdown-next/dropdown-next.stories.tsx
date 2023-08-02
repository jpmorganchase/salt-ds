import { Story, ComponentMeta } from "@storybook/react";

import { DropdownNext, DropdownNextProps } from "@salt-ds/lab";

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
  { value: "🍊", id: "Orange", disabled: false },
  { value: "🍏", id: "Apple", disabled: false },
  {
    value: "🍈",
    id: "Melon",
    disabled: true,
  },
  { value: "🍍", id: "Pineapple", disabled: false },
  { value: "🍐", id: "Pear", disabled: false },
];

const DropdownTemplate: Story<DropdownNextProps<T>> = ({ ...args }) => {
  return <DropdownNext {...args} />;
};

export const Default = DropdownTemplate.bind({});
Default.args = {
  source: SimpleListExample,
};

export const Secondary = DropdownTemplate.bind({});
const getDisabledItems = () => {
  let d: number[] = [];
  ListExample.map((item, index) => {
    if (item.disabled) {
      d.push(index);
    }
  });
  return d;
};
Secondary.args = {
  source: ListExample.map((item) => {
    return `${item.value} ${item.id}`;
  }),
  defaultSelected: `${ListExample[4].value} ${ListExample[4].id}`,
  disabledListItems: getDisabledItems(),
  variant: "secondary",
};

export const Readonly = DropdownTemplate.bind({});
Readonly.args = {
  source: ListExample,
  defaultSelected: `${ListExample[3].value} ${ListExample[3].id}`,
  readOnly: true,
};

export const DisabledDropdown = DropdownTemplate.bind({});
DisabledDropdown.args = {
  source: SimpleListExample,
  defaultSelected: SimpleListExample[7],
  disabled: true,
};

export const DisabledListItems = DropdownTemplate.bind({});
DisabledListItems.args = {
  source: SimpleListExample,
  disabledListItems: [2, 5],
};
