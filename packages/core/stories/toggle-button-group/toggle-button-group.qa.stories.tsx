import { ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import { AppSwitcherIcon, FolderClosedIcon, VisibleIcon } from "@salt-ds/icons";
import { CheckIcon } from "@storybook/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  type QAContainerNoStyleInjectionProps,
  type QAContainerProps,
} from "docs/components";

export default {
  title: "Core/Toggle Button Group/ToggleButton Group QA",
  component: ToggleButtonGroup,
} as Meta<typeof ToggleButtonGroup>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={2500} width={1400} cols={1} itemPadding={6} {...props}>
    <ToggleButtonGroup defaultValue="active">
      <ToggleButton value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton disabled value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup defaultValue="signed">
      <ToggleButton sentiment="neutral" value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton sentiment="negative" value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton sentiment="caution" value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
      <ToggleButton sentiment="positive" value="signed">
        <CheckIcon aria-hidden />
        Accepted
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup sentiment="accented" defaultValue="signed">
      <ToggleButton value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
      <ToggleButton value="signed">
        <CheckIcon aria-hidden />
        Accepted
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup appearance="bordered" defaultValue="signed">
      <ToggleButton value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
      <ToggleButton value="signed">
        <CheckIcon aria-hidden />
        Accepted
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup defaultValue="active" readOnly>
      <ToggleButton value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton disabled value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup defaultValue="signed" disabled>
      <ToggleButton sentiment="neutral" value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton sentiment="negative" value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton sentiment="caution" value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
      <ToggleButton sentiment="positive" value="signed">
        <CheckIcon aria-hidden />
        Accepted
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup orientation="vertical" defaultValue="active">
      <ToggleButton value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton disabled value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup orientation="vertical" defaultValue="signed">
      <ToggleButton sentiment="neutral" value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton sentiment="negative" value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton sentiment="caution" value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
      <ToggleButton sentiment="positive" value="signed">
        <CheckIcon aria-hidden />
        Accepted
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup defaultValue="active" readOnly orientation="vertical">
      <ToggleButton value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton disabled value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup orientation="vertical" defaultValue="signed" disabled>
      <ToggleButton sentiment="neutral" value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton sentiment="negative" value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton sentiment="caution" value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
      <ToggleButton sentiment="positive" value="signed">
        <CheckIcon aria-hidden />
        Accepted
      </ToggleButton>
    </ToggleButtonGroup>
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        theme: "legacy",
      },
      themeNext: {
        theme: "brand",
      },
    },
  },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props,
) => (
  <QAContainerNoStyleInjection
    height={500}
    width={1700}
    cols={1}
    itemPadding={4}
    {...props}
  >
    <ToggleButtonGroup defaultValue="active">
      <ToggleButton value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton disabled value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup orientation="horizontal" defaultValue="signed">
      <ToggleButton sentiment="neutral" value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton sentiment="negative" value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton sentiment="caution" value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
      <ToggleButton sentiment="positive" value="signed">
        <CheckIcon aria-hidden />
        Accepted
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup sentiment="accented" defaultValue="signed">
      <ToggleButton value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
      <ToggleButton value="signed">
        <CheckIcon aria-hidden />
        Accepted
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup appearance="bordered" defaultValue="signed">
      <ToggleButton value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
      <ToggleButton value="signed">
        <CheckIcon aria-hidden />
        Accepted
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup orientation="horizontal" defaultValue="signed" disabled>
      <ToggleButton sentiment="neutral" value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton sentiment="negative" value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton sentiment="caution" value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
      <ToggleButton sentiment="positive" value="signed">
        <CheckIcon aria-hidden />
        Accepted
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup orientation="vertical" defaultValue="active">
      <ToggleButton value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton disabled value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup orientation="vertical" defaultValue="signed">
      <ToggleButton sentiment="neutral" value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton sentiment="negative" value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton sentiment="caution" value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
      <ToggleButton sentiment="positive" value="signed">
        <CheckIcon aria-hidden />
        Accepted
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup orientation="vertical" defaultValue="signed" disabled>
      <ToggleButton sentiment="neutral" value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton sentiment="negative" value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton sentiment="caution" value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
      <ToggleButton sentiment="positive" value="signed">
        <CheckIcon aria-hidden />
        Accepted
      </ToggleButton>
    </ToggleButtonGroup>
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
