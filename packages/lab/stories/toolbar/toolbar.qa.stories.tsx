import { Button, Pill, ToggleButton } from "@salt-ds/core";
import {
  AddIcon,
  ColumnChooserIcon,
  ExportIcon,
  FilterIcon,
  NotificationIcon,
  SettingsIcon,
  ShareIcon,
  SwapIcon,
  TearOutIcon,
} from "@salt-ds/icons";
import {
  Dropdown,
  FormField,
  Input,
  StaticInputAdornment,
  Toolbar,
  ToolbarButton,
  Tooltray,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

import "docs/story.css";

export default {
  title: "Lab/Toolbar/QA",
  component: Toolbar,
};

const rangeData = [
  "Today",
  "Yesterday",
  "Last Week",
  "Last Month",
  "Last Year",
];
const statusData = ["All", "New", "Working", "Fully Filled", "Cancelled"];
const typeData = ["Open", "Close", "Discarted", "Resolved"];

export const QA: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={1} itemPadding={3} itemWidthAuto>
    <Toolbar aria-label="Default toolbar" style={{ minWidth: "100px" }}>
      <FormField data-close-on-click={false} label="Range">
        <Dropdown
          defaultSelected={rangeData[0]}
          source={rangeData}
          style={{ width: 100 }}
        />
      </FormField>
      <FormField data-close-on-click={false} label="Type">
        <Dropdown
          defaultSelected={typeData[0]}
          source={typeData}
          style={{ width: 90 }}
        />
      </FormField>
      <ToolbarButton label="Export" variant="secondary">
        <ExportIcon />
      </ToolbarButton>
      <ToolbarButton label="Share" variant="secondary">
        <ShareIcon />
      </ToolbarButton>
      <ToolbarButton label="Set Alerts" variant="secondary">
        <NotificationIcon />
      </ToolbarButton>
      <ToolbarButton label="Expand" variant="secondary">
        <TearOutIcon />
      </ToolbarButton>
    </Toolbar>
    <Toolbar
      aria-label="Tooltray alignment toolbar"
      style={{ minWidth: "100px" }}
    >
      <FormField data-close-on-click={false}>
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
        <ToggleButton
          style={{ width: "100%", minWidth: "60px" }}
          selected
          value="and"
        >
          <SwapIcon aria-hidden /> AND
        </ToggleButton>
        <FormField>
          <Pill onClick={() => console.log("lorem.")}>LOREM</Pill>
        </FormField>
        <FormField>
          <Pill onClick={() => console.log("ipsum.")}>IPSUM</Pill>
        </FormField>
        <FormField>
          <Pill onClick={() => console.log("dolar.")}>DOLAR</Pill>
        </FormField>
      </Tooltray>
      <Tooltray aria-label="status tooltray" data-pad-end>
        <Button variant="secondary">CLEAR</Button>
        <Button variant="primary">
          <AddIcon />
        </Button>
      </Tooltray>
      <FormField
        data-close-on-click={false}
        label="Status"
        style={{ width: "95px " }}
      >
        <Dropdown defaultSelected={statusData[1]} source={statusData} />
      </FormField>
      <Tooltray aria-label="search tooltray">
        <Button variant="primary">
          <AddIcon />
        </Button>
      </Tooltray>
      <Tooltray aria-label="buttons tooltray">
        <ToolbarButton id="exportButton" overflowLabel="Export">
          <ExportIcon />
        </ToolbarButton>
        <ToolbarButton id="colsButton" overflowLabel="Select Columns">
          <ColumnChooserIcon />
        </ToolbarButton>
        <ToolbarButton id="settingsButton" overflowLabel="Settings">
          <SettingsIcon />
        </ToolbarButton>
      </Tooltray>
    </Toolbar>
  </QAContainer>
);

QA.parameters = {
  chromatic: { disableSnapshot: false },
};
