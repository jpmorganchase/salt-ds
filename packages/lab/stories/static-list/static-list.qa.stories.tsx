import { Button, Divider, StackLayout, Text } from "@salt-ds/core";
import { CalendarIcon, OverflowMenuIcon, VideoIcon } from "@salt-ds/icons";
import {
  StaticList,
  StaticListItem,
  StaticListItemContent,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";
import React, { Fragment } from "react";
import { complexEventsData, eventsData } from "../assets/exampleData";

export default {
  title: "Lab/Static List/Static List QA",
  component: StaticList,
} as Meta<typeof StaticList>;

export const AllExamples: StoryFn<QAContainerProps> = ({ imgSrc }) => (
  <QAContainer cols={5} height={950} imgSrc={imgSrc} itemPadding={5}>
    <StaticList style={{ width: "320px" }}>
      <StaticListItem>
        <StaticListItemContent>Team meeting</StaticListItemContent>
      </StaticListItem>
    </StaticList>
    <StaticList style={{ width: "320px" }}>
      {Array.from({ length: 3 }, (_, _index) => (
        <StaticListItem key={_index}>
          <StaticListItemContent>{eventsData[_index]}</StaticListItemContent>
        </StaticListItem>
      ))}
    </StaticList>
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
    <StaticList style={{ width: "320px" }}>
      {complexEventsData.map(({ title, time }) => (
        <StaticListItem key={title}>
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
            <Divider variant="tertiary" />
          )}
        </Fragment>
      ))}
    </StaticList>
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
