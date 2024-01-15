import type { Meta, StoryFn } from "@storybook/react";
import { Avatar, Button, Pill, ToggleButton } from "@salt-ds/core";
import {
  AddIcon,
  ChatIcon,
  ColumnChooserIcon,
  CsvIcon,
  DoubleChevronDownIcon,
  ExportIcon,
  FilterIcon,
  InfoIcon,
  MenuIcon,
  MessageIcon,
  NotificationIcon,
  PdfIcon,
  PinIcon,
  SearchIcon,
  SettingsIcon,
  SettingsSolidIcon,
  ShareIcon,
  SwapIcon,
  SuccessTickIcon,
  TearOutIcon,
  UserGroupIcon,
  UserIcon,
  VisibleIcon,
} from "@salt-ds/icons";
import {
  Dropdown,
  Toolbar,
  ToolbarButton,
  ToolbarField,
  ToolbarProps,
  Tooltray,
  Input,
  StaticInputAdornment,
} from "@salt-ds/lab";
import { CSSProperties, MouseEvent, useState } from "react";

import { AdjustableFlexbox, AdjustableFlexboxProps } from "../components";

import "./toolbar.stories.css";

export default {
  title: "Lab/Toolbar",
  component: Toolbar,
} as Meta<typeof Toolbar>;

const statusData = ["All", "New", "Working", "Fully Filled", "Cancelled"];

export const Default: StoryFn = () => {
  const typeData = ["Open", "Close", "Discarded", "Resolved"];
  const rangeData = [
    "Today",
    "Yesterday",
    "Last Week",
    "Last Month",
    "Last Year",
  ];

  const logItemName = (buttonName: string) =>
    console.log(`${buttonName} button clicked'`);

  return (
    <Toolbar id="toolbar-default">
      <ToolbarField label="Range">
        <Dropdown
          defaultSelected={rangeData[0]}
          source={rangeData}
          style={{ width: 100 }}
        />
      </ToolbarField>
      <ToolbarField label="Type">
        <Dropdown
          defaultSelected={typeData[0]}
          source={typeData}
          style={{ width: 90 }}
        />
      </ToolbarField>
      <ToolbarButton onClick={() => logItemName("export")}>
        <ExportIcon /> Export
      </ToolbarButton>
      <ToolbarButton onClick={() => logItemName("share")}>
        <ShareIcon /> Share
      </ToolbarButton>
      <ToolbarButton onClick={() => logItemName("alerts")}>
        <NotificationIcon /> Set Alerts
      </ToolbarButton>
      <ToolbarButton onClick={() => logItemName("expand")}>
        <TearOutIcon /> Expand
      </ToolbarButton>
    </Toolbar>
  );
};

export const DefaultAdjustable: StoryFn<AdjustableFlexboxProps> = ({
  width = 600,
}) => {
  return (
    <AdjustableFlexbox height={420} width={width}>
      <Default />
    </AdjustableFlexbox>
  );
};

export const TooltrayAlignment: StoryFn = () => {
  return (
    <AdjustableFlexbox containerWidth={1000} height={200} width={800}>
      <Toolbar
        aria-label="Tooltray alignment toolbar"
        style={{ minWidth: "100px" }}
      >
        <ToolbarField data-close-on-click={false}>
          <Input
            startAdornment={
              <StaticInputAdornment>
                <FilterIcon />
              </StaticInputAdornment>
            }
            style={{ width: 180 }}
            defaultValue=""
          />
        </ToolbarField>
        <Tooltray aria-label="filters tooltray">
          <ToolbarField>
            <ToggleButton
              style={{ width: "100%", minWidth: "60px" }}
              selected
              value="and"
            >
              <SwapIcon aria-hidden /> AND
            </ToggleButton>
          </ToolbarField>
          <ToolbarField>
            <Pill onClick={() => console.log("lorem.")} >LOREM</Pill>
          </ToolbarField>
          <ToolbarField>
            <Pill onClick={() => console.log("ipsum.")} >IPSUM</Pill>
          </ToolbarField>
          <ToolbarField>
            <Pill onClick={() => console.log("dolar.")} >DOLAR</Pill>
          </ToolbarField>
        </Tooltray>
        <Tooltray aria-label="status tooltray" alignStart>
          <ToolbarField>
            <Button variant="secondary">CLEAR</Button>
          </ToolbarField>
          <ToolbarField>
            <Button variant="primary">
              <AddIcon />
            </Button>
          </ToolbarField>
        </Tooltray>
        <ToolbarField data-close-on-click={false} label="Status">
          <Dropdown
            defaultSelected={statusData[0]}
            source={statusData}
            style={{ width: 95 }}
          />
        </ToolbarField>
        <Tooltray aria-label="search tooltray">
          <Button variant="primary">
            <AddIcon />
          </Button>
        </Tooltray>
        <Tooltray aria-label="buttons tooltray">
          <ToolbarButton>
            <ExportIcon /> Export
          </ToolbarButton>
          <ToolbarButton>
            <ColumnChooserIcon /> Select Columns
          </ToolbarButton>
          <ToolbarButton>
            <SettingsIcon /> Settings
          </ToolbarButton>
        </Tooltray>
      </Toolbar>
    </AdjustableFlexbox>
  );
};

