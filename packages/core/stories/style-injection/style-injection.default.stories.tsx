import { Button, SaltProvider } from "@salt-ds/core";
import type { StoryFn } from "@storybook/react-vite";

export default {
  title: "Core/Style Injection",
  component: SaltProvider,
};

export const RootDefault: StoryFn = () => (
  <SaltProvider>
    <Button>style injection enabled</Button>
    <SaltProvider>
      <Button>Nested - style injection enabled</Button>
    </SaltProvider>
  </SaltProvider>
);

RootDefault.parameters = {
  chromatic: { disableSnapshot: false },
};
