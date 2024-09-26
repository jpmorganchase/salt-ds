import { Button, StackLayout } from "@salt-ds/core";
import {
  StaticList,
  StaticListItem,
  StaticListItemContent,
} from "@salt-ds/lab";
import React, { type ReactElement, useState } from "react";
import { eventsData } from "./exampleData";

const ListItem = ({ event }: { event: string }) => (
  <StaticListItem>
    <StaticListItemContent>{event}</StaticListItemContent>
  </StaticListItem>
);

export const Multiple = (): ReactElement => {
  const [listCount, setListCount] = useState(3);

  const handleListItem = () => {
    setListCount((prev) => prev + 1);
  };
  const handleReset = () => {
    setListCount(3);
  };
  return (
    <StackLayout>
      <StackLayout direction={"row"}>
        <Button
          onClick={handleListItem}
          disabled={listCount > eventsData.length - 1}
        >
          {`Show next ${listCount + 1} events`}
        </Button>
        <Button onClick={handleReset}>Reset</Button>
      </StackLayout>
      <StaticList style={{ width: "320px", height: "250px" }}>
        {Array.from({ length: listCount }, (_, _index) => (
          <ListItem key={_index} event={eventsData[_index]} />
        ))}
      </StaticList>
    </StackLayout>
  );
};
