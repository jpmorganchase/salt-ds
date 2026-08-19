import { ArrowRightIcon, UserIcon } from "@salt-ds/icons";
import { LinkButton } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Link Button/Link Button QA",
  component: LinkButton,
} as Meta<typeof LinkButton>;

const href = "https://www.saltdesignsystem.com";

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={700} width={1000} {...props}>
    <LinkButton href={href} sentiment="neutral">
      Neutral
    </LinkButton>
    <LinkButton href={href} sentiment="accented">
      Accented
    </LinkButton>
    <LinkButton href={href} underline="default">
      Underline default
    </LinkButton>
    <LinkButton href={href} underline="never">
      Underline never
    </LinkButton>
    <LinkButton href={href} rel="noopener" target="_blank">
      Default tear-out icon
    </LinkButton>
    <LinkButton
      href={href}
      rel="noopener"
      target="_blank"
      IconComponent={UserIcon}
    >
      Custom icon
    </LinkButton>
    <LinkButton href={href} rel="noopener" target="_blank" IconComponent={null}>
      No icon
    </LinkButton>
    <LinkButton href={href}>
      Trailing icon <ArrowRightIcon aria-hidden />
    </LinkButton>
    <LinkButton aria-label="User profile" href={href}>
      <UserIcon aria-hidden />
    </LinkButton>
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
