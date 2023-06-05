import { Logo, LogoImage, LogoSeparator, LogoText } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import PlaceholderLogo from "docs/assets/placeholder.svg";

export default {
  title: "Lab/Logo",
  component: Logo,
} as ComponentMeta<typeof Logo>;

const Template: ComponentStory<typeof Logo> = (args) => <Logo {...args} />;

export const Default = () => (
  <Template>
    <LogoImage src={PlaceholderLogo} />
    <LogoSeparator />
    <LogoText>Company name</LogoText>
  </Template>
);

export const TextInsteadImage = () => (
  <Template>
    <LogoText>Logo text</LogoText>
    <LogoSeparator />
    <LogoText>Company name</LogoText>
  </Template>
);