export const TooltrayCollapseOrder: StoryFn<AdjustableFlexboxProps> = ({
  width = 900,
}) => {
  const viewsData = ["No view selected", "Outstanding", "Closed"];
  const [view, setView] = useState(viewsData[0]);

  return (
    <AdjustableFlexbox containerWidth={1000} height={200} width={width}>
      <Toolbar style={{ minWidth: "100px" }}>
        <Tooltray
          aria-label="views tooltray"
          data-collapsible="dynamic"
          data-priority={3}
          overflowButtonLabel="Views"
        >
          <ToolbarField label="Views" labelPlacement="left">
            <Dropdown
              onSelect={(_, item) => setView(item)}
              selected={view}
              source={viewsData}
              style={{ width: 132 }}
            />
          </ToolbarField>
          <ToolbarField>
            <Button>Save</Button>
          </ToolbarField>

          <ToolbarField>
            <Button>Save as...</Button>
          </ToolbarField>
          <ToolbarField>
            <Button disabled>Reset</Button>
          </ToolbarField>
          <ToolbarField>
            <ToolbarButton id="colsButton">
              Select Columns <ColumnChooserIcon />
            </ToolbarButton>
          </ToolbarField>
        </Tooltray>
        <Tooltray
          aria-label="actions tooltray"
          data-collapsible="dynamic"
          data-priority={2}
          overflowButtonLabel="actions"
        >
          <ToolbarField>
            <Button>create instruction</Button>
          </ToolbarField>
          <ToolbarField>
            <Button>create net</Button>
          </ToolbarField>
        </Tooltray>
        <Tooltray aria-label="export tooltray">
          <ToolbarField>
            <ToolbarButton id="pdfButton">
              Export PDF <PdfIcon />
            </ToolbarButton>
          </ToolbarField>
          <ToolbarField>
            <ToolbarButton id="csvButton">
              Export CSV <CsvIcon />
            </ToolbarButton>
          </ToolbarField>
        </Tooltray>
      </Toolbar>
      <br />
      <Toolbar style={{ minWidth: "100px" }}>
        <Tooltray
          aria-label="views tooltray"
          data-collapsible="dynamic"
          data-priority={3}
          overflowButtonLabel="Views"
        >
          <ToolbarField label="Views" labelPlacement="left">
            <Dropdown
              onSelect={(_, item) => setView(item)}
              selected={view}
              source={viewsData}
              style={{ width: 132 }}
            />
          </ToolbarField>
          <ToolbarField>
            <Button>Save</Button>
          </ToolbarField>

          <ToolbarField>
            <Button>Save as...</Button>
          </ToolbarField>
          <ToolbarField>
            <Button disabled>Reset</Button>
          </ToolbarField>
          <ToolbarField>
            <ToolbarButton id="colsButton">
              Select Columns <ColumnChooserIcon />
            </ToolbarButton>
          </ToolbarField>
        </Tooltray>
        <Tooltray
          aria-label="actions tooltray"
          data-collapsible="dynamic"
          data-priority={2}
          overflowButtonLabel="actions"
        >
          <ToolbarField>
            <Button>create instruction</Button>
          </ToolbarField>
          <ToolbarField>
            <Button>create net</Button>
          </ToolbarField>
        </Tooltray>
        <Tooltray aria-label="export tooltray" data-priority={4}>
          <ToolbarField>
            <ToolbarButton id="pdfButton">
              Export PDF <PdfIcon />
            </ToolbarButton>
          </ToolbarField>
          <ToolbarField>
            <ToolbarButton id="csvButton">
              Export CSV <CsvIcon />
            </ToolbarButton>
          </ToolbarField>
        </Tooltray>
      </Toolbar>
    </AdjustableFlexbox>
  );
};
export const ToolbarOverflowLargeOverflowIndicator: StoryFn<
  AdjustableFlexboxProps
