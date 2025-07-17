import { Button, StackLayout, Text, useId } from "@salt-ds/core";
import { OverflowMenuIcon, VideoIcon } from "@salt-ds/icons";
import {
  StaticList,
  StaticListItem,
  StaticListItemContent,
} from "@salt-ds/lab";
import { clsx } from "clsx";
import type { ReactElement } from "react";
import { complexEventsData, type ListEvent } from "./exampleData";

const ListItem = ({ title, time }: ListEvent) => {
  const id = useId();

  return (
    <StaticListItem>
      <StaticListItemContent>
        <StackLayout gap={0.5}>
          <Text color="inherit" id={`label-${id}`}>
            {title}
          </Text>
          <Text styleAs="label" color="secondary" id={`secondary-label-${id}`}>
            {time}
          </Text>
        </StackLayout>
      </StaticListItemContent>
      <Button
        id={`information-button-${id}`}
        appearance="transparent"
        aria-label="Zoom information"
        aria-labelledby={clsx(
          `label-${id}`,
          `secondary-label-${id}`,
          `information-button-${id}`,
        )}
      >
        <VideoIcon aria-hidden />
      </Button>
      <Button
        id={`options-button-${id}`}
        appearance="transparent"
        aria-label="More options"
        aria-labelledby={clsx(
          `label-${id}`,
          `secondary-label-${id}`,
          `options-button-${id}`,
        )}
      >
        <OverflowMenuIcon aria-hidden />
      </Button>
    </StaticListItem>
  );
};

export const WithButtons = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <StaticList style={{ width: "320px" }}>
      {complexEventsData.map((event) => (
        <ListItem {...event} key={event.title} />
      ))}
    </StaticList>
  </div>
);
