import { StackLayout, Text } from "@salt-ds/core";
import { CalendarIcon, NotificationIcon } from "@salt-ds/icons";
import {
  StaticList,
  StaticListItem,
  StaticListItemContent,
} from "@salt-ds/lab";
import React, { type ReactElement } from "react";
import { type ListEvent, complexEventsData } from "./exampleData";

const ListItem = ({ title, time }: ListEvent) => (
  <StaticListItem>
    <CalendarIcon />
    <StaticListItemContent>
      <StackLayout gap={0.5}>
        <Text color="inherit">{title}</Text>
        <Text styleAs="label" color="secondary">
          {time}
        </Text>
      </StackLayout>
    </StaticListItemContent>
  </StaticListItem>
);

export const WithIcons = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <StaticList style={{ width: "320px" }}>
      {complexEventsData.map((event) => (
        <ListItem {...event} />
      ))}
    </StaticList>
  </div>
);
