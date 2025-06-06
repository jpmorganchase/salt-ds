import { Button, SaltProvider } from "@salt-ds/core";
import type { StoryFn } from "@storybook/react-vite";

export default {
  title: "Core/Style Injection",
  component: SaltProvider,
};

export const RootEnabled: StoryFn = () => (
  <SaltProvider enableStyleInjection={true}>
    <Button>Root - style injection enabled</Button>
    <SaltProvider enableStyleInjection={false}>
      <Button>Nested - style injection disabled</Button>
    </SaltProvider>
  </SaltProvider>
);

RootEnabled.parameters = {
  chromatic: { disableSnapshot: false },
};
