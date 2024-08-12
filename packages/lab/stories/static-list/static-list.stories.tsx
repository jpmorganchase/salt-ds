import type { Decorator, Meta, StoryFn } from "@storybook/react";

import {
  Button,
  FlexLayout,
  Spinner,
  StackLayout,
  StatusIndicator,
  Text,
} from "@salt-ds/core";
import { CloseIcon, DeleteIcon } from "@salt-ds/icons";

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

const files = [
  {
    name: "J.P.MorganChase.png",
    status: "completed",
    description: ["500KB", " •", "July 2024"],
  },
  {
    name: "J.P.MorganChase.png",
    status: "pending",
    description: ["0KB of 500KB", " •", "30 July 2024"],
  },
  {
    name: "J.P.MorganChase.png",
    status: "error",
    description: ["File size exceeds 500KB"],
  },
];

type FileItemStatus = "completed" | "pending" | "error";

function getStatusDecoration(status: FileItemStatus) {
  switch (status) {
    case "error":
      return <StatusIndicator status="error" />;
    case "pending":
      return <Spinner size="small" />;
    case "completed":
      return <StatusIndicator status="success" />;
  }
}

export const Default: StoryFn<StaticListProps> = (props) => {
  return (
    <StaticList>
      {files.map(({ status, name, description }) => (
        <StaticListItem style={{ width: "320px" }}>
          <StackLayout direction="row" gap={1} style={{ width: "100%" }}>
            {getStatusDecoration(status as FileItemStatus)}
            <StackLayout gap={0.5} align="start">
              <Text>{name}</Text>
              <FlexLayout direction={"row"} gap={1}>
                {description.map((text) => (
                  <Text
                    styleAs="label"
                    color={status === "error" ? status : "secondary"}
                  >
                    {text}
                  </Text>
                ))}
              </FlexLayout>
            </StackLayout>
            <Button
              variant="secondary"
              aria-label={status === "pending" ? "Cancel" : "Delete"}
              style={{ marginLeft: "auto" }}
            >
              {status === "pending" ? (
                <CloseIcon aria-hidden />
              ) : (
                <DeleteIcon aria-hidden />
              )}
            </Button>
          </StackLayout>
        </StaticListItem>
      ))}
    </StaticList>
  );
};
