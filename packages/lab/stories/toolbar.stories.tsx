import { Button, ButtonProps, FormField } from "@jpmorganchase/uitk-core";
import {
  DoubleChevronDownIcon,
  ExportIcon,
  FilterIcon,
  MenuIcon,
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
} from "@jpmorganchase/uitk-icons";
import { Dropdown, Toolbar, Tooltray } from "@jpmorganchase/uitk-lab";
import { ComponentAnatomy } from "docs/components";
import { CSSProperties, useState } from "react";
import { AdjustableFlexbox } from "./story-components";

import "./toolbar.stories.css";

export default {
  title: "Lab/Toolbar",
  component: Toolbar,
};

const ToolbarButton = ({
  id,
  label,
  ...props
}: { label?: string } & ButtonProps) => (
  <Button {...props} variant="secondary" id={id} data-overflow-label={label} />
);

export const SimpleToolbar = ({ initialWidth = 250, ...toolbarProps }) => {
  return (
    <AdjustableFlexbox height={200} width={initialWidth}>
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

export const SimpleToolbarOverflowLabel = ({ overflowLabel = "more ..." }) => (
  <SimpleToolbar overflowButtonLabel={overflowLabel} />
);

export const SimpleToolbarCollapsibleItems = ({
  initialWidth = 500,
  ...toolbarProps
}) => {
  return (
    <AdjustableFlexbox height={200} width={initialWidth}>
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

export const SimpleToolbarCollapsibleItemsAnatomy = ({
  initialWidth = 500,
  ...toolbarProps
}) => {
  return (
    <>
      <AdjustableFlexbox height={200} width={initialWidth}>
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
      <ComponentAnatomy
        aria-owns="toolbar-simple-collapsible"
        showControls={false}
        style={{ marginTop: 50 }}
      />
    </>
  );
};

export const DefaultToolbar = ({ initialWidth = 315 }) => {
  const typeData = ["Open", "Close", "Discarded", "Resolved"];
  const rangeData = [
    "Today",
    "Yesterday",
    "Last Week",
    "Last Month",
    "Last Year",
  ];

  const [type, setType] = useState<string | undefined>(typeData[0]);
  const [range, setRange] = useState<string | undefined>(rangeData[0]);

  const logItemName = (buttonName: string) =>
    console.log(`${buttonName} button clicked'`);

  return (
    <AdjustableFlexbox height={100} width={initialWidth}>
      <Toolbar id="toolbar-default">
        <FormField
          data-close-on-click={false}
          label="Range"
          data-activation-indicator
          className="uitkEmphasisMedium"
        >
          <Dropdown
            initialSelectedItem={range}
            onSelect={(_, item) => setRange(item || undefined)}
            source={rangeData}
            style={{ width: 100 }}
          />
        </FormField>
        <FormField
          data-close-on-click={false}
          label="Type"
          data-activation-indicator
          className="uitkEmphasisMedium"
        >
          <Dropdown
            initialSelectedItem={type}
            onSelect={(_, item) => setType(item || undefined)}
            source={typeData}
            style={{ width: 90 }}
          />
        </FormField>
        <Button onClick={() => logItemName("export")} variant="secondary">
          <ExportIcon /> Export
        </Button>
        <Button onClick={() => logItemName("share")} variant="secondary">
          <ShareIcon /> Share
        </Button>
        <Button onClick={() => logItemName("alerts")} variant="secondary">
          <NotificationIcon /> Set Alerts
        </Button>
        <Button onClick={() => logItemName("expand")} variant="secondary">
          <TearOutIcon /> Expand
        </Button>
      </Toolbar>
    </AdjustableFlexbox>
  );
};

export const InstantCollapseTooltray = () => {
  return (
    <AdjustableFlexbox height={200} width={400}>
      <Toolbar aria-label="Toolbar with collapsible tooltray">
        <Tooltray data-collapsible="instant">
          {[
            <Button key="theme-button" variant="cta">
              Theme
            </Button>,
            [
              <FormField
                // closeOnClick={false}
                key="dropdown-1"
                style={{ width: "62px " }}
                // withActivationIndicator
              >
                <Dropdown
                  initialSelectedItem="light"
                  source={["light", "dark"]}
                />
              </FormField>,
              <FormField
                // closeOnClick={false}
                key="dropdown-2"
                style={{ width: "83px " }}
                // withActivationIndicator
              >
                <Dropdown
                  initialSelectedItem="medium"
                  source={["touch", "low", "medium", "high"]}
                />
              </FormField>,
            ],
          ]}
        </Tooltray>
        <Tooltray>
          <Button data-overflow-label="Export" variant="secondary">
            <ExportIcon />
          </Button>
          <Button data-overflow-label="Export" variant="secondary">
            <ShareIcon />
          </Button>
        </Tooltray>
      </Toolbar>
    </AdjustableFlexbox>
  );
};

export const WithDynamicCollapseVariants = ({ initialWidth = 500 }) => {
  const pStyle: CSSProperties = { whiteSpace: "nowrap", overflow: "hidden" };

  return (
    <AdjustableFlexbox height={500} width={initialWidth}>
      <p style={pStyle}>
        A single <em>Toolbar</em> with 10 buttons
      </p>
      <Toolbar aria-label="Toolbar with dynamic collapse variants">
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
      </Toolbar>
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
      <p style={pStyle}>
        Two Tooltrays, 5 buttons each, both dynamic, <strong>default</strong>{" "}
        overflow priority
      </p>
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
      <p style={pStyle}>
        Two Tooltrays, 5 buttons each, both dynamic, <strong>first</strong> has
        higher overflow priority
      </p>
      <Toolbar>
        <Tooltray
          aria-label="left dynamic tooltray"
          data-collapsible="dynamic"
          data-priority={4}
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
export const MockAppHeader = () => {
  const pStyle: CSSProperties = { whiteSpace: "nowrap", overflow: "hidden" };

  return (
    <AdjustableFlexbox height={500} width={600}>
      <p style={pStyle}>
        Three Tooltrays, simulating the Logo, Tabs and Tools of AppHeader
      </p>
      <Toolbar
        overflowButtonLabel="More"
        data-overflow-left
        overflowButtonIcon={<MenuIcon />}
        OverflowButtonProps={{ align: "start" }}
      >
        <Tooltray
          id="1"
          data-priority={1}
          aria-label="left dynamic tooltray"
          // overflowButtonLabel="left"
        >
          <ToolbarButton id="emailButton" label="Email">
            <MessageIcon />
          </ToolbarButton>
          <ToolbarButton id="messageButton" label="Search">
            <SearchIcon />
          </ToolbarButton>
          <ToolbarButton id="messageButton" label="Filter">
            <FilterIcon />
          </ToolbarButton>
        </Tooltray>
        <Tooltray
          id="2"
          aria-label="left dynamic tooltray"
          data-align-center
          data-priority={2}
          // overflowButtonLabel="left"
        >
          <ToolbarButton id="emailButton" label="Email">
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
          id="3"
          aria-label="right dynamic tooltray"
          data-collapsible="dynamic"
          data-reclaim-space
          data-priority={1}
          // overflowButtonLabel="Right"
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
