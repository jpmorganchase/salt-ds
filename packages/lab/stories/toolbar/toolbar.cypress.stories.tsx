import { Button } from "@salt-ds/core";
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
} from "@salt-ds/icons";
import { Toolbar, ToolbarButton, ToolbarProps, Tooltray } from "@salt-ds/lab";
import { StoryFn } from "@storybook/react";
import { AdjustableFlexbox, AdjustableFlexboxProps } from "../components";
import "./toolbar.stories.css";

export default {
  title: "Lab/Toolbar/Cypress Test Fixtures",
  component: Toolbar,
};

type ToolbarStory = StoryFn<AdjustableFlexboxProps & ToolbarProps>;

export const SimpleToolbar: ToolbarStory = ({
  width = 400,
  ...toolbarProps
}: AdjustableFlexboxProps & ToolbarProps) => {
  return (
    <AdjustableFlexbox height={200} width={width}>
      <Toolbar {...toolbarProps}>
        <ToolbarButton>
          <ExportIcon /> Export
        </ToolbarButton>
        <ToolbarButton>
          <ShareIcon /> Share
        </ToolbarButton>
        <ToolbarButton>
          <NotificationIcon /> Notification
        </ToolbarButton>
        <ToolbarButton>
          <TearOutIcon /> Tear Out
        </ToolbarButton>
        <ToolbarButton>
          <MessageIcon /> Message
        </ToolbarButton>
        <ToolbarButton>
          <FilterIcon /> Filter
        </ToolbarButton>
        <ToolbarButton>
          <UserGroupIcon /> User Group
        </ToolbarButton>
        <ToolbarButton>
          <PinIcon /> Pin
        </ToolbarButton>
        <ToolbarButton>
          <SearchIcon /> Search
        </ToolbarButton>
        <ToolbarButton>
          <UserIcon /> User
        </ToolbarButton>
      </Toolbar>
    </AdjustableFlexbox>
  );
};

export const SimpleToolbarOverflowLabel: ToolbarStory = ({
  overflowButtonLabel = "more ...",
}) => <SimpleToolbar overflowButtonLabel={overflowButtonLabel} />;

export const ToolbarUsingOverflowPriorities: ToolbarStory = ({
  width = 600,
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
  width = 310,
}) => {
  return (
    <AdjustableFlexbox height={500} width={width}>
      <p style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
        A single <em>Tooltray</em> with 10 buttons
      </p>
      <Toolbar aria-label="Toolbar with dynamic collapse variants">
        <Tooltray
          aria-label="buttons tooltray"
          data-collapsible="dynamic"
          // overflowButtonLabel="More"
        >
          <ToolbarButton>
            <MessageIcon /> Email
          </ToolbarButton>
          <ToolbarButton>
            <SearchIcon /> Search
          </ToolbarButton>
          <ToolbarButton>
            <FilterIcon /> Filter
          </ToolbarButton>
          <ToolbarButton>
            <UserIcon /> User
          </ToolbarButton>
          <ToolbarButton>
            <UserGroupIcon /> User Group
          </ToolbarButton>
          <ToolbarButton>
            <TearOutIcon /> Tear Out
          </ToolbarButton>
          <ToolbarButton>
            <DoubleChevronDownIcon /> Expand
          </ToolbarButton>
          <ToolbarButton>
            <PinIcon /> Pin
          </ToolbarButton>
          <ToolbarButton>
            <SettingsIcon /> Settings
          </ToolbarButton>
          <ToolbarButton>
            <SettingsSolidIcon /> More Settings
          </ToolbarButton>
        </Tooltray>
      </Toolbar>
    </AdjustableFlexbox>
  );
};

export const TwoDynamicCollapseTooltraysDefaultPriority = ({ width = 70 }) => {
  return (
    <AdjustableFlexbox height={500} width={width}>
      <Toolbar>
        <Tooltray aria-label="left dynamic tooltray" data-collapsible="dynamic">
          <ToolbarButton>
            <MessageIcon /> Email
          </ToolbarButton>
          <ToolbarButton>
            <SearchIcon /> Search
          </ToolbarButton>
          <ToolbarButton>
            <FilterIcon /> Filter
          </ToolbarButton>
          <ToolbarButton>
            <UserIcon /> User
          </ToolbarButton>
          <ToolbarButton>
            <UserGroupIcon /> Group
          </ToolbarButton>
        </Tooltray>
        <Tooltray
          aria-label="right dynamic tooltray"
          data-collapsible="dynamic"
        >
          <ToolbarButton>
            <TearOutIcon /> Tear Out
          </ToolbarButton>
          <ToolbarButton>
            <DoubleChevronDownIcon /> Expand
          </ToolbarButton>
          <ToolbarButton>
            <PinIcon /> Pin
          </ToolbarButton>
          <ToolbarButton>
            <SettingsIcon /> Settings
          </ToolbarButton>
          <ToolbarButton>
            <SettingsSolidIcon /> More Settings
          </ToolbarButton>
        </Tooltray>
      </Toolbar>
    </AdjustableFlexbox>
  );
};
