import { Logo, LogoImage, LogoTitle } from "@salt-ds/lab";
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
      <LogoTitle>Logo</LogoTitle>
    </Logo>
  );
};

export const Default = Template.bind({});
// Default.args = {
//   src: PlaceholderLogo as string,
// };

// export const FeatureLogo = Template.bind({});

// FeatureLogo.args = {
//   appTitle: "Salt",
//   src: PlaceholderLogo as string,
// };

// FeatureLogo.argTypes = {
//   src: { control: { type: "text" } },
//   appTitle: { control: { type: "text" } },
//   ImageProps: { table: { disable: true } },
//   TitleProps: { table: { disable: true } },
// };