> = ({ width = 900 }) => {
  const viewsData = ["No view selected", "Outstanding", "Closed"];
  const [view, setView] = useState(viewsData[0]);

  return (
    <AdjustableFlexbox containerWidth={1000} height={200} width={width}>
      <Toolbar style={{ minWidth: "100px" }} overflowButtonLabel="Views">
        <ToolbarField label="Views" labelPlacement="left">
          <Dropdown
            onSelect={(_, item) => setView(item)}
            selected={view}
            source={viewsData}
            style={{ width: 132 }}
          />
        </ToolbarField>
        <ToolbarField>
          <Button>Save</Button>
        </ToolbarField>

        <ToolbarField>
          <Button>Save as...</Button>
        </ToolbarField>
        <ToolbarField>
          <Button disabled>Reset</Button>
        </ToolbarField>
        <ToolbarField>
          <ToolbarButton id="colsButton">
            Select Columns <ColumnChooserIcon />
          </ToolbarButton>
        </ToolbarField>
      </Toolbar>
    </AdjustableFlexbox>
  );
};

const ToolbarWithInstantCollapseTooltrays = () => {
  const viewsData = ["No view selected", "Outstanding", "Closed"];
  const [view, setView] = useState(viewsData[0]);
  return (
    <Toolbar
      aria-label="Instant collapse toolbar"
      style={{ minWidth: "100px" }}
    >
      <Tooltray
        aria-label="views tooltray"
        data-collapsible="instant"
        data-priority={2}
        overflowButtonLabel="Views"
      >
        <ToolbarField label="Views" labelPlacement="left">
          <Dropdown
            onSelect={(_, item) => setView(item)}
            selected={view}
            source={viewsData}
            style={{ width: "132px " }}
          />
        </ToolbarField>
        <Button>Save</Button>
        <Button>Save as...</Button>
        <Button disabled>Reset</Button>
        <ToolbarButton overflowLabel="Select Columns">
          <ColumnChooserIcon />
        </ToolbarButton>
      </Tooltray>
      <Tooltray
        aria-label="actions tooltray"
        data-collapsible="instant"
        data-priority={3}
        overflowButtonLabel="actions"
      >
        <Button>create instruction</Button>
        <Button>create net</Button>
      </Tooltray>
      <Tooltray aria-label="export tooltray" data-priority={4}>
        <ToolbarButton overflowLabel="Export PDF">
          <PdfIcon />
        </ToolbarButton>
        <ToolbarButton overflowLabel="Export CSV">
          <CsvIcon />
        </ToolbarButton>
      </Tooltray>
    </Toolbar>
  );
};

export const TooltrayInstantCollapse: StoryFn<AdjustableFlexboxProps> = ({
  width = 1000,
}) => {
  return (
    <AdjustableFlexbox containerWidth={1000} height={200} width={width}>
      <ToolbarWithInstantCollapseTooltrays />
    </AdjustableFlexbox>
  );
};

