import {
  Button,
  ComboBox,
  Divider,
  Dropdown,
  Input,
  Option,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  ToolbarContent,
  Tooltray,
} from "@salt-ds/core";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleGridPanel,
  DatePickerSingleInput,
  DatePickerTrigger,
} from "@salt-ds/date-components";
import { CurrencyIcon, SearchIcon } from "@salt-ds/icons";
import type { Meta } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";

export default {
  title: "Core/Toolbar/Cypress Test Fixtures",
  component: Toolbar,
} as Meta<typeof Toolbar>;

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
    <div
      className="Flexbox"
      style={{ height: 240, width, flexDirection: "column" }}
    >
      <button data-testid="toolbar-before">Before toolbar</button>
      {children}
      <button data-testid="toolbar-after">After toolbar</button>
    </div>
  );
}

export function OverflowDividersFixture({ width = 560 }: { width?: number }) {
  return (
    <ToolbarHarness width={width}>
      <Toolbar aria-label="Toolbar with divider overflow">
        <Tooltray overflowMode="none">
          <Input
            bordered
            startAdornment={<SearchIcon aria-hidden />}
            placeholder="Search"
          />
        </Tooltray>
        <Divider aria-hidden orientation="vertical" variant="secondary" />
        <Tooltray overflowMode="independent" overflowPriority={5}>
          <span>Description</span>
        </Tooltray>
        <Divider aria-hidden orientation="vertical" variant="secondary" />
        <Tooltray overflowMode="independent" overflowPriority={6}>
          <Button appearance="transparent">Secondary</Button>
        </Tooltray>
      </Toolbar>
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
      <Toolbar aria-label="Data entry toolbar with named overflow">
        <Tooltray overflowMode="none">
          <Input
            bordered
            placeholder="Enter price"
            startAdornment={<CurrencyIcon aria-hidden />}
          />
        </Tooltray>
        <Tooltray
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode="independent"
          overflowPriority={3}
        >
          <Dropdown
            aria-label="Primary filter"
            bordered
            defaultSelected={["Option A"]}
          >
            {options.map((option) => (
              <Option key={option} value={option} />
            ))}
          </Dropdown>
        </Tooltray>
        <Tooltray
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode="independent"
          overflowPriority={4}
        >
          <Dropdown
            aria-label="Secondary filter"
            bordered
            defaultSelected={["Option A"]}
          >
            {options.map((option) => (
              <Option key={option} value={option} />
            ))}
          </Dropdown>
        </Tooltray>
        <Divider aria-hidden orientation="vertical" variant="secondary" />
        <Tooltray
          overflowGroup="Actions"
          overflowLabel="Actions"
          overflowMode="grouped"
          overflowPriority={5}
        >
          <Button appearance="transparent">Decline Request</Button>
          <Button appearance="solid">Adjust Price</Button>
        </Tooltray>
        <Tooltray align="end" overflowMode="none">
          <Button appearance="transparent">Search</Button>
          <Button appearance="transparent">Settings</Button>
        </Tooltray>
      </Toolbar>
    </ToolbarHarness>
  );
}

export function SpacingOverflowFixture({ width = 520 }: { width?: number }) {
  return (
    <ToolbarHarness width={width}>
      <Toolbar aria-label="Toolbar with overflow spacing">
        <Tooltray
          overflowMode="none"
          style={{ marginRight: "var(--salt-spacing-300)" }}
        >
          <Input
            bordered
            startAdornment={<SearchIcon aria-hidden />}
            placeholder="Search"
          />
        </Tooltray>
        <Tooltray overflowMode="independent" overflowPriority={6}>
          <Button appearance="transparent">Secondary</Button>
        </Tooltray>
        <Tooltray
          align="end"
          overflowMode="none"
          style={{ marginRight: "var(--salt-spacing-300)" }}
        >
          <Button appearance="transparent">Primary</Button>
        </Tooltray>
        <Tooltray align="end" overflowMode="none">
          <Button appearance="solid">Run</Button>
        </Tooltray>
      </Toolbar>
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
      <Toolbar aria-label="Toolbar with default shared overflow">
        <Tooltray overflowMode="none">
          <Input
            bordered
            startAdornment={<SearchIcon aria-hidden />}
            placeholder="Search"
          />
        </Tooltray>
        <Tooltray overflowPriority={4}>
          <Button appearance="transparent" style={{ width: 140 }}>
            Columns
          </Button>
        </Tooltray>
        <Tooltray align="end" overflowPriority={6}>
          <Button appearance="transparent" style={{ width: 140 }}>
            Export
          </Button>
        </Tooltray>
      </Toolbar>
    </ToolbarHarness>
  );
}

export function KeyboardButtonsFixture({ width = 560 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <Toolbar aria-label="Keyboard buttons toolbar">
        <ToolbarContent position="start">
          <Tooltray overflowMode="none">
            <Button appearance="transparent">Cut</Button>
            <Button appearance="transparent">Copy</Button>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray overflowMode="none">
            <Button appearance="solid">Run</Button>
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
    </KeyboardHarness>
  );
}

