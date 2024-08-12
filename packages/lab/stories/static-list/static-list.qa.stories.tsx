import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

import {
  Button,
  FlexLayout,
  StackLayout,
  StatusIndicator,
  Text,
} from "@salt-ds/core";
import { DeleteIcon } from "@salt-ds/icons";
import { StaticList, StaticListItem } from "@salt-ds/lab";

export default {
  title: "Lab/Static List/QA",
  component: StaticList,
} as Meta<typeof StaticList>;

export const AllExamples: StoryFn<QAContainerProps> = ({ imgSrc }) => (
  <QAContainer cols={4} height={950} imgSrc={imgSrc} itemPadding={5}>
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
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
