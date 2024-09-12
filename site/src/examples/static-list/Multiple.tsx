import { Button, StackLayout } from "@salt-ds/core";
import {
  StaticList,
  StaticListItem,
  StaticListItemContent,
} from "@salt-ds/lab";
import React, { type ReactElement, useState } from "react";

const ListItem = () => (
  <StaticListItem>
    <StaticListItemContent>Item label</StaticListItemContent>
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