export function KeyboardTextInputFixture({ width = 620 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <Toolbar aria-label="Keyboard text input toolbar">
        <Tooltray overflowMode="none">
          <Input
            bordered
            startAdornment={<SearchIcon aria-hidden />}
            placeholder="Search"
          />
        </Tooltray>
        <Tooltray overflowMode="none">
          <Button appearance="transparent">Columns</Button>
          <Button appearance="solid">Run</Button>
        </Tooltray>
      </Toolbar>
    </KeyboardHarness>
  );
}

export function KeyboardComboBoxFixture({ width = 620 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <Toolbar aria-label="Keyboard combo box toolbar">
        <Tooltray overflowMode="none">
          <ComboBox
            aria-label="Selection"
            bordered
            defaultSelected={["Option A"]}
          >
            {options.map((option) => (
              <Option key={option} value={option} />
            ))}
          </ComboBox>
        </Tooltray>
        <Tooltray overflowMode="none">
          <Button appearance="transparent">Columns</Button>
          <Button appearance="solid">Run</Button>
        </Tooltray>
      </Toolbar>
    </KeyboardHarness>
  );
}

export function KeyboardDropdownFixture({ width = 620 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <Toolbar aria-label="Keyboard dropdown toolbar">
        <Tooltray overflowMode="none">
          <Dropdown
            aria-label="Selection"
            bordered
            defaultSelected={["Option A"]}
          >
            {options.map((option) => (
              <Option key={option} value={option} />
            ))}
          </Dropdown>
        </Tooltray>
        <Tooltray overflowMode="none">
          <Button appearance="transparent">Columns</Button>
          <Button appearance="solid">Run</Button>
        </Tooltray>
      </Toolbar>
    </KeyboardHarness>
  );
}

export function KeyboardDatePickerFixture({ width = 720 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <Toolbar aria-label="Keyboard date picker toolbar">
        <ToolbarContent position="start">
          <Tooltray overflowMode="none">
            <DatePicker selectionVariant="single">
              <DatePickerTrigger>
                <DatePickerSingleInput
                  aria-label="Date"
                  bordered
                  placeholder="Select date"
                />
              </DatePickerTrigger>
              <DatePickerOverlay>
                <DatePickerSingleGridPanel />
              </DatePickerOverlay>
            </DatePicker>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray overflowMode="none">
            <Button appearance="solid">Apply</Button>
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
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
      <Toolbar aria-label="Keyboard toggle group toolbar">
        <ToolbarContent position="start">
          <Tooltray overflowMode="none">
            <Button appearance="solid">First Run</Button>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="center">
          <Tooltray overflowMode="none">
            <ToggleButtonGroup aria-label="View toggle" defaultValue="all">
              <ToggleButton disabled={disableFirstToggle} value="all">
                All
              </ToggleButton>
              <ToggleButton value="active">Active</ToggleButton>
              <ToggleButton value="archived">Archived</ToggleButton>
            </ToggleButtonGroup>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray overflowMode="none">
            <Button appearance="solid">Run</Button>
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
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
      <Toolbar aria-label="Keyboard overflow toggle group toolbar">
        <ToolbarContent position="start">
          <Tooltray overflowMode="none">
            <Button appearance="solid">Pinned</Button>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray
            overflowGroup="Views"
            overflowLabel="Views"
            overflowMode="grouped"
            overflowPriority={5}
          >
            <Button appearance="transparent">Before toggles</Button>
            <ToggleButtonGroup aria-label="View filter" defaultValue="all">
              <ToggleButton disabled={disableFirstToggle} value="all">
                All
              </ToggleButton>
              <ToggleButton value="active">Active</ToggleButton>
              <ToggleButton value="archived">Archived</ToggleButton>
            </ToggleButtonGroup>
            <Button appearance="solid">Confirm view</Button>
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
    </KeyboardHarness>
  );
}

export function KeyboardOverflowFixture({ width = 420 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <Toolbar aria-label="Keyboard overflow toolbar">
        <ToolbarContent position="start">
          <Tooltray overflowMode="none">
            <Input
              bordered
              startAdornment={<SearchIcon aria-hidden />}
              placeholder="Search"
            />
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray
            overflowGroup="Actions"
            overflowLabel="Actions"
            overflowMode="grouped"
            overflowPriority={5}
          >
            <Button appearance="transparent">Export</Button>
            <Button appearance="solid">Run</Button>
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
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
      <Toolbar aria-label="Keyboard overflow rerender toolbar">
        <ToolbarContent position="start">
          <Tooltray overflowMode="none">
            <Input
              bordered
              startAdornment={<SearchIcon aria-hidden />}
              placeholder="Search"
            />
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray
            overflowGroup="Actions"
            overflowLabel="Actions"
            overflowMode="grouped"
            overflowPriority={5}
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
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
    </KeyboardHarness>
  );
}

export function KeyboardRtlFixture({ width = 560 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <div dir="rtl">
        <Toolbar aria-label="Keyboard RTL toolbar">
          <Tooltray overflowMode="none">
            <Button appearance="transparent">Columns</Button>
            <Button appearance="transparent">Status</Button>
          </Tooltray>
          <Tooltray overflowMode="none" align="end">
            <Button appearance="solid">Run</Button>
          </Tooltray>
        </Toolbar>
      </div>
    </KeyboardHarness>
  );
}
