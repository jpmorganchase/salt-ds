import { Button, StackLayout, Text } from "@salt-ds/core";
import {
  EditIcon,
  NoteIcon,
  OverflowMenuIcon,
  TearOutIcon,
  VideoIcon,
} from "@salt-ds/icons";
import {
  StaticList,
  StaticListItem,
  StaticListItemContent,
} from "@salt-ds/lab";
import React, { type ReactElement } from "react";
import { type ListEvent, complexEventsData } from "./exampleData";

const ListItem = ({ title, time, link }: ListEvent) => (
  <StaticListItem>
    <StaticListItemContent>
      <StackLayout gap={0.5}>
        <Text color="inherit">{title}</Text>
        <Text styleAs="label" color="secondary">
          {time}
        </Text>
      </StackLayout>
    </StaticListItemContent>
    <Button variant="secondary" aria-label="open in another tab">
      <VideoIcon aria-hidden />
    </Button>
    <Button variant="secondary" aria-label="more options">
      <OverflowMenuIcon aria-hidden />
    </Button>
  </StaticListItem>
);

export const WithButtons = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <StaticList style={{ width: "320px" }}>
      {complexEventsData.map((event) => (
        <ListItem {...event} key={event.title} />
      ))}
    </StaticList>
  </div>
);
