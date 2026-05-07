import {
  Button,
  ComboBox,
  Divider,
  Dropdown,
  Input,
  Option,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { SearchIcon } from "@salt-ds/icons";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleGridPanel,
  DatePickerSingleInput,
  DatePickerTrigger,
  ToolbarNext,
  ToolbarRegion,
  TooltrayNext,
} from "@salt-ds/lab";
import type { Meta } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { AdjustableFlexbox } from "../components";

export default {
  title: "Lab/Toolbar Next/Cypress Test Fixtures",
  component: ToolbarNext,
} as Meta<typeof ToolbarNext>;

const options = ["Option A", "Option B", "Option C"];

function ToolbarHarness({
  children,
  height = 220,
  width = 760,
}: {
  children: ReactNode;
  height?: number;
  width?: number;
}) {
  return (
    <div className="Flexbox" style={{ height, width }}>
      {children}
    </div>
  );
}

function KeyboardHarness({
  children,
  width = 640,
}: {
  children: ReactNode;
  width?: number;
}) {
  return (
    <AdjustableFlexbox height={240} width={width}>
      <button data-testid="toolbar-before">Before toolbar</button>
      {children}
      <button data-testid="toolbar-after">After toolbar</button>
    </AdjustableFlexbox>
  );
}

export function OverflowDividersFixture({ width = 560 }: { width?: number }) {
  return (
    <ToolbarHarness width={width}>
      <ToolbarNext aria-label="Toolbar with divider overflow">
        <TooltrayNext role="group" aria-label="Search" overflowMode="none">
          <Input
            bordered
            startAdornment={<SearchIcon />}
            placeholder="Search"
          />
        </TooltrayNext>
        <Divider orientation="vertical" variant="secondary" />
        <TooltrayNext overflowMode="independent" overflowPriority={5}>
          <span>Description</span>
        </TooltrayNext>
        <Divider orientation="vertical" variant="secondary" />
        <TooltrayNext overflowMode="independent" overflowPriority={6}>
          <Button appearance="transparent">Secondary</Button>
        </TooltrayNext>
      </ToolbarNext>
    </ToolbarHarness>
  );
}

export function NamedOverflowWithDividersFixture({
  width = 760,
}: {
  width?: number;
}) {
  return (
    <ToolbarHarness width={width}>
      <ToolbarNext aria-label="Data entry toolbar with named overflow">
        <TooltrayNext overflowMode="none">
          <Input bordered placeholder="Value" />
        </TooltrayNext>
        <TooltrayNext
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode="independent"
          overflowPriority={3}
        >
          <Dropdown bordered defaultSelected={["Option A"]}>
            {options.map((option) => (
              <Option key={option} value={option} />
            ))}
          </Dropdown>
        </TooltrayNext>
        <TooltrayNext
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode="independent"
          overflowPriority={4}
        >
          <Dropdown bordered defaultSelected={["Option A"]}>
            {options.map((option) => (
              <Option key={option} value={option} />
            ))}
          </Dropdown>
        </TooltrayNext>
        <Divider orientation="vertical" variant="secondary" />
        <TooltrayNext
          aria-label="Actions"
          overflowGroup="Actions"
          overflowLabel="Actions"
          overflowMode="grouped"
          overflowPriority={5}
          role="group"
        >
          <Button appearance="transparent">Decline Request</Button>
          <Button appearance="solid">Adjust Price</Button>
        </TooltrayNext>
        <TooltrayNext
          align="end"
          overflowMode="none"
          role="group"
          aria-label="Quick actions"
        >
          <Button appearance="transparent">Search</Button>
          <Button appearance="transparent">Settings</Button>
        </TooltrayNext>
      </ToolbarNext>
    </ToolbarHarness>
  );
}

export function SpacingOverflowFixture({ width = 520 }: { width?: number }) {
  return (
    <ToolbarHarness width={width}>
      <ToolbarNext aria-label="Toolbar with overflow spacing">
        <TooltrayNext
          overflowMode="none"
          role="group"
          aria-label="Search"
          style={{ marginRight: "var(--salt-spacing-300)" }}
        >
          <Input
            bordered
            startAdornment={<SearchIcon />}
            placeholder="Search"
          />
        </TooltrayNext>
        <TooltrayNext overflowMode="independent" overflowPriority={6}>
          <Button appearance="transparent">Secondary</Button>
        </TooltrayNext>
        <TooltrayNext
          align="end"
          overflowMode="none"
          role="group"
          aria-label="Primary action"
          style={{ marginRight: "var(--salt-spacing-300)" }}
        >
          <Button appearance="transparent">Primary</Button>
        </TooltrayNext>
        <TooltrayNext
          align="end"
          overflowMode="none"
          role="group"
          aria-label="Run"
        >
          <Button appearance="solid">Run</Button>
        </TooltrayNext>
      </ToolbarNext>
    </ToolbarHarness>
  );
}

