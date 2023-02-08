import { useState } from "react";
import { Button } from "@salt-ds/core";
import { Spinner } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory, Story } from "@storybook/react";

export default {
  title: "Lab/Spinner",
  component: Spinner,
  args: {
    "aria-label": "loading",
    role: "status",
  },
} as ComponentMeta<typeof Spinner>;

const Template: ComponentStory<typeof Spinner> = (args) => {
  return <Spinner {...args} />;
};

export const FeatureSpinner = Template.bind({});

export const Small = Template.bind({});
Small.args = {
  size: "small",
};

export const Medium = Template.bind({});
Medium.args = {
  size: "medium",
};

export const Large = Template.bind({});
Large.args = {
  size: "large",
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
