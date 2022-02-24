import { FC } from "react";
import { Button, ButtonProps } from "@brandname/core";
import {
  DoubleChevronDownIcon,
  ExportIcon,
  FilterIcon,
  MessageIcon,
  NotificationIcon,
  PinIcon,
  SearchIcon,
  SettingsIcon,
  SettingsSolidIcon,
  ShareIcon,
  TearOutIcon,
  UserGroupIcon,
  UserIcon,
} from "@brandname/icons";
import { Toolbar, ToolbarProps, Tooltray } from "@brandname/lab";
import { ComponentStory } from "@storybook/react";

import { AdjustableFlexbox, FlexboxProps } from "./story-components";
import "./toolbar.stories.css";

export default {
  title: "Lab/Toolbar/Cypress Test Fixtures",
  component: Toolbar,
};

const ToolbarButton = ({
  id,
  label,
  ...props
}: ButtonProps & { label: string }) => (
  <Button {...props} variant="secondary" id={id} data-overflow-lavel={label} />
);

type ToolbarStory = ComponentStory<FC<FlexboxProps & ToolbarProps>>;

export const SimpleToolbar: ToolbarStory = ({
  width = 400,
  ...toolbarProps
}: FlexboxProps & ToolbarProps) => {
  return (
    <AdjustableFlexbox height={200} width={width}>
      <Toolbar {...toolbarProps}>
        <Button variant="secondary">
          <ExportIcon />
        </Button>
        <Button variant="secondary">
          <ShareIcon />
        </Button>
        <Button variant="secondary">
          <NotificationIcon />
        </Button>
        <Button variant="secondary">
          <TearOutIcon />
        </Button>
        <Button variant="secondary">
          <MessageIcon />
        </Button>
        <Button variant="secondary">
          <FilterIcon />
        </Button>
        <Button variant="secondary">
          <UserGroupIcon />
        </Button>
        <Button variant="secondary">
          <PinIcon />
        </Button>
        <Button variant="secondary">
          <SearchIcon />
        </Button>
        <Button variant="secondary">
          <UserIcon />
        </Button>
      </Toolbar>
    </AdjustableFlexbox>
  );
};

export const SimpleToolbarOverflowLabel: ToolbarStory = ({
  overflowButtonLabel = "more ...",
}) => <SimpleToolbar overflowButtonLabel={overflowButtonLabel} />;

export const ToolbarUsingOverflowPriorities: ToolbarStory = ({
  width = 420,
  ...toolbarProps
}) => {
  return (
    <AdjustableFlexbox height={200} width={width}>
      <Toolbar {...toolbarProps}>
        <Button variant="secondary">1 (2)</Button>
        <Button variant="secondary">2 (2)</Button>
        <Button variant="secondary">3 (2)</Button>
        <Button variant="secondary" data-priority={3}>
          4 (3)
        </Button>
        <Button variant="secondary">5 (2)</Button>
        <Button variant="secondary">6 (2)</Button>
        <Button variant="secondary">7 (2)</Button>
        <Button variant="secondary" data-priority={5}>
          8 (5)
        </Button>
        <Button variant="secondary" data-priority={5}>
          9 (5)
        </Button>
        <Button variant="secondary">10 (2)</Button>
      </Toolbar>
    </AdjustableFlexbox>
  );
};

export const SimpleToolbarCollapsibleItems: ToolbarStory = ({
  width = 500,
  ...toolbarProps
}) => {
  return (
    <AdjustableFlexbox height={200} width={width}>
      <Toolbar {...toolbarProps} id="toolbar-simple-collapsible">
        <Button variant="secondary" data-collapsible="instant">
          <ExportIcon /> Export
        </Button>
        <Button variant="secondary" data-collapsible="instant">
          <ShareIcon /> Share
        </Button>
        <Button variant="secondary" data-collapsible="instant">
          <NotificationIcon /> Alert
        </Button>
        <Button variant="secondary" data-collapsible="instant">
          <TearOutIcon /> Tear Out
        </Button>
        <Button variant="secondary" data-collapsible="instant">
          <MessageIcon /> Message
        </Button>
      </Toolbar>
    </AdjustableFlexbox>
  );
};

export const SingleDynamicCollapseTooltray: ToolbarStory = ({
  width = 200,
}) => {
  const pStyle = { whiteSpace: "nowrap", overflow: "hidden" } as any;

  return (
    <AdjustableFlexbox height={500} width={width}>
      <p style={pStyle}>
        A single <em>Tooltray</em> with 10 buttons
      </p>
      <Toolbar aria-label="Toolbar with dynamic collapse variants">
        <Tooltray
          aria-label="buttons tooltray"
          data-collapsible="dynamic"
          // overflowButtonLabel="More"
        >
          <ToolbarButton id="messageButton" label="Email">
            <MessageIcon />
          </ToolbarButton>
          <ToolbarButton id="searchButton" label="Search">
            <SearchIcon />
          </ToolbarButton>
          <ToolbarButton id="filterButton" label="Filter">
            <FilterIcon />
          </ToolbarButton>
          <ToolbarButton id="userButton" label="User">
            <UserIcon />
          </ToolbarButton>
          <ToolbarButton id="userGroupButton" label="User Group">
            <UserGroupIcon />
          </ToolbarButton>
          <ToolbarButton id="tearOutButton" label="Tear Out">
            <TearOutIcon />
          </ToolbarButton>
          <ToolbarButton id="expandButton" label="Expand">
            <DoubleChevronDownIcon />
          </ToolbarButton>
          <ToolbarButton id="pinButton" label="Pin">
            <PinIcon />
          </ToolbarButton>
          <ToolbarButton id="settingsButton" label="Settings">
            <SettingsIcon />
          </ToolbarButton>
          <ToolbarButton id="settingsSolidButton" label="More Settings">
            <SettingsSolidIcon />
          </ToolbarButton>
        </Tooltray>
      </Toolbar>
    </AdjustableFlexbox>
  );
};

export const TwoDynamicCollapseTooltraysDefaultPriority = ({ width = 350 }) => {
  return (
    <AdjustableFlexbox height={500} width={width}>
      <Toolbar>
        <Tooltray
          aria-label="left dynamic tooltray"
          data-collapsible="dynamic"
          // overflowButtonLabel="left"
        >
          <ToolbarButton id="messageButton" label="Email">
            <MessageIcon />
          </ToolbarButton>
          <ToolbarButton id="messageButton" label="Search">
            <SearchIcon />
          </ToolbarButton>
          <ToolbarButton id="messageButton" label="Filter">
            <FilterIcon />
          </ToolbarButton>
          <ToolbarButton id="messageButton" label="User">
            <UserIcon />
          </ToolbarButton>
          <ToolbarButton id="messageButton" label="Group">
            <UserGroupIcon />
          </ToolbarButton>
        </Tooltray>
        <Tooltray
          aria-label="right dynamic tooltray"
          data-collapsible="dynamic"
          // overflowButtonLabel="right"
        >
          <ToolbarButton id="messageButton" label="Tear Out">
            <TearOutIcon />
          </ToolbarButton>
          <ToolbarButton id="messageButton" label="Expand">
            <DoubleChevronDownIcon />
          </ToolbarButton>
          <ToolbarButton id="messageButton" label="Pin">
            <PinIcon />
          </ToolbarButton>
          <ToolbarButton id="messageButton" label="Settings">
            <SettingsIcon />
          </ToolbarButton>
          <ToolbarButton id="messageButton" label="More Settings">
            <SettingsSolidIcon />
          </ToolbarButton>
        </Tooltray>
      </Toolbar>
    </AdjustableFlexbox>
  );
};