const ToolbarWithDynamicCollapseTooltrays = () => {
  const viewsData = ["No view selected", "Outstanding", "Closed"];
  const [view, setView] = useState(viewsData[0]);

  return (
    <Toolbar
      aria-label="Dynamic collapse tooltbar"
      style={{ minWidth: "100px" }}
    >
      <Tooltray
        aria-label="views tooltray"
        data-collapsible="dynamic"
        data-priority={2}
        overflowButtonLabel="Views"
      >
        <ToolbarField label="Views" labelPlacement="left">
          <Dropdown
            onSelect={(_, item) => setView(item)}
            selected={view}
            source={viewsData}
            style={{ width: "132px " }}
          />
        </ToolbarField>
        <Button>Save</Button>
        <Button>Save as...</Button>
        <Button disabled>Reset</Button>
        <ToolbarButton overflowLabel="Select Columns">
          <ColumnChooserIcon />
        </ToolbarButton>
      </Tooltray>
      <Tooltray
        aria-label="actions tooltray"
        data-collapsible="dynamic"
        data-priority={3}
        overflowButtonLabel="actions"
      >
        <Button>create instruction</Button>
        <Button>create net</Button>
      </Tooltray>
      <Tooltray aria-label="export tooltray">
        <ToolbarButton overflowLabel="Export PDF">
          <PdfIcon />
        </ToolbarButton>
        <ToolbarButton overflowLabel="Export CSV">
          <CsvIcon />
        </ToolbarButton>
      </Tooltray>
    </Toolbar>
  );
};

export const TooltrayDynamicCollapse: StoryFn<AdjustableFlexboxProps> = ({
  width = 1000,
}) => {
  return (
    <AdjustableFlexbox containerWidth={1000} height={200} width={width}>
      <ToolbarWithDynamicCollapseTooltrays />
    </AdjustableFlexbox>
  );
};

const ToolbarWithNonCollapsingTooltrays = () => {
  const viewsData = ["No view selected", "Outstanding", "Closed"];
  const [view, setView] = useState(viewsData[0]);

  return (
    <Toolbar
      aria-label="No tooltray collapse toolbar"
      style={{ minWidth: "100px" }}
    >
      <Tooltray aria-label="views tooltray">
        <ToolbarField label="Views" labelPlacement="left">
          <Dropdown
            onSelect={(_, item) => setView(item)}
            selected={view}
            source={viewsData}
            style={{ width: "132px " }}
          />
        </ToolbarField>
        <Button>Save</Button>
        <Button>Save as...</Button>
        <Button disabled>Reset</Button>
        <ToolbarButton overflowLabel="Select Columns">
          <ColumnChooserIcon />
        </ToolbarButton>
      </Tooltray>
      <Tooltray aria-label="actions tooltray">
        <Button>create instruction</Button>
        <Button>create net</Button>
      </Tooltray>
      <Tooltray aria-label="export tooltray">
        <ToolbarButton overflowLabel="Export PDF">
          <PdfIcon />
        </ToolbarButton>
        <ToolbarButton overflowLabel="Export CSV">
          <CsvIcon />
        </ToolbarButton>
      </Tooltray>
    </Toolbar>
  );
};

export const TooltrayNonCollapsingTooltrays: StoryFn<
  AdjustableFlexboxProps
> = ({ width = 1000 }) => {
  return (
    <AdjustableFlexbox containerWidth={1000} height={200} width={width}>
      <ToolbarWithNonCollapsingTooltrays />
    </AdjustableFlexbox>
  );
};

export const TooltrayCollapseComparison = () => {
  const viewsData = ["No view selected", "Outstanding", "Closed"];

  return (
    <AdjustableFlexbox containerWidth={1000} height={200} width={1000}>
      <h4>Instant Collapse</h4>
      <ToolbarWithInstantCollapseTooltrays />
      <br />
      <h4>Dynamic Collapse</h4>
      <ToolbarWithDynamicCollapseTooltrays />
      <br />
      <h4>No Tooltray Collapse</h4>
      <ToolbarWithNonCollapsingTooltrays />
    </AdjustableFlexbox>
  );
};

