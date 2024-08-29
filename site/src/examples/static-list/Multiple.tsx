import { Button, StackLayout, Text } from "@salt-ds/core";
import { StaticList, StaticListItem } from "@salt-ds/lab";
import React, { type ReactElement, useState } from "react";

const ListItem = () => (
  <StaticListItem>
    <StackLayout
      gap={0.5}
      style={{ padding: "var(--salt-spacing-75) 0", width: "100%" }}
    >
      <Text color="inherit">Item label</Text>
    </StackLayout>
  </StaticListItem>
);

export const Multiple = (): ReactElement => {
  const [listArray, setListArray] = useState([ListItem, ListItem]);

  const handleListItem = () => {
    setListArray([...listArray, ListItem]);
  };
  const handleReset = () => {
    setListArray([ListItem, ListItem]);
  };
  return (
    <StackLayout>
      <StackLayout direction={"row"}>
        <Button onClick={handleListItem}>Add list item</Button>
        <Button onClick={handleReset}>Reset list</Button>
      </StackLayout>
      <StaticList style={{ width: "320px", height: "250px" }}>
        {listArray.map((item, _index) => (
          <ListItem key={_index} />
        ))}
      </StaticList>
    </StackLayout>
  );
};