export function DefaultSharedOverflowFixture({
  width = 360,
}: {
  width?: number;
}) {
  return (
    <ToolbarHarness width={width}>
      <ToolbarNext aria-label="Toolbar with default shared overflow">
        <TooltrayNext overflowMode="none" role="group" aria-label="Search">
          <Input
            bordered
            startAdornment={<SearchIcon />}
            placeholder="Search"
          />
        </TooltrayNext>
        <TooltrayNext overflowPriority={4}>
          <Button appearance="transparent" style={{ width: 140 }}>
            Columns
          </Button>
        </TooltrayNext>
        <TooltrayNext align="end" overflowPriority={6}>
          <Button appearance="transparent" style={{ width: 140 }}>
            Export
          </Button>
        </TooltrayNext>
      </ToolbarNext>
    </ToolbarHarness>
  );
}

export function KeyboardButtonsFixture({ width = 560 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard buttons toolbar">
        <ToolbarRegion position="start">
          <TooltrayNext overflowMode="none" role="group" aria-label="Editing">
            <Button appearance="transparent">Cut</Button>
            <Button appearance="transparent">Copy</Button>
          </TooltrayNext>
        </ToolbarRegion>
        <ToolbarRegion position="end">
          <TooltrayNext
            overflowMode="none"
            role="group"
            aria-label="Primary action"
          >
            <Button appearance="solid">Run</Button>
          </TooltrayNext>
        </ToolbarRegion>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardTextInputFixture({ width = 620 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard text input toolbar">
        <TooltrayNext overflowMode="none" role="group" aria-label="Search">
          <Input
            bordered
            startAdornment={<SearchIcon />}
            placeholder="Search"
          />
        </TooltrayNext>
        <TooltrayNext overflowMode="none" role="group" aria-label="Actions">
          <Button appearance="transparent">Columns</Button>
          <Button appearance="solid">Run</Button>
        </TooltrayNext>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardComboBoxFixture({ width = 620 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard combo box toolbar">
        <TooltrayNext overflowMode="none" role="group" aria-label="Selection">
          <ComboBox bordered defaultSelected={["Option A"]}>
            {options.map((option) => (
              <Option key={option} value={option} />
            ))}
          </ComboBox>
        </TooltrayNext>
        <TooltrayNext overflowMode="none" role="group" aria-label="Actions">
          <Button appearance="transparent">Columns</Button>
          <Button appearance="solid">Run</Button>
        </TooltrayNext>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardDropdownFixture({ width = 620 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard dropdown toolbar">
        <TooltrayNext overflowMode="none" role="group" aria-label="Selection">
          <Dropdown bordered defaultSelected={["Option A"]}>
            {options.map((option) => (
              <Option key={option} value={option} />
            ))}
          </Dropdown>
        </TooltrayNext>
        <TooltrayNext overflowMode="none" role="group" aria-label="Actions">
          <Button appearance="transparent">Columns</Button>
          <Button appearance="solid">Run</Button>
        </TooltrayNext>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardDatePickerFixture({ width = 720 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard date picker toolbar">
        <ToolbarRegion position="start">
          <TooltrayNext overflowMode="none" role="group" aria-label="Date">
            <DatePicker selectionVariant="single">
              <DatePickerTrigger>
                <DatePickerSingleInput bordered placeholder="Select date" />
              </DatePickerTrigger>
              <DatePickerOverlay>
                <DatePickerSingleGridPanel />
              </DatePickerOverlay>
            </DatePicker>
          </TooltrayNext>
        </ToolbarRegion>
        <ToolbarRegion position="end">
          <TooltrayNext overflowMode="none" role="group" aria-label="Actions">
            <Button appearance="solid">Apply</Button>
          </TooltrayNext>
        </ToolbarRegion>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardToggleGroupFixture({
  disableFirstToggle = false,
  width = 680,
}: {
  disableFirstToggle?: boolean;
  width?: number;
}) {
  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard toggle group toolbar">
        <ToolbarRegion position="start">
          <TooltrayNext overflowMode="none" role="group" aria-label="Actions">
            <Button appearance="solid">First Run</Button>
          </TooltrayNext>
        </ToolbarRegion>
        <ToolbarRegion position="center">
          <TooltrayNext
            overflowMode="none"
            role="group"
            aria-label="View toggle"
          >
            <ToggleButtonGroup defaultValue="all">
              <ToggleButton disabled={disableFirstToggle} value="all">
                All
              </ToggleButton>
              <ToggleButton value="active">Active</ToggleButton>
              <ToggleButton value="archived">Archived</ToggleButton>
            </ToggleButtonGroup>
          </TooltrayNext>
        </ToolbarRegion>
        <ToolbarRegion position="end">
          <TooltrayNext overflowMode="none" role="group" aria-label="Actions">
            <Button appearance="solid">Run</Button>
          </TooltrayNext>
        </ToolbarRegion>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardOverflowToggleGroupFixture({
  disableFirstToggle = false,
  width = 260,
}: {
  disableFirstToggle?: boolean;
  width?: number;
}) {
  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard overflow toggle group toolbar">
        <ToolbarRegion position="start">
          <TooltrayNext overflowMode="none" role="group" aria-label="Pinned">
            <Button appearance="solid">Pinned</Button>
          </TooltrayNext>
        </ToolbarRegion>
        <ToolbarRegion position="end">
          <TooltrayNext
            aria-label="Views"
            overflowGroup="Views"
            overflowLabel="Views"
            overflowMode="grouped"
            overflowPriority={5}
            role="group"
          >
            <Button appearance="transparent">Before toggles</Button>
            <ToggleButtonGroup defaultValue="all">
              <ToggleButton disabled={disableFirstToggle} value="all">
                All
              </ToggleButton>
              <ToggleButton value="active">Active</ToggleButton>
              <ToggleButton value="archived">Archived</ToggleButton>
            </ToggleButtonGroup>
            <Button appearance="solid">Confirm view</Button>
          </TooltrayNext>
        </ToolbarRegion>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardOverflowFixture({ width = 420 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard overflow toolbar">
        <ToolbarRegion position="start">
          <TooltrayNext overflowMode="none" role="group" aria-label="Search">
            <Input
              bordered
              startAdornment={<SearchIcon />}
              placeholder="Search"
            />
          </TooltrayNext>
        </ToolbarRegion>
        <ToolbarRegion position="end">
          <TooltrayNext
            aria-label="Actions"
            overflowGroup="Actions"
            overflowLabel="Actions"
            overflowMode="grouped"
            overflowPriority={5}
            role="group"
          >
            <Button appearance="transparent">Export</Button>
            <Button appearance="solid">Run</Button>
          </TooltrayNext>
        </ToolbarRegion>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardOverflowRerenderFixture({
  width = 420,
}: {
  width?: number;
}) {
  const [clickCount, setClickCount] = useState(0);

  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard overflow rerender toolbar">
        <ToolbarRegion position="start">
          <TooltrayNext overflowMode="none" role="group" aria-label="Search">
            <Input
              bordered
              startAdornment={<SearchIcon />}
              placeholder="Search"
            />
          </TooltrayNext>
        </ToolbarRegion>
        <ToolbarRegion position="end">
          <TooltrayNext
            aria-label="Actions"
            overflowGroup="Actions"
            overflowLabel="Actions"
            overflowMode="grouped"
            overflowPriority={5}
            role="group"
          >
            <Button appearance="transparent">Export</Button>
            <Button
              appearance="solid"
              onClick={() => {
                setClickCount((current) => current + 1);
              }}
            >
              Re-render {clickCount}
            </Button>
          </TooltrayNext>
        </ToolbarRegion>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardRtlFixture({ width = 560 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <div dir="rtl">
        <ToolbarNext aria-label="Keyboard RTL toolbar">
          <TooltrayNext
            overflowMode="none"
            role="group"
            aria-label="Search and filter"
          >
            <Button appearance="transparent">Columns</Button>
            <Button appearance="transparent">Status</Button>
          </TooltrayNext>
          <TooltrayNext
            overflowMode="none"
            role="group"
            align="end"
            aria-label="Actions"
          >
            <Button appearance="solid">Run</Button>
          </TooltrayNext>
        </ToolbarNext>
      </div>
    </KeyboardHarness>
  );
}
