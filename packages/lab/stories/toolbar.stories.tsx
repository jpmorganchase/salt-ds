import {
  Button,
  FormField,
  Input,
  Pill,
  StaticInputAdornment,
} from "@jpmorganchase/uitk-core";
import {
  AddIcon,
  ColumnChooserIcon,
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
  SwapIcon,
  TearOutIcon,
  UserGroupIcon,
  UserIcon,
} from "@jpmorganchase/uitk-icons";
import {
  Dropdown,
  ToggleButton,
  Toolbar,
  ToolbarButton,
  Tooltray,
} from "@jpmorganchase/uitk-lab";
import { CSSProperties } from "react";
import { ComponentAnatomy } from "docs/components/ComponentAnatomy";

import { AdjustableFlexbox } from "./story-components";

import "./toolbar.stories.css";

export default {
  title: "Lab/Toolbar",
  component: Toolbar,
};

const statusData = ["All", "New", "Working", "Fully Filled", "Cancelled"];

export const DefaultToolbar = ({ initialWidth = 450 }) => {
  const typeData = ["Open", "Close", "Discarted", "Resolved"];
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
      <FormField
        data-close-on-click={false}
        label="Range"
        data-activation-indicator
      >
        <Dropdown
          defaultSelected={rangeData[0]}
          source={rangeData}
          style={{ width: 100 }}
        />
      </FormField>
      <FormField
        data-close-on-click={false}
        label="Type"
        data-activation-indicator
      >
        <Dropdown
          defaultSelected={typeData[0]}
          source={typeData}
          style={{ width: 90 }}
        />
      </FormField>
      <ToolbarButton
        label="Export"
        onClick={() => logItemName("export")}
        variant="secondary"
      >
        <ExportIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Share"
        onClick={() => logItemName("share")}
        variant="secondary"
      >
        <ShareIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Set Alerts"
        onClick={() => logItemName("alerts")}
        variant="secondary"
      >
        <NotificationIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Expand"
        onClick={() => logItemName("expand")}
        variant="secondary"
      >
        <TearOutIcon />
      </ToolbarButton>
    </Toolbar>
  );
};

export const DefaultAdjustable = ({ initialWidth = 450 }) => {
  const typeData = ["Open", "Close", "Discarted", "Resolved"];
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
    <AdjustableFlexbox height={420} width={initialWidth}>
      <Toolbar id="toolbar-default">
        <FormField
          data-close-on-click={false}
          label="Range"
          data-activation-indicator
        >
          <Dropdown
            defaultSelected={rangeData[0]}
            source={rangeData}
            style={{ width: 100 }}
          />
        </FormField>
        <FormField
          data-close-on-click={false}
          label="Type"
          data-activation-indicator
        >
          <Dropdown
            defaultSelected={typeData[0]}
            source={typeData}
            style={{ width: 90 }}
          />
        </FormField>
        <ToolbarButton
          label="Export"
          onClick={() => logItemName("export")}
          variant="secondary"
        >
          <ExportIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Share"
          onClick={() => logItemName("share")}
          variant="secondary"
        >
          <ShareIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Set Alerts"
          onClick={() => logItemName("alerts")}
          variant="secondary"
        >
          <NotificationIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Expand"
          onClick={() => logItemName("expand")}
          variant="secondary"
        >
          <TearOutIcon />
        </ToolbarButton>
      </Toolbar>
    </AdjustableFlexbox>
  );
};

