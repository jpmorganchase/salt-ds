import { Card, SaltProvider, Scrim, Spinner } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import { DetailedHTMLProps } from "react";

export default {
  title: "Core/Scrim/Scrim QA",
  component: Scrim,
} as Meta<typeof Scrim>;

const AllModes = ({
  children,
}: DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
  <>
    <SaltProvider mode="light">{children}</SaltProvider>
    <SaltProvider mode="dark">{children}</SaltProvider>
  </>
);

export const InContainer: StoryFn<typeof Scrim> = () => (
  <AllModes>
    <Card style={{ position: "relative", width: "512px" }}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua.
      <Scrim open />
    </Card>
  </AllModes>
);

InContainer.parameters = {
  chromatic: { disableSnapshot: false },
};

export const Fixed: StoryFn<typeof Scrim> = () => (
  <AllModes>
    <Card style={{ position: "relative", width: "512px" }}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua.
      <Scrim open fixed />
    </Card>
  </AllModes>
);

Fixed.parameters = {
  chromatic: { disableSnapshot: false },
};

export const WithChildren: StoryFn<typeof Scrim> = () => (
  <AllModes>
    <Card style={{ position: "relative", width: "512px" }}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua.
      <Scrim open>
        <Spinner size="medium" />
      </Scrim>
    </Card>
  </AllModes>
);

WithChildren.parameters = {
  chromatic: { disableSnapshot: false },
};
