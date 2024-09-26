import { Button, Divider, StackLayout, Text } from "@salt-ds/core";
import { CalendarIcon, OverflowMenuIcon, VideoIcon } from "@salt-ds/icons";
import {
  StaticList,
  StaticListItem,
  StaticListItemContent,
  type StaticListProps,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import React, { useState } from "react";
import { complexEventsData, eventsData } from "../assets/exampleData";

export default {
  title: "Lab/Static List",
  component: StaticList,
} as Meta<typeof StaticList>;

export const Multiple: StoryFn<StaticListProps> = () => {
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
          <StaticListItem key={_index}>
            <StaticListItemContent>{eventsData[_index]}</StaticListItemContent>
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
      ))}
    </StaticList>
  );
};

export const WithIcons: StoryFn<StaticListProps> = () => {
  return (
    <StaticList style={{ width: "320px" }}>
      {complexEventsData.map(({ title, time }) => (
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
      ))}
    </StaticList>
  );
};

export const WithButtons: StoryFn<StaticListProps> = () => {
  return (
    <StaticList style={{ width: "320px" }}>
      {complexEventsData.map(({ title, time }) => (
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
      ))}
    </StaticList>
  );
};

export const WithDividers: StoryFn<StaticListProps> = () => {
  return (
    <StaticList style={{ width: "320px" }}>
      {complexEventsData.map(({ title, time }, _index) => (
        <>
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
            <Divider variant="tertiary" />
          )}
        </>
      ))}
    </StaticList>
  );
};
