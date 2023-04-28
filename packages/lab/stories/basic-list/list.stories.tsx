import {ComponentMeta, Story} from "@storybook/react";
import {BasicList, BasicListProps} from "../../src";
import {BasicListItem} from "../../src/basic-list/BasicListItem";
import {UserGroupSolidIcon} from "@salt-ds/icons";

export default {
  title: "Lab/Basic-List",
  component: BasicList,
} as ComponentMeta<typeof BasicList>;

const SimpleListExample = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
]
export const Template: Story<BasicListProps> = (props) => {
  return (
    <BasicList
      {...props}
      aria-label="Listbox example"
      style={{ width: '200px' }}

    />
  );
};

export const Default = Template.bind({});
Default.args = {
  source: SimpleListExample
};

export const Borderless = Template.bind({});
Borderless.args = {
  source: SimpleListExample,
  borderless: true
};

export const Deselectable = Template.bind({});
Deselectable.args = {
  source: SimpleListExample,
  deselectable: true
};

export const Empty = Template.bind({});
Empty.args = {
  emptyMessage: "Empty list example with long empty message"
};


export const BasicListItemExample: Story<BasicListProps> = (props) => {
  return (
    <BasicList
      {...props}
      aria-label="Basic list items example"
    >
      <BasicListItem selected>Alabama</BasicListItem>
      <BasicListItem>Alabama</BasicListItem>
      <BasicListItem showCheckbox selected>Alabama</BasicListItem>
      <BasicListItem showCheckbox>Alabama</BasicListItem>
      <BasicListItem itemTextHighlightPattern="bama">Alabama</BasicListItem>
      <BasicListItem selected disabled>Alabama</BasicListItem>
      <BasicListItem disabled>Alabama</BasicListItem>
      <BasicListItem showCheckbox selected disabled>Alabama</BasicListItem>
      <BasicListItem showCheckbox disabled>Alabama</BasicListItem>
    </BasicList>
  );
};

export const Declarative: Story<BasicListProps> = (props) => {
  return (
    <BasicList
      {...props}
      aria-label="Declarative List example"
      displayedItemCount={5}
    >
      {SimpleListExample.map((item, index) => <BasicListItem key={index}
                                                             disabled={[1, 5].includes(index)}>{item}</BasicListItem>)}
    </BasicList>
  );
};



// TODO: EXAMPLES
// Default,
// Borderless,
// Declarative,
// Deselectable
// Controlled
// Disabled
// Multi Selection
// with item renderer
// with placeholder (empty)
// with text truncation
// with focus restored
// with text highlight
// extended selection (only for multiselect?)
