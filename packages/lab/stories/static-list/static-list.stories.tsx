import type { Decorator, Meta, StoryFn } from "@storybook/react";

import {
  Button,
  FlexLayout,
  StackLayout,
  StatusIndicator,
  Text,
} from "@salt-ds/core";
import { DeleteIcon } from "@salt-ds/icons";

import { StaticList, StaticListItem, type StaticListProps } from "@salt-ds/lab";

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  width: "calc(100vw - 2em)",
};

const withFullViewWidth: Decorator = (Story) => (
  <div style={containerStyle}>
    <Story />
  </div>
);

export default {
  title: "Lab/Static List",
  component: StaticList,
  decorators: [withFullViewWidth],
} as Meta<typeof StaticList>;

export const Default: StoryFn<StaticListProps> = (props) => {
  return (
    <StaticList>
      <StaticListItem style={{ width: "320px" }}>
        <StackLayout direction="row" gap={1} style={{ width: "100%" }}>
          <StatusIndicator status={"success"} />
          <StackLayout gap={0.5} align="start">
            <Text>J.P.MorganChase.png</Text>
            <FlexLayout direction={"row"} gap={1}>
              <Text styleAs="label" color="secondary">
                500KB
              </Text>
              <Text styleAs="label" color="secondary">
                •
              </Text>
              <Text styleAs="label" color="secondary">
                July 2024
              </Text>
            </FlexLayout>
          </StackLayout>
          <Button
            className="saltFileItemAction"
            variant="secondary"
            aria-label="Delete"
            style={{ marginLeft: "auto" }}
          >
            {<DeleteIcon aria-hidden />}
          </Button>
        </StackLayout>
      </StaticListItem>
      <StaticListItem style={{ width: "320px" }}>
        <StackLayout direction="row" gap={1} style={{ width: "100%" }}>
          <StatusIndicator status={"error"} />
          <StackLayout gap={0.5} align="start">
            <Text>J.P.MorganChase.png</Text>
            <FlexLayout direction={"row"} gap={1}>
              <Text color="error" styleAs="label">
                File size exceeds 500KB
              </Text>
            </FlexLayout>
          </StackLayout>
          <Button
            className="saltFileItemAction"
            variant="secondary"
            aria-label="Delete"
            style={{ marginLeft: "auto" }}
          >
            {<DeleteIcon aria-hidden />}
          </Button>
        </StackLayout>
      </StaticListItem>
      <StaticListItem style={{ width: "320px" }}>
        <StackLayout direction="row" gap={1} style={{ width: "100%" }}>
          <StatusIndicator status={"error"} />
          <StackLayout gap={0.5} align="start">
            <Text>J.P.MorganChase.png</Text>
            <FlexLayout direction={"row"} gap={1}>
              <Text color="error" styleAs="label">
                File size exceeds 500KB
              </Text>
            </FlexLayout>
          </StackLayout>
          <Button
            className="saltFileItemAction"
            variant="secondary"
            aria-label="Delete"
            style={{ marginLeft: "auto" }}
          >
            {<DeleteIcon aria-hidden />}
          </Button>
        </StackLayout>
      </StaticListItem>
    </StaticList>
  );
};
