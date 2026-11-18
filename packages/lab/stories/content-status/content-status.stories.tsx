import {
  AriaAnnouncerProvider,
  Button,
  Card,
  FlexLayout,
  StackLayout,
  Text,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { ContentStatus, type ContentStatusProps } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useCallback, useState } from "react";

export default {
  title: "Lab/Content Status",
  component: ContentStatus,
} as Meta<typeof ContentStatus>;

const loadData = () =>
  new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject();
    }, 2000);
  });

export const Error: StoryFn<typeof ContentStatus> = () => {
  const buttonRef = useCallback((node: HTMLButtonElement) => {
    if (node) {
      node.focus();
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const loadingProps: ContentStatusProps = {
    status: "loading",
    message: "We're retrieving your data. This shouldn't take long.",
  };

  const errorProps: ContentStatusProps = {
    status: "error",
    title: "There's been a system error",
    message: "It should be temporary, so please try again.",
    actionLabel: "RELOAD",
    onActionClick: () => {
      setIsLoading(true);
      loadData().catch(() => {
        setIsLoading(false);
      });
    },
  };

  const contentStatusProps = isLoading ? loadingProps : errorProps;
  return <ContentStatus {...contentStatusProps} buttonRef={buttonRef} />;
};

export const IndeterminateLoading: StoryFn<typeof ContentStatus> = () => (
  <ContentStatus
    message="Supplementary content can go here if required."
    status="loading"
  />
);

export const DeterminateLoading: StoryFn<typeof ContentStatus> = () => (
  <ContentStatus
    message="Supplementary content can go here if required."
    status="loading"
    value={38}
  />
);

export const Information: StoryFn<typeof ContentStatus> = () => (
  <ContentStatus
    actionLabel="[CUSTOM ACTION]"
    message="Supplementary content can go here if required."
    onActionClick={() => console.log("Custom action")}
    title="No [content] available"
  />
);

export const Success: StoryFn<typeof ContentStatus> = () => (
  <ContentStatus
    message="Supplementary content can go here if required."
    status="success"
  />
);

export const Warning: StoryFn<typeof ContentStatus> = () => (
  <ContentStatus
    actionLabel="[CUSTOM ACTION]"
    message="Supplementary content can go here if required."
    onActionClick={() => console.log("Custom action")}
    status="warning"
    title="No permission to access [content]"
  />
);

const RealContent = (props: { messages: string[] }) => {
  const { messages } = props;
  const { announce } = useAriaAnnouncer();

  // We want to announce the message so screenreader can get it
  // If the real content contains tons of content, e.g. a grid, we would not want to announce everything.
  announce(messages.join(" "));

  return (
    <StackLayout gap={1}>
      {messages.map((m) => (
        <Text as="p" key={m}>
          {m}
        </Text>
      ))}
    </StackLayout>
  );
};

/**
 * Example showing content of Card loop between Error => Loading => Content => Loading => ...
 */
export const CardContent: StoryFn<typeof ContentStatus> = () => {
  const buttonRef = useCallback((node: HTMLButtonElement) => {
    if (node) {
      // Focus the error 'reload' button or the first action button as that's the primary action a user would want to take
      node.focus();
    }
  }, []);
  const [loadingCount, setLoadingCount] = useState(0);
  const loadingProps: ContentStatusProps = {
    status: "loading",
    message: "We're retrieving your data. This shouldn't take long.",
  };

  const startLoading = () => {
    setLoadingCount((c) => c + 1);
    loadData().catch(() => {
      setLoadingCount((c) => c + 1);
    });
  };

  const errorProps: ContentStatusProps = {
    status: "error",
    title: "There's been a system error",
    message: "It should be temporary, so please try again.",
    actionLabel: "RELOAD",
    onActionClick: startLoading,
  };

  const renderRealContent = () => {
    const messages = [
      `This is showing data at ${Date()}.`,
      "To get new data, use the refresh button below.",
    ];
    return <RealContent messages={messages} />;
  };

  const contentStatusProps = loadingCount % 2 ? loadingProps : errorProps;
  return (
    <AriaAnnouncerProvider>
      <Card>
        {loadingCount % 4 === 2 ? (
          <StackLayout>
            {renderRealContent()}
            <FlexLayout gap={2}>
              <Button ref={buttonRef}>Action 1</Button>
              <Button>Action 2</Button>
              {/* We don't set the focus for the 'refresh' button like the one within ContentStatus because this is not the primary action a user want to take when real content is shown on screen. */}
              <Button onClick={startLoading}>Refresh</Button>
            </FlexLayout>
          </StackLayout>
        ) : (
          <ContentStatus {...contentStatusProps} buttonRef={buttonRef} />
        )}
      </Card>
    </AriaAnnouncerProvider>
  );
};
