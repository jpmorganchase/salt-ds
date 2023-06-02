import { ComponentMeta, Story } from "@storybook/react";
import { ListNext, ListNextProps } from "../../src";
import { ListItemNext } from "../../src/list-next/ListItemNext";

export default {
  title: "Lab/List Next",
  component: ListNext,
} as ComponentMeta<typeof ListNext>;

const SimpleListExample = [
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
];

const listItems = SimpleListExample.map((item, index) => (
  <ListItemNext key={index} disabled={[1, 5].includes(index)}>
    {item}
  </ListItemNext>
));

export const Default: Story<ListNextProps> = ({ children, ...rest }) => {
  return (
    <ListNext {...rest} aria-label="Declarative List example">
      {children || listItems}
    </ListNext>
  );
};
Default.args = {
  style: { width: "200px" },
  displayedItemCount: 4,
};
export const Borderless = Default.bind({});
Borderless.args = {
  borderless: true,
};

export const Truncation = Default.bind({});
Truncation.args = {
  style: { width: "80px" },
};

export const Deselectable = Default.bind({});
Deselectable.args = {
  deselectable: true,
};

export const Disabled = Default.bind({});
Disabled.args = {
  disabled: true,
  displayedItemCount: 3,
};

export const Empty = Default.bind({});
Empty.args = {
  children: [],
  emptyMessage: "Empty list example with long empty message",
};
