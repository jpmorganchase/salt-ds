import { ComponentMeta, Story } from "@storybook/react";
import { ListNext, ListItemNext, ListNextProps } from "../../src";
import { Button, FlexLayout } from "@salt-ds/core";
import { useState } from "react";

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
        selected={selectedItems?.includes(index)}
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

export const ConfigurableHeight = Default.bind({});
ConfigurableHeight.args = {
  displayedItemCount: 6,
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
  const [showList, setShowList] = useState(false);
  const listItems = showList
    ? getListItems({
        disabledItems: [1, 5],
      })
    : [];

  return (
    <FlexLayout direction="column" style={{ height: "200px" }}>
      <Button onClick={() => setShowList(!showList)}>Toggle list</Button>

      {listItems.length > 0 ? (
        <ListNext {...rest} aria-label="Populated List example">
          {listItems}
        </ListNext>
      ) : (
        <div>List is empty</div>
      )}
    </FlexLayout>
  );
};