export const Simple: StoryFn<AdjustableFlexboxProps & ToolbarProps> = ({
  width = 320,
  ...toolbarProps
}) => {
  const handleToolbarButtonClick = (evt: MouseEvent) => {
    console.log(`SimpleToolbar handleClick ${evt.currentTarget.textContent}`);
  };
  return (
    <AdjustableFlexbox height={200} width={width}>
      <Toolbar {...toolbarProps}>
        <ToolbarButton onClick={handleToolbarButtonClick}>
          Export <ExportIcon />
        </ToolbarButton>
        <ToolbarButton onClick={handleToolbarButtonClick}>
          Share <ShareIcon />
        </ToolbarButton>
        <ToolbarButton onClick={handleToolbarButtonClick}>
          Notification <NotificationIcon />
        </ToolbarButton>
        <ToolbarButton onClick={handleToolbarButtonClick}>
          Tear Out <TearOutIcon />
        </ToolbarButton>
        <ToolbarButton onClick={handleToolbarButtonClick}>
          Message <MessageIcon />
        </ToolbarButton>
        <ToolbarButton onClick={handleToolbarButtonClick}>
          Filter <FilterIcon />
        </ToolbarButton>
        <ToolbarButton onClick={handleToolbarButtonClick}>
          Group <UserGroupIcon />
        </ToolbarButton>
        <ToolbarButton onClick={handleToolbarButtonClick}>
          Pin <PinIcon />
        </ToolbarButton>
        <ToolbarButton onClick={handleToolbarButtonClick}>
          Search <SearchIcon />
        </ToolbarButton>
        <ToolbarButton onClick={handleToolbarButtonClick}>
          User <UserIcon />
        </ToolbarButton>
      </Toolbar>
    </AdjustableFlexbox>
  );
};

export const SimpleWithOverflowLabel = ({ overflowLabel = "more ..." }) => (
  <Simple overflowButtonLabel={overflowLabel} />
);

export const SimpleWithCollapsibleItems: StoryFn<AdjustableFlexboxProps> = ({
  width = 500,
}) => {
  return (
    <AdjustableFlexbox height={200} width={width}>
      <Toolbar id="toolbar-simple-collapsible">
        <ToolbarButton variant="secondary" data-collapsible="instant">
          <ExportIcon /> Export
        </ToolbarButton>
        <ToolbarButton variant="secondary" data-collapsible="instant">
          <ShareIcon /> Share
        </ToolbarButton>
        <ToolbarButton variant="secondary" data-collapsible="instant">
          <NotificationIcon /> Alert
        </ToolbarButton>
        <ToolbarButton variant="secondary" data-collapsible="instant">
          <TearOutIcon /> Tear Out
        </ToolbarButton>
        <ToolbarButton variant="secondary" data-collapsible="instant">
          <MessageIcon /> Message
        </ToolbarButton>
      </Toolbar>
    </AdjustableFlexbox>
  );
};

