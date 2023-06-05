import { Logo, LogoImage, LogoSeparator, LogoTitle } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import PlaceholderLogo from "docs/assets/placeholder.svg";

export default {
  title: "Lab/Logo",
  component: Logo,
} as ComponentMeta<typeof Logo>;

const Template: ComponentStory<typeof Logo> = (args) => {
  return (
    <Logo {...args}>
      <LogoImage src={PlaceholderLogo} />
      <LogoSeparator />
      <LogoTitle>Company name</LogoTitle>
    </Logo>
  );
};

export const Default = Template.bind({});
