import { Button, Card, SaltProvider, Scrim } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Core/Scrim/Scrim QA",
  component: Scrim,
} as Meta<typeof Scrim>;

export const WithChildren: StoryFn<typeof Scrim> = () => (
  <>
    <SaltProvider mode="light">
      <Card style={{ position: "relative", width: "512px" }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
        <Scrim open>
          <Button>Close scrim</Button>
        </Scrim>
      </Card>
    </SaltProvider>
    <SaltProvider mode="dark">
      <Card style={{ position: "relative", width: "512px" }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
        <Scrim open>
          <Button>Close scrim</Button>
        </Scrim>
      </Card>
    </SaltProvider>
  </>
);

WithChildren.parameters = {
  chromatic: { disableSnapshot: false },
};