export const SimpleToolbar = ({ initialWidth = 320, ...toolbarProps }) => {
  return (
    <AdjustableFlexbox height={200} width={initialWidth}>
      <Toolbar {...toolbarProps}>
        <ToolbarButton>
          <ExportIcon />
        </ToolbarButton>
        <ToolbarButton>
          <ShareIcon />
        </ToolbarButton>
        <ToolbarButton>
          <NotificationIcon />
        </ToolbarButton>
        <ToolbarButton>
          <TearOutIcon />
        </ToolbarButton>
        <ToolbarButton>
          <MessageIcon />
        </ToolbarButton>
        <ToolbarButton>
          <FilterIcon />
        </ToolbarButton>
        <ToolbarButton>
          <UserGroupIcon />
        </ToolbarButton>
        <ToolbarButton>
          <PinIcon />
        </ToolbarButton>
        <ToolbarButton>
          <SearchIcon />
        </ToolbarButton>
        <ToolbarButton>
          <UserIcon />
        </ToolbarButton>
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
              <FormField
                // closeOnClick={false}
                key="dropdown-1"
                style={{ width: "62px " }}
                // withActivationIndicator
              >
                <Dropdown defaultSelected="light" source={["light", "dark"]} />
              </FormField>,
              <FormField
                // closeOnClick={false}
                key="dropdown-2"
                style={{ width: "83px " }}
                // withActivationIndicator
              >
                <Dropdown
                  defaultSelected="medium"
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

export const WithPills = () => {
  return (
    <AdjustableFlexbox height={200} width={1000}>
      <Toolbar
        aria-label="Tooltray alignment toolbar"
        style={{ minWidth: "100px" }}
      >
        <FormField data-close-on-click={false} data-activation-indicator>
          <Input
            startAdornment={
              <StaticInputAdornment>
                <FilterIcon />
              </StaticInputAdornment>
            }
            style={{ width: 180 }}
            value=""
          />
        </FormField>
        <Tooltray aria-label="filters tooltray">
          <FormField ActivationIndicatorComponent={() => null}>
            <ToggleButton
              ariaLabel=" AND"
              style={{ width: "100%", minWidth: "60px" }}
              toggled
            >
              <SwapIcon /> AND
            </ToggleButton>
          </FormField>
          <FormField ActivationIndicatorComponent={() => null}>
            <Pill label="LOREM" onClick={() => console.log("lorem.")} />
          </FormField>
          <FormField ActivationIndicatorComponent={() => null}>
            <Pill label="IPSUM" onClick={() => console.log("ipsum.")} />
          </FormField>
          <FormField ActivationIndicatorComponent={() => null}>
            <Pill label="DOLAR" onClick={() => console.log("dolar.")} />
          </FormField>
        </Tooltray>
        <Tooltray aria-label="status tooltray" data-pad-end>
          <FormField ActivationIndicatorComponent={() => null}>
            <Button variant="secondary">CLEAR</Button>
          </FormField>
          <FormField ActivationIndicatorComponent={() => null}>
            <Button variant="primary">
              <AddIcon />
            </Button>
          </FormField>
        </Tooltray>
        <FormField
          data-close-on-click={false}
          label="Status"
          data-activation-indicator
        >
          <Dropdown defaultSelected={statusData[1]} source={statusData} />
        </FormField>
        <Tooltray aria-label="search tooltray">
          <Button variant="primary">
            <AddIcon />
          </Button>
        </Tooltray>
        <Tooltray aria-label="buttons tooltray">
          <ToolbarButton itemId="exportButton" overflowLabel="Export">
            <ExportIcon />
          </ToolbarButton>
          <ToolbarButton itemId="colsButton" overflowLabel="Select Columns">
            <ColumnChooserIcon />
          </ToolbarButton>
          <ToolbarButton itemId="settingsButton" overflowLabel="Settings">
            <SettingsIcon />
          </ToolbarButton>
        </Tooltray>
      </Toolbar>
    </AdjustableFlexbox>
  );
};

export const WithDynamicCollapseVariants = ({ initialWidth = 500 }) => {
  const pStyle: CSSProperties = { whiteSpace: "nowrap", overflow: "hidden" };

  return (
    <AdjustableFlexbox height={500} width={initialWidth}>
      {/* <p style={pStyle}>
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
      </Toolbar> */}
      {/* <p style={pStyle}>
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
      </Toolbar> */}
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

const SearchWidget = () => {
  return (
    <div className="SearchWidget" style={{ backgroundColor: "red" }}></div>
  );
};

export const ToolbarWithBreakpointSensitiveContent = () => {
  const typeData = ["Open", "Close", "Discarted", "Resolved"];
  const rangeData = [
    "Today",
    "Yesterday",
    "Last Week",
    "Last Month",
    "Last Year",
  ];

  // const [type, setType] = useState<string | undefined>(typeData[0]);
  // const [range, setRange] = useState<string | undefined>(rangeData[0]);

  const logItemName = (buttonName: string) =>
    console.log(`${buttonName} button clicked'`);

  return (
    <AdjustableFlexbox height={420} width={600}>
      <Toolbar id="toolbar-default">
        <Tooltray
          id="1"
          data-priority={1}
          aria-label="left dynamic tooltray"
          // overflowButtonLabel="left"
        >
          <ToolbarButton id="messageButton" label="Search">
            <SearchIcon />
          </ToolbarButton>
        </Tooltray>

        <FormField
          data-close-on-click={false}
          label="Range"
          data-activation-indicator
        >
          <Dropdown
            defaultSelected={rangeData[0]}
            source={rangeData}
            style={{ width: 100 }}
          />
        </FormField>
        <FormField
          data-close-on-click={false}
          label="Type"
          data-activation-indicator
        >
          <Dropdown
            defaultSelected={typeData[0]}
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
