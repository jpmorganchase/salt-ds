import {ComponentMeta, Story} from "@storybook/react";
import {BasicList, BasicListProps} from "../../src";
import {BasicListItem} from "../../src/basic-list/BasicListItem";

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
export const Default: Story<BasicListProps> = (props) => {
  return (
    <BasicList
      {...props}
      // aria-label="Listbox example"
      // maxWidth={292}
      // source={usa_states}
    />
  );
};

export const BasicListItemExample: Story<BasicListProps> = (props) => {
  return (
    <BasicList
      {...props}
      aria-label="Basic list items example"
      width={292}
      multiselect
    >
      <BasicListItem selected>Alabama</BasicListItem>
      <BasicListItem selected disabled>Alabama</BasicListItem>
      <BasicListItem>Alabama</BasicListItem>
      <BasicListItem disabled>Alabama</BasicListItem>
      <BasicListItem showCheckbox selected>Alabama</BasicListItem>
      <BasicListItem showCheckbox selected disabled>Alabama</BasicListItem>
      <BasicListItem showCheckbox>Alabama</BasicListItem>
      <BasicListItem showCheckbox disabled>Alabama</BasicListItem>
      <BasicListItem itemTextHighlightPattern="bama">Alabama</BasicListItem>
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
