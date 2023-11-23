import { Button } from "@salt-ds/core";
import { StoryFn } from "@storybook/react";
import { SaltProvider } from "@salt-ds/core";

export default {
  title: "Core/Style Injection",
  component: SaltProvider,
};

export const RootEnabled: StoryFn = () => (
  <SaltProvider enableStyleInjection={true}>
    <Button variant="primary">Root - style injection enabled</Button>
    <SaltProvider enableStyleInjection={false}>
      <Button variant="primary">Nested - style injection disabled</Button>
    </SaltProvider>
  </SaltProvider>
);

RootEnabled.parameters = {
  chromatic: { disableSnapshot: false },
};
