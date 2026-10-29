import {
  Button,
  Card,
  FlexItem,
  GridItem,
  GridLayout,
  Spinner,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { CoffeeIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useEffect, useState } from "react";

export default {
  title: "Core/Spinner",
  component: Spinner,
  args: {
    "aria-label": "loading",
    role: "status",
  },
} as Meta<typeof Spinner>;

const Template: StoryFn<typeof Spinner> = (args) => {
  return <Spinner {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  size: "default",
};

export const Large = Template.bind({});
Large.args = {
  size: "large",
};

export const Small = Template.bind({});
Small.args = {
  size: "small",
};

type LoadingStatus = "loading" | "loaded" | "idle";

export const Loading: StoryFn = () => {
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>("loading");

  useEffect(() => {
    if (loadingStatus === "loading") {
      const t = setTimeout(() => {
        setLoadingStatus("loaded");
      }, 5000);

      return () => {
        clearTimeout(t);
      };
    }
  }, [loadingStatus]);

  const handleClick = () => {
    setLoadingStatus("loading");
  };

  return (
    <StackLayout align="center">
      <Text>Please wait for action to complete.</Text>
      {loadingStatus === "loading" ? (
        <Spinner aria-label="Panel is loading" size="large" />
      ) : (
        <>
          <Text>Action complete.</Text>
          <Button onClick={handleClick}>Reload</Button>
        </>
      )}
    </StackLayout>
  );
};

export const PartialLoading: StoryFn = () => {
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>("idle");

  useEffect(() => {
    if (loadingStatus === "loading") {
      const t = setTimeout(() => {
        setLoadingStatus("loaded");
      }, 3000);

      return () => {
        clearTimeout(t);
      };
    }
  }, [loadingStatus]);

  const handleClick = () => {
    setLoadingStatus("loading");
  };

  const handleReset = () => {
    setLoadingStatus("idle");
  };

  return (
    <div style={{ display: "grid", rowGap: "10px" }}>
      <Card style={{ width: "366px" }}>
        <GridLayout rows={1} columns={2}>
          <GridItem style={{ padding: "10px" }}>
            <Text>
              Default spinners can be beneficial for partial loading
              experiences.
            </Text>
          </GridItem>
          <GridItem verticalAlignment="center" style={{ margin: "auto" }}>
            {loadingStatus !== "idle" ? (
              loadingStatus === "loading" ? (
                <Spinner aria-label="submitting" />
              ) : (
                <CoffeeIcon size={2} />
              )
            ) : (
              <Button onClick={handleClick}>Click me</Button>
            )}
          </GridItem>
        </GridLayout>
      </Card>
      <Button onClick={handleReset}>Reset</Button>
    </div>
  );
};

export const WithButton: StoryFn = () => {
  const [exampleOneIsLoading, setExampleOneIsLoading] = useState(false);
  const [exampleTwoIsLoading, setExampleTwoIsLoading] = useState(false);

  return (
    <StackLayout>
      <StackLayout gap={2} align="start">
        <Text>Default</Text>
        {exampleOneIsLoading && (
          <FlexItem align="center">
            <Spinner />
          </FlexItem>
        )}
        <Button onClick={() => setExampleOneIsLoading(!exampleOneIsLoading)}>
          {exampleOneIsLoading ? "Stop" : "Start"}
        </Button>
      </StackLayout>
      <StackLayout gap={2} align="start">
        <Text>
          Custom interval (2s), custom announcer timeout (60s), custom aria
          label and custom finishing message
        </Text>
        {exampleTwoIsLoading && (
          <FlexItem align="center">
            <Spinner
              announcerInterval={2000}
              announcerTimeout={60000}
              aria-label="dashboard panel loading"
              completionAnnouncement="dashboard panel loading successful"
            />
          </FlexItem>
        )}
        <Button onClick={() => setExampleTwoIsLoading(!exampleTwoIsLoading)}>
          {exampleTwoIsLoading ? "Stop" : "Start"}
        </Button>
      </StackLayout>
    </StackLayout>
  );
};
