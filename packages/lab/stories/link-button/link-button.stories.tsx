import { StackLayout } from "@salt-ds/core";
import { ArrowLeftIcon, ArrowRightIcon } from "@salt-ds/icons";
import { LinkButton } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { MemoryRouter, Link as RouterLink } from "react-router";

export default {
  title: "Lab/Link Button",
  component: LinkButton,
} as Meta<typeof LinkButton>;

export const Neutral: StoryFn<typeof LinkButton> = (args) => (
  <LinkButton href="/salt/components/link-button" sentiment="neutral" {...args}>
    View link button guidance
  </LinkButton>
);

export const Accented: StoryFn<typeof LinkButton> = (args) => (
  <LinkButton href="/salt/getting-started" sentiment="accented" {...args}>
    Get started
  </LinkButton>
);

export const ExternalLink: StoryFn<typeof LinkButton> = (args) => (
  <LinkButton
    href="https://www.saltdesignsystem.com"
    rel="noopener"
    target="_blank"
    {...args}
  >
    Visit Salt
  </LinkButton>
);

export const Underline: StoryFn<typeof LinkButton> = (args) => (
  <StackLayout align="start">
    <LinkButton href="/salt/components/breadcrumbs" {...args}>
      View breadcrumbs documentation
    </LinkButton>
    <LinkButton
      href="/salt/components/navigation-item"
      underline="never"
      {...args}
    >
      View navigation guidance
    </LinkButton>
  </StackLayout>
);

export const WithIcon: StoryFn<typeof LinkButton> = (args) => (
  <LinkButton href="/salt/components/card" {...args}>
    View card documentation <ArrowRightIcon aria-hidden />
  </LinkButton>
);

export const IconOnly: StoryFn<typeof LinkButton> = (args) => (
  <LinkButton aria-label="Back to components" href="/salt/components" {...args}>
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
