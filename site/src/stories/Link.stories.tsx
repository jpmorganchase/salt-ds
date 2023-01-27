import Link from "../components/link/Link";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { MemoryRouter } from "react-router";

export default {
  title: "Components/Link",
  component: Link,
} as ComponentMeta<typeof Link>;

const LinkExample: ComponentStory<typeof Link> = (args) => {
  return (
    <MemoryRouter>
      <Link to="/" {...args}>
        Read the guides
      </Link>
    </MemoryRouter>
  );
};

export const Default = LinkExample.bind({});
Default.args = {};
