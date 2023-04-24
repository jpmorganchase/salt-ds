import { useEffect, useState } from "react";
import {
  Button,
  Card,
  GridItem,
  FlexLayout,
  GridLayout,
  H1,
  Spinner,
} from "@salt-ds/core";
import { CoffeeIcon } from "@salt-ds/icons";
import { ComponentMeta, ComponentStory, Story } from "@storybook/react";
import { AllRenderer } from "docs/components";

export default {
  title: "Core/Spinner",
  component: Spinner,
  args: {
    "aria-label": "loading",
    role: "status",
  },
} as ComponentMeta<typeof Spinner>;

const Template: ComponentStory<typeof Spinner> = (args) => {
  return <Spinner {...args} />;
};

export const All: Story = () => {
  return (
    <div>
      <H1>Default</H1>
      <AllRenderer>
        <Spinner />
      </AllRenderer>
      <H1>Large</H1>
      <AllRenderer>
        <Spinner size="large" />
      </AllRenderer>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  size: "default",
};

export const Large = Template.bind({});
Large.args = {
  size: "large",
};

type LoadingStatus = "loading" | "loaded" | "idle";

export const Loading: Story = () => {
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
    <div style={{ textAlign: "center" }}>
      <p>Please wait for action to complete.</p>
      {loadingStatus === "loading" ? (
        <Spinner
          style={{ margin: "auto" }}
          aria-label="Panel is loading"
          size="large"
        />
      ) : (
        <>
          <p>Action complete.</p>
          <Button onClick={handleClick}>Reload</Button>
        </>
      )}
    </div>
  );
};

export const PartialLoading: Story = () => {
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
            <p>
              Default spinners can be beneficial for partial loading
              experiences.
            </p>
          </GridItem>
          <GridItem verticalAlignment="center" style={{ margin: "auto" }}>
            {loadingStatus !== "idle" ? (
              loadingStatus === "loading" ? (
                <Spinner style={{ margin: "auto" }} aria-label="submitting" />
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

export const WithButton: Story = () => {
  const [exampleOneIsLoading, setExampleOneIsLoading] = useState(false);
  const [exampleTwoIsLoading, setExampleTwoIsLoading] = useState(false);

  return (
    <>
      <div>
        <p>Default</p>
        {exampleOneIsLoading && <Spinner style={{ margin: "auto" }} />}
        <Button
          onClick={() => setExampleOneIsLoading(!exampleOneIsLoading)}
          style={{ marginTop: 15 }}
        >
          {exampleOneIsLoading ? "Stop" : "Start"}
        </Button>
      </div>
      <div>
        <p>
          Custom interval (2s), custom announcer timeout (60s), custom aria
          label and custom finishing message
        </p>
        {exampleTwoIsLoading && (
          <Spinner
            announcerInterval={2000}
            announcerTimeout={60000}
            aria-label="dashboard panel loading"
            completionAnnouncement="dashboard panel loading successful"
            style={{ margin: "auto" }}
          />
        )}
        <Button
          onClick={() => setExampleTwoIsLoading(!exampleTwoIsLoading)}
          style={{ marginTop: 15 }}
        >
          {exampleTwoIsLoading ? "Stop" : "Start"}
        </Button>
      </div>
    </>
  );
};
