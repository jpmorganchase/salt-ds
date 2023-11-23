import { Button } from "@salt-ds/core";
import { StoryFn } from "@storybook/react";
import { SaltProvider } from "@salt-ds/core";

export default {
  title: "Core/Style Injection",
  component: SaltProvider,
};

export const RootDefault: StoryFn = () => (
  <SaltProvider>
    <Button variant="primary">style injection enabled</Button>
    <SaltProvider>
      <Button variant="primary">Nested - style injection enabled</Button>
    </SaltProvider>
  </SaltProvider>
);

RootDefault.parameters = {
  chromatic: { disableSnapshot: false },
};
