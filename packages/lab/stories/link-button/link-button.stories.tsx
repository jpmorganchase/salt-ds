import { ArrowLeftIcon, ArrowRightIcon } from "@salt-ds/icons";
import { LinkButton } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { MemoryRouter, Link as RouterLink } from "react-router";

export default {
  title: "Lab/Link Button",
  component: LinkButton,
} as Meta<typeof LinkButton>;

export const Neutral: StoryFn<typeof LinkButton> = (args) => (
  <LinkButton href="#" sentiment="neutral" {...args}>
    Neutral
  </LinkButton>
);

export const Accented: StoryFn<typeof LinkButton> = (args) => (
  <LinkButton href="#" sentiment="accented" {...args}>
    Accented
  </LinkButton>
);

export const ExternalLink: StoryFn<typeof LinkButton> = (args) => (
  <LinkButton
    href="https://www.saltdesignsystem.com"
    rel="noreferrer"
    target="_blank"
    {...args}
  >
    Salt Design System
  </LinkButton>
);

export const WithIcon: StoryFn<typeof LinkButton> = (args) => (
  <LinkButton href="#" {...args}>
    View more info <ArrowRightIcon aria-hidden />
  </LinkButton>
);

export const IconOnly: StoryFn<typeof LinkButton> = (args) => (
  <LinkButton aria-label="Go back" href="#" {...args}>
    <ArrowLeftIcon aria-hidden />
  </LinkButton>
);

export const RoutingLibraries: StoryFn<typeof LinkButton> = (args) => (
  <MemoryRouter>
    <LinkButton
      href="/reports"
      render={({ href, ...props }) => (
        <RouterLink {...props} to={href ?? "/reports"} />
      )}
      {...args}
    >
      View reports
    </LinkButton>
  </MemoryRouter>
);
