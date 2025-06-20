import { Button, Divider, StackLayout, Text } from "@salt-ds/core";
import { CalendarIcon, OverflowMenuIcon, VideoIcon } from "@salt-ds/icons";
import {
  StaticList,
  StaticListItem,
  StaticListItemContent,
  type StaticListProps,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { clsx } from "clsx";
import { Fragment, useState } from "react";
import { complexEventsData, eventsData } from "../assets/exampleData";

export default {
  title: "Lab/Static List",
  component: StaticList,
} as Meta<typeof StaticList>;

export const Default: StoryFn<StaticListProps> = () => {
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
          <StaticListItem key={event}>
            <StaticListItemContent>
              <Text>{event}</Text>
            </StaticListItemContent>
          </StaticListItem>
        ))}
      </StaticList>
    </StackLayout>
  );
};

export const ComplexLabel: StoryFn<StaticListProps> = () => {
  return (
    <StaticList style={{ width: "320px" }}>
      {complexEventsData.map(({ title, time }) => (
        <StaticListItem key={title}>
          <StaticListItemContent>
            <StackLayout gap={0.5}>
              <Text color="inherit">{title}</Text>
              <Text styleAs="label" color="secondary">
                {time}
              </Text>
            </StackLayout>
          </StaticListItemContent>
        </StaticListItem>
      ))}
    </StaticList>
  );
};

export const WithIcons: StoryFn<StaticListProps> = () => {
  return (
    <StaticList style={{ width: "320px" }}>
      {complexEventsData.map(({ title, time }) => (
        <StaticListItem key={title}>
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
      ))}
    </StaticList>
  );
};

export const WithButtons: StoryFn<StaticListProps> = () => (
  <StaticList style={{ width: "320px" }}>
    {complexEventsData.map(({ title, time }, index) => {
      return (
        <StaticListItem key={title}>
          <StaticListItemContent>
            <StackLayout gap={0.5}>
              <Text color="inherit" id={`label-${index}`}>
                {title}
              </Text>
              <Text
                styleAs="label"
                color="secondary"
                id={`secondary-label-${index}`}
              >
                {time}
              </Text>
            </StackLayout>
          </StaticListItemContent>
          <Button
            id={`information-button-${index}`}
            appearance="transparent"
            aria-label="Zoom information"
            aria-labelledby={clsx(
              `label-${index}`,
              `secondary-label-${index}`,
              `information-button-${index}`,
            )}
          >
            <VideoIcon aria-hidden />
          </Button>
          <Button
            id={`options-button-${index}`}
            appearance="transparent"
            aria-label="More options"
            aria-labelledby={clsx(
              `label-${index}`,
              `secondary-label-${index}`,
              `options-button-${index}`,
            )}
          >
            <OverflowMenuIcon aria-hidden />
          </Button>
        </StaticListItem>
      );
    })}
  </StaticList>
);

export const WithDividers: StoryFn<StaticListProps> = () => {
  return (
    <StaticList style={{ width: "320px" }}>
      {complexEventsData.map(({ title, time }, _index) => (
        <Fragment key={title}>
          <StaticListItem>
            <StaticListItemContent>
              <StackLayout gap={0.5}>
                <Text color="inherit">{title}</Text>
                <Text styleAs="label" color="secondary">
                  {time}
                </Text>
              </StackLayout>
            </StaticListItemContent>
          </StaticListItem>
          {_index < complexEventsData.length - 1 && (
            <Divider variant="tertiary" aria-hidden />
          )}
        </Fragment>
      ))}
    </StaticList>
  );
};
