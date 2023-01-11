import Card from "../components/card/Card";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { MemoryRouter } from "react-router";
import PencilIcon from "../../static/img/pencil.svg";

export default {
  title: "Components/Card",
  component: Card,
  argTypes: {
    keyLineAnimation: { control: { type: "boolean" } },
    keylineColor: { control: "color" },
  },
} as ComponentMeta<typeof Card>;

const CardExample: ComponentStory<typeof Card> = (args) => {
  return (
    <MemoryRouter>
      <Card
        title="Design and develop"
        description={
          <p>
            Follow our step-by-step process to access our Figma libraries. If
            you’re a developer, we show you how to install and start using the
            Salt packages.
          </p>
        }
        footerText="Read the guides"
        icon={<PencilIcon />}
        url="/"
        keylineColor="var(--site-tertiary-accent-purple)"
        {...args}
      />
    </MemoryRouter>
  );
};

export const Default = CardExample.bind({});
Default.args = {};
