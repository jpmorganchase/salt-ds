import { Button, SaltProvider } from "@salt-ds/core";
import type { StoryFn } from "@storybook/react-vite";

export default {
  title: "Core/Style Injection",
  component: SaltProvider,
};

export const RootDisabled: StoryFn = () => (
  <SaltProvider enableStyleInjection={false}>
    <Button>Root - style injection disabled</Button>
    <SaltProvider>
      <Button>
        Nested - style injection enabled (but should inherit from root)
      </Button>
    </SaltProvider>
  </SaltProvider>
);

RootDisabled.parameters = {
  chromatic: { disableSnapshot: false },
};
