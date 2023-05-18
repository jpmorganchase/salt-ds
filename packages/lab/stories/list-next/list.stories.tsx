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

// TODO: behaviours to show in examples.
// Controlled
// Multi Selection
// with item renderer (custom item)
// with text truncation
// with focus restored
// with text highlight
// extended selection (only for multiselect?)
// inside a combobox

const listItems = SimpleListExample.map((item, index) => (
  <ListItemNext key={index} disabled={[1, 5].includes(index)}>
    {item}
  </ListItemNext>
));

export const Default: Story<ListNextProps> = ({ children, ...rest }) => {
  return (
    <ListNext
      {...rest}
      aria-label="Declarative List example"
      style={{ width: "200px" }}
    >
      {children || listItems}
    </ListNext>
  );
};

export const Borderless = Default.bind({});
Borderless.args = {
  borderless: true,
};

export const MultiSelect = Default.bind({});
MultiSelect.args = {
  multiselect: true,
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

export const ListItemNextExample: Story<ListNextProps> = (props) => {
  return (
    <ListNext
      {...props}
      aria-label="Basic list items example"
      displayedItemCount={6}
    >
      <ListItemNext selected role={'presentation'}>Selected Item</ListItemNext>
      <ListItemNext>Basic list item</ListItemNext>
      <ListItemNext showCheckbox selected>
        with checkbox selected
      </ListItemNext>
      <ListItemNext showCheckbox>with checkbox</ListItemNext>
      <ListItemNext itemTextHighlightPattern="bama">
        with highlight
      </ListItemNext>
      <ListItemNext selected disabled>
        selected disabled
      </ListItemNext>
      <ListItemNext disabled>disabled</ListItemNext>
      <ListItemNext showCheckbox selected disabled>
        with checkbox disabled selected
      </ListItemNext>
      <ListItemNext showCheckbox disabled>
        with checkbox disabled
      </ListItemNext>
    </ListNext>
  );
};
