import Card from "../components/card/Card";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { MemoryRouter } from "react-router";
import PencilIcon from "../../static/img/pencil.svg";
import CodeIcon from "@site/static/img/code.svg";
import ArrowsIcon from "@site/static/img/arrows.svg";

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
        url="/getting-started"
        keylineColor="var(--site-tertiary-accent-purple)"
        {...args}
      />
    </MemoryRouter>
  );
};

export const Default = CardExample.bind({});
Default.args = {};

const CardGridExample: ComponentStory<typeof Card> = () => {
  return (
    <MemoryRouter>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
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
          url="/getting-started"
          keylineColor="var(--site-tertiary-accent-purple)"
        />
        <Card
          title="Browse our components"
          description={
            <p>
              Our suite of UI components is built with accessibility in mind.
              Each component is thoroughly tested before release and optimized
              for multiple use cases.
            </p>
          }
          footerText="Explore components"
          icon={<CodeIcon />}
          url="/components"
          keylineColor="var(--site-tertiary-accent-teal)"
        />
        <Card
          title="Get involved"
          description={
            <p>
              We welcome bug reports, fixes and other contributions—and would
              love to receive your feedback and suggestions. Reach out to us on
              GitHub or via email.
            </p>
          }
          footerText="Contact us"
          icon={<ArrowsIcon />}
          url="/support-and-contributions"
          keylineColor="var(--site-tertiary-accent-orange)"
        />
      </div>
    </MemoryRouter>
  );
};

export const CardGrid = CardGridExample.bind({});
CardGrid.args = {};
