import { Button, StackLayout, Text, useId } from "@salt-ds/core";
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
import { clsx } from "clsx";
import React, { type ReactElement } from "react";
import { type ListEvent, complexEventsData } from "./exampleData";

const id = useId();

const ListItem = ({ title, time }: ListEvent) => (
  <StaticListItem>
    <StaticListItemContent>
      <StackLayout gap={0.5}>
        <Text color="inherit" id={`label-${id}-${title}`}>
          {title}
        </Text>
        <Text
          styleAs="label"
          color="secondary"
          id={`secondary-label-${id}-${title}`}
        >
          {time}
        </Text>
      </StackLayout>
    </StaticListItemContent>
    <Button
      id={`information-button-${id}-${title}`}
      appearance="transparent"
      aria-label="Zoom information"
      aria-labelledby={clsx(
        `label-${id}-${title}`,
        `secondary-label-${id}-${title}`,
        `information-button-${id}-${title}`,
      )}
    >
      <VideoIcon aria-hidden />
    </Button>
    <Button
      id={`options-button-${id}`}
      appearance="transparent"
      aria-label="More options"
      aria-labelledby={clsx(
        `label-${id}-${title}`,
        `secondary-label-${id}-${title}`,
        `options-button-${id}-${title}`,
      )}
    >
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
