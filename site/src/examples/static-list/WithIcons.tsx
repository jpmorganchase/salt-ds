import { StackLayout, Text } from "@salt-ds/core";
import { CalendarIcon } from "@salt-ds/icons";
import {
  StaticList,
  StaticListItem,
  StaticListItemContent,
} from "@salt-ds/lab";
import type { ReactElement } from "react";
import { complexEventsData, type ListEvent } from "./exampleData";

const ListItem = ({ title, time }: ListEvent) => (
  <StaticListItem>
    <CalendarIcon aria-hidden />
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
        <ListItem {...event} key={event.title} />
      ))}
    </StaticList>
  </div>
);