export const InstantCollapseTooltray = () => {
  return (
    <AdjustableFlexbox height={200} width={800}>
      <Toolbar aria-label="Toolbar with collapsible tooltray">
        <Tooltray data-collapsible="instant">
          {[
            <Button key="theme-button" variant="cta">
              Theme
            </Button>,
            [
              <ToolbarField key="dropdown-1" style={{ width: "62px " }}>
                <Dropdown defaultSelected="light" source={["light", "dark"]} />
              </ToolbarField>,
              <ToolbarField key="dropdown-2" style={{ width: "83px " }}>
                <Dropdown
                  defaultSelected="medium"
                  source={["touch", "low", "medium", "high"]}
                />
              </ToolbarField>,
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
        <ToolbarButton label="Email">
          <MessageIcon />
        </ToolbarButton>
        <ToolbarButton label="Search">
          <SearchIcon />
        </ToolbarButton>
        <ToolbarButton label="Filter">
          <FilterIcon />
        </ToolbarButton>
        <ToolbarButton label="User">
          <UserIcon />
        </ToolbarButton>
        <ToolbarButton label="User Group">
          <UserGroupIcon />
        </ToolbarButton>
        <ToolbarButton label="Tear Out">
          <TearOutIcon />
        </ToolbarButton>
        <ToolbarButton label="Expand">
          <DoubleChevronDownIcon />
        </ToolbarButton>
        <ToolbarButton label="Pin">
          <PinIcon />
        </ToolbarButton>
        <ToolbarButton label="Settings">
          <SettingsIcon />
        </ToolbarButton>
        <ToolbarButton label="More Settings">
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
          <ToolbarButton label="Email">
            <MessageIcon />
          </ToolbarButton>
          <ToolbarButton label="Search">
            <SearchIcon />
          </ToolbarButton>
          <ToolbarButton label="Filter">
            <FilterIcon />
          </ToolbarButton>
          <ToolbarButton label="User">
            <UserIcon />
          </ToolbarButton>
          <ToolbarButton label="Group">
            <UserGroupIcon />
          </ToolbarButton>
        </Tooltray>
        <Tooltray
          aria-label="right dynamic tooltray"
          data-collapsible="dynamic"
          // overflowButtonLabel="right"
        >
          <ToolbarButton label="Tear Out">
            <TearOutIcon />
          </ToolbarButton>
          <ToolbarButton label="Expand">
            <DoubleChevronDownIcon />
          </ToolbarButton>
          <ToolbarButton label="Pin">
            <PinIcon />
          </ToolbarButton>
          <ToolbarButton label="Settings">
            <SettingsIcon />
          </ToolbarButton>
          <ToolbarButton label="More Settings">
            <SettingsSolidIcon />
          </ToolbarButton>
        </Tooltray>
      </Toolbar>
      <p style={pStyle}>
        Two Tooltrays, 5 buttons each, both dynamic, <strong>first</strong> has
        higher overflow priority (so will collapse first)
      </p>
      <Toolbar>
        <Tooltray
          aria-label="left dynamic tooltray"
          data-collapsible="dynamic"
          data-priority={4}
          // overflowButtonLabel="left"
        >
          <ToolbarButton label="Email">
            <MessageIcon />
          </ToolbarButton>
          <ToolbarButton label="Search">
            <SearchIcon />
          </ToolbarButton>
          <ToolbarButton label="Filter">
            <FilterIcon />
          </ToolbarButton>
          <ToolbarButton label="User">
            <UserIcon />
          </ToolbarButton>
          <ToolbarButton label="Group">
            <UserGroupIcon />
          </ToolbarButton>
        </Tooltray>
        <Tooltray
          aria-label="right dynamic tooltray"
          data-collapsible="dynamic"
          // overflowButtonLabel="right"
        >
          <ToolbarButton label="Tear Out">
            <TearOutIcon />
          </ToolbarButton>
          <ToolbarButton label="Expand">
            <DoubleChevronDownIcon />
          </ToolbarButton>
          <ToolbarButton label="Pin">
            <PinIcon />
          </ToolbarButton>
          <ToolbarButton label="Settings">
            <SettingsIcon />
          </ToolbarButton>
          <ToolbarButton label="More Settings">
            <SettingsSolidIcon />
          </ToolbarButton>
        </Tooltray>
      </Toolbar>
    </AdjustableFlexbox>
  );
};

export const VerticalToolbar = () => {
  return (
    <Toolbar
      aria-label="vertical toolbar"
      data-resizeable
      orientation="vertical"
      style={{ minHeight: "500px" }}
    >
      <ToolbarField>
        <Avatar size={1} />
      </ToolbarField>
      <ToolbarButton>
        <InfoIcon /> View Description
      </ToolbarButton>
      <ToolbarButton>
        <ChatIcon /> Add Comment
      </ToolbarButton>
      <ToolbarButton>
        <SuccessTickIcon /> Add Task
      </ToolbarButton>
      <ToolbarButton disabled>
        <VisibleIcon /> Watch
      </ToolbarButton>
      <ToolbarButton data-align-start>
        <NotificationIcon /> Set Reminder
      </ToolbarButton>
      <ToolbarButton>
        <SettingsIcon /> Settings
      </ToolbarButton>
      <ToolbarButton>
        <TearOutIcon /> Expand
      </ToolbarButton>
    </Toolbar>
  );
};

export const MockAppHeader: StoryFn = () => {
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
        overflowButtonPlacement="start"
      >
        <Tooltray id="1" data-priority={1} aria-label="left dynamic tooltray">
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
