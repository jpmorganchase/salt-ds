import { ComponentMeta, Story } from "@storybook/react";
import { ListNext, ListItemNext, ListNextProps } from "../../src";
import { FlexItem, FlexLayout } from "@salt-ds/core";

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

const getListItems = ({
  disabledItems = [],
  selectedItems = [],
}: {
  disabledItems?: number[];
  selectedItems?: number[];
}) =>
  SimpleListExample.map((item, index) => {
    return (
      <ListItemNext
        key={index}
        disabled={disabledItems.includes(index)}
        selected={selectedItems ? selectedItems.includes(index) : undefined}
        value={item}
      >
        {item}
      </ListItemNext>
    );
  });

export const Default: Story<ListNextProps> = ({ children, ...rest }) => {
  return (
    <ListNext {...rest} aria-label="Declarative List example">
      {children ||
        getListItems({
          disabledItems: [1, 5],
        })}
    </ListNext>
  );
};

Default.args = {
  style: { width: "200px" },
};

export const Borderless = Default.bind({});
Borderless.args = {
  borderless: true,
};

export const ConfigurableHeight = Default.bind({});
ConfigurableHeight.args = {
  displayedItemCount: 6,
};

export const Deselectable = Default.bind({});
Deselectable.args = {
  deselectable: true,
};

export const Disabled = Default.bind({});
Disabled.args = {
  disabled: true,
};

export const DisabledSelected = Default.bind({});
DisabledSelected.args = {
  children: getListItems({
    disabledItems: [1],
    selectedItems: [1],
  }),
};

export const Empty: Story<ListNextProps> = ({ children, ...rest }) => {
  return (
    <FlexLayout>
      <FlexItem>
        <p>Default message</p>
        <ListNext aria-label="Empty List default example" />
      </FlexItem>
      <FlexItem>
        <p>Custom message</p>
        <ListNext {...rest} aria-label="Empty List custom message example" />
      </FlexItem>
    </FlexLayout>
  );
};
Empty.args = {
  emptyMessage: "List is empty",
};

//
// const CustomItemComponent = ({item}) => {
//   return <div>{item}
//   </div>
// }
// const customItems = SimpleListExample.map((item, index) => {
//   return <CustomItemComponent item={item}/>;
// });
//
// export const CustomListItem = Default.bind({});
// CustomListItem.args = {
//   children: customItems,
// };
