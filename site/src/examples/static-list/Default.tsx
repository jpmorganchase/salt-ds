import { Button, StackLayout, Text } from "@salt-ds/core";
import { StaticList, StaticListItem } from "@salt-ds/lab";
import React, { type ReactElement, useState } from "react";
import { eventsData } from "./exampleData";

const ListItem = ({ event }: { event: string }) => (
  <StaticListItem>
    <Text>{event}</Text>
  </StaticListItem>
);

export const Default = (): ReactElement => {
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
          Show next event
        </Button>
        <Button onClick={handleReset}>Reset</Button>
      </StackLayout>
      <StaticList style={{ width: "320px", height: "250px" }}>
        {eventsData.slice(0, listCount).map((event, _index) => (
          <ListItem key={event} event={event} />
        ))}
      </StaticList>
    </StackLayout>
  );
};
