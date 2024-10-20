import { Button, Divider, StackLayout, Text, useId } from "@salt-ds/core";
import { CalendarIcon, OverflowMenuIcon, VideoIcon } from "@salt-ds/icons";
import {
  StaticList,
  StaticListItem,
  StaticListItemContent,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { clsx } from "clsx";
import { QAContainer, type QAContainerProps } from "docs/components";
import React, { Fragment } from "react";
import { complexEventsData, eventsData } from "../assets/exampleData";

export default {
  title: "Lab/Static List/Static List QA",
  component: StaticList,
} as Meta<typeof StaticList>;

export const AllExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={4} width={1300} itemPadding={5} vertical transposeDensity>
    <StaticList style={{ width: "320px" }}>
      <StaticListItem>
        <StaticListItemContent>Team meeting</StaticListItemContent>
      </StaticListItem>
    </StaticList>
    <StaticList style={{ width: "320px" }}>
      {eventsData.slice(0, 3).map((event, _index) => (
        <StaticListItem key={event}>
          <StaticListItemContent>
            <Text>{event}</Text>
          </StaticListItemContent>
        </StaticListItem>
      ))}
    </StaticList>
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
    <StaticList style={{ width: "320px" }}>
      {complexEventsData.map(({ title, time }) => {
        const id = useId();
        return (
          <StaticListItem key={title}>
            <StaticListItemContent>
              <StackLayout gap={0.5}>
                <Text color="inherit" id={`label-${id}`}>
                  {title}
                </Text>
                <Text
                  styleAs="label"
                  color="secondary"
                  id={`secondary-label-${id}`}
                >
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
      })}
    </StaticList>
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
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        themeNext: "disable",
      },
      themeNext: {
        themeNext: "enable",
        corner: "rounded",
        accent: "teal",
        // Ignore headingFont given font is not loaded
      },
    },
  },
};
