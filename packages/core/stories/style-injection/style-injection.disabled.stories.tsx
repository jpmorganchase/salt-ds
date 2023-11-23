import { Button } from "@salt-ds/core";
import { StoryFn } from "@storybook/react";
import { SaltProvider } from "@salt-ds/core";

export default {
  title: "Core/Style Injection",
  component: SaltProvider,
};

export const RootDisabled: StoryFn = () => (
  <SaltProvider enableStyleInjection={false}>
    <Button variant="primary">Root - style injection disabled</Button>
    <SaltProvider>
      <Button variant="primary">
        Nested - style injection enabled (but should inherit from root)
      </Button>
    </SaltProvider>
  </SaltProvider>
);

RootDisabled.parameters = {
  chromatic: { disableSnapshot: false },
};
