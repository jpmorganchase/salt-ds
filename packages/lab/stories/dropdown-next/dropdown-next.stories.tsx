import { Story, ComponentMeta } from "@storybook/react";

import { DropdownNext, DropdownNextProps } from "@salt-ds/lab";
import { Button } from "@salt-ds/core";
import { ArrowDownIcon, ArrowUpIcon } from "@salt-ds/icons";
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
  { value: "🍊", id: "Orange" },
  { value: "🍏", id: "Apple" },
  {
    value: "🍈",
    id: "Melon",
  },
  { value: "🍍", id: "Pineapple" },
  { value: "🍐", id: "Pear" },
];

const DropdownTemplate: Story<DropdownNextProps<T>> = ({ ...args }) => {
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
