import {
  Button,
  Divider,
  Dropdown,
  Input,
  Option,
  Switch,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { DateInputSingle } from "@salt-ds/date-components";
import {
  ExportIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
} from "@salt-ds/icons";
import { ToolbarNext, ToolbarRegion, TooltrayNext } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Lab/Toolbar Next",
  component: ToolbarNext,
  parameters: {
    layout: "padded",
  },
  subcomponents: {
    ToolbarRegion,
    TooltrayNext,
  },
} as Meta<typeof ToolbarNext>;

const options = ["Option A", "Option B", "Option C"];
const toolbarVariants = ["primary", "secondary", "tertiary"] as const;

/**
 * Flat align sugar — no explicit `ToolbarRegion` wrappers.
 *
 * Intended behavior:
 * - `TooltrayNext` children are bucketed into implicit regions via their
 *   `align` prop (`"start"` by default, `"end"` for the actions tray).
 * - The toolbar renders a start region with the search input and dropdown on
 *   the left, and an end region with icon buttons and a solid button on the
 *   right.
 * - The trays use the default shared overflow behavior, so constrained width
 *   collapses content into the generic overflow trigger.
 */
export const FlatAlignSugar: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Flat toolbar">
    <TooltrayNext>
      <Dropdown bordered defaultSelected={["Option A"]} style={{ width: 160 }}>
        {options.map((option) => (
          <Option value={option} key={option} />
        ))}
      </Dropdown>
    </TooltrayNext>
    <TooltrayNext role="group" aria-label="Search and filter">
      <Input
        bordered
        startAdornment={<SearchIcon />}
        placeholder="Search"
        style={{ width: 180 }}
      />
    </TooltrayNext>
    <TooltrayNext role="group" align="end" aria-label="Actions">
      <Button appearance="transparent" aria-label="Grid view">
        <GridIcon aria-hidden />
      </Button>
      <Button appearance="transparent" aria-label="List view">
        <ListIcon aria-hidden />
      </Button>
      <Button appearance="solid">Button</Button>
    </TooltrayNext>
  </ToolbarNext>
);
FlatAlignSugar.globals = {
  responsive: "wrap",
};

/**
 * Explicit three-region layout using `ToolbarRegion`.
 *
 * Intended behavior:
 * - The toolbar uses explicit `ToolbarRegion` wrappers with `position`
 *   set to `"start"`, `"center"`, and `"end"`.
 * - The center region holds a toggle button group that should remain
 *   visually centered between the start and end regions regardless of
 *   how much content is in each.
 * - Trays use the default shared overflow behavior, validating that the
 *   region-first authoring model also collapses responsively.
 */
export const RegionFirst: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Region first toolbar">
    <ToolbarRegion position="start">
      <TooltrayNext>
        <Input
          bordered
          startAdornment={<SearchIcon />}
          placeholder="Search"
          style={{ width: 180 }}
        />
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="center">
      <TooltrayNext role="group" aria-label="Toggle options">
        <ToggleButtonGroup>
          <ToggleButton value="toggle-1">Toggle</ToggleButton>
          <ToggleButton value="toggle-2">Toggle</ToggleButton>
          <ToggleButton value="toggle-3">Toggle</ToggleButton>
        </ToggleButtonGroup>
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="end">
      <TooltrayNext>
        <Text>Description</Text>
      </TooltrayNext>
    </ToolbarRegion>
  </ToolbarNext>
);
RegionFirst.globals = {
  responsive: "wrap",
};

/**
 * Centered layout with a named inline overflow trigger in the end band.
 *
 * Intended behavior:
 * - As width decreases, the end-region actions collapse into an inline
 *   `Actions` trigger.
 * - Replacing the end tray with that trigger must not pull the center control
 *   off the toolbar midpoint.
 */
export const CenteredNamedOverflow: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Centered named overflow toolbar">
    <ToolbarRegion position="start">
      <TooltrayNext overflowMode="none" role="group" aria-label="Leading">
        <Button style={{ width: 140 }}>Start</Button>
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="center">
      <TooltrayNext overflowMode="none" role="group" aria-label="Centered">
        <Button style={{ width: 140 }}>Center action</Button>
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
        <Button appearance="transparent" style={{ width: 180 }}>
          End primary
        </Button>
        <Button appearance="transparent" style={{ width: 120 }}>
          End secondary
        </Button>
      </TooltrayNext>
    </ToolbarRegion>
  </ToolbarNext>
);
CenteredNamedOverflow.globals = {
  responsive: "wrap",
};

/**
 * Transparent appearance with no visible border or padding.
 *
 * Intended behavior:
 * - `appearance="transparent"` removes the toolbar's border and padding,
 *   making it suitable for embedding inside an existing container like
 *   an app header or card where the toolbar should not draw its own
 *   visual boundary.
 * - The two-region layout (start and end) still works; controls align
 *   to their respective edges.
 * - The trays still use default shared overflow, validating the transparent
 *   treatment with the generic trigger.
 */
export const Transparent: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext appearance="transparent" aria-label="App header toolbar">
    <ToolbarRegion position="start">
      <TooltrayNext role="group" aria-label="Search and filter">
        <Input
          bordered
          startAdornment={<SearchIcon />}
          placeholder="Search"
          style={{ width: 180 }}
        />
        <Dropdown bordered defaultSelected={["Option A"]} style={{ width: 160 }}>
          {options.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="end">
      <TooltrayNext role="group" aria-label="Utility actions">
        <Button appearance="transparent" aria-label="Grid view">
          <GridIcon aria-hidden />
        </Button>
        <Button appearance="transparent" aria-label="List view">
          <ListIcon aria-hidden />
        </Button>
        <Button appearance="solid">Button</Button>
      </TooltrayNext>
    </ToolbarRegion>
  </ToolbarNext>
);
Transparent.globals = {
  responsive: "wrap",
};

/**
 * Surface variants for bordered toolbars.
 *
 * Intended behavior:
 * - `variant` maps the bordered toolbar to the matching container surface
 *   tokens while preserving the same layout and overflow behavior.
 * - `primary` is the default variant; `secondary` and `tertiary` are available
 *   for embedding the toolbar in lower-emphasis surfaces.
 */
export const Variants: StoryFn<typeof ToolbarNext> = () => (
  <div
    style={{
      display: "grid",
      gap: "var(--salt-spacing-200)",
    }}
  >
    {toolbarVariants.map((variant) => (
      <div
        key={variant}
        style={{
          display: "grid",
          gap: "var(--salt-spacing-100)",
        }}
      >
        <Text>{variant}</Text>
        <ToolbarNext variant={variant} aria-label={`${variant} toolbar`}>
          <ToolbarRegion position="start">
            <TooltrayNext role="group" aria-label="Search" overflowMode="none">
              <Input
                bordered
                startAdornment={<SearchIcon />}
                placeholder="Search"
                style={{ width: 180 }}
              />
            </TooltrayNext>
            <TooltrayNext role="group" aria-label="Filter">
              <Dropdown
                bordered
                defaultSelected={["Option A"]}
                style={{ width: 160 }}
              >
                {options.map((option) => (
                  <Option value={option} key={option} />
                ))}
              </Dropdown>
            </TooltrayNext>
          </ToolbarRegion>
          <ToolbarRegion position="end">
            <TooltrayNext role="group" aria-label="Utility actions">
              <Button appearance="transparent">Export</Button>
              <Button appearance="solid">Button</Button>
            </TooltrayNext>
          </ToolbarRegion>
        </ToolbarNext>
      </div>
    ))}
  </div>
);
Variants.globals = {
  responsive: "wrap",
};

/**
 * Mixed form control types inside tooltray groups.
 *
 * Intended behavior:
 * - Demonstrates that `TooltrayNext` can hold arbitrary Salt form
 *   controls (Input, Dropdown, DateInputSingle, Switch, Button), not
 *   only buttons.
 * - The start region groups filtering criteria; the end region groups
 *   a toggle and a primary action.
 * - The groups use default shared overflow, so non-button controls can collapse
 *   into the generic overflow menu.
 */
export const MixedFormControls: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Mixed controls toolbar">
    <ToolbarRegion position="start">
      <TooltrayNext>
        <Input
          bordered
          startAdornment={<SearchIcon />}
          placeholder="Search"
          style={{ width: 180 }}
        />
      </TooltrayNext>
      <TooltrayNext role="group" aria-label="Criteria">
        <Dropdown
          bordered
          defaultSelected={["Option A"]}
          style={{ width: 160 }}
        >
          {options.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
        <DateInputSingle
          bordered
          aria-label="Settlement date"
          style={{ width: 180 }}
        />
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="end">
      <TooltrayNext role="group" aria-label="Settings and actions">
        <Switch label="Pinned" />
        <Button appearance="solid">Run</Button>
      </TooltrayNext>
    </ToolbarRegion>
  </ToolbarNext>
);
MixedFormControls.globals = {
  responsive: "wrap",
};

/**
 * Right-to-left layout without overflow.
 *
 * Intended behavior:
 * - The wrapping `div` sets `dir="rtl"`, reversing the inline direction
 *   of the entire toolbar.
 * - The start-aligned search tray should appear on the right; the
 *   end-aligned actions tray should appear on the left.
 * - The groups use default shared overflow, validating the generic trigger
 *   under RTL.
 */
export const RightToLeft: StoryFn<typeof ToolbarNext> = () => (
  <div dir="rtl">
    <ToolbarNext aria-label="RTL toolbar">
      <TooltrayNext role="group" aria-label="Search and filter">
        <Input
          bordered
          startAdornment={<SearchIcon />}
          placeholder="Search"
          style={{ width: 180 }}
        />
        <Dropdown bordered defaultSelected={["Option A"]} style={{ width: 160 }}>
          {options.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
      <TooltrayNext role="group" align="end" aria-label="Actions">
        <Button appearance="transparent" aria-label="Grid view">
          <GridIcon aria-hidden />
        </Button>
        <Button appearance="transparent" aria-label="List view">
          <ListIcon aria-hidden />
        </Button>
        <Button appearance="solid">Button</Button>
      </TooltrayNext>
    </ToolbarNext>
  </div>
);
RightToLeft.globals = {
  responsive: "wrap",
};

/**
 * Default shared overflow — omitted overflowMode collapses into the generic trigger.
 *
 * Intended behavior:
 * - The search tray has `overflowMode="none"` and should never collapse.
 *   It remains visible at all widths.
 * - The dropdown/filters tray (priority 4) and the actions tray
 *   (priority 6) omit `overflowMode`, so both use the default shared overflow.
 * - As the toolbar narrows, the highest-priority tray (actions,
 *   priority 6) should overflow first, followed by the filters tray
 *   (priority 4). They collapse one at a time, not all at once.
 * - A single shared overflow trigger (ellipsis icon, no label) appears
 *   at the trailing edge once any tray has overflowed.
 * - Dividers between trays should disappear when their adjacent tray
 *   overflows, rather than remaining as orphaned separators.
 * - The overflow surface should present overflowed trays horizontally
 *   with toolbar-like spacing, not as a vertical menu.
 * - Use the Storybook responsive wrapper (wrap/unwrap toggle) to
 *   resize and observe the progressive collapse.
 */
export const DefaultSharedOverflow: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Toolbar with shared overflow">
    <TooltrayNext role="group" aria-label="Search" overflowMode="none">
      <Input
        bordered
        startAdornment={<SearchIcon />}
        placeholder="Search"
        style={{ width: 180 }}
      />
    </TooltrayNext>
    <TooltrayNext overflowPriority={4}>
      <Dropdown bordered defaultSelected={["Option A"]} style={{ width: 160 }}>
        {options.map((option) => (
          <Option value={option} key={option} />
        ))}
      </Dropdown>
      <Button appearance="transparent">
        <FilterIcon aria-hidden />
        Filters
      </Button>
    </TooltrayNext>
    <Divider orientation="vertical" variant="secondary" />
    <TooltrayNext
      align="end"
      aria-label="Actions"
      overflowPriority={6}
      role="group"
    >
      <Button appearance="transparent">
        <ExportIcon aria-hidden />
        Export
      </Button>
      <Button appearance="transparent">
        <SettingsIcon aria-hidden />
        Settings
      </Button>
    </TooltrayNext>
  </ToolbarNext>
);
DefaultSharedOverflow.globals = {
  responsive: "wrap",
};

/**
 * Named overflow — grouped collapse into distinct named overflow triggers.
 *
 * Intended behavior:
 * - Uses explicit `ToolbarRegion` wrappers (start and end).
 * - The search tray (`overflowMode="none"`) never collapses.
 * - The "Filters" tray (start region, priority 6, `overflowGroup="Filters"`,
 *   `overflowMode="grouped"`) collapses as a complete unit into its own
 *   overflow trigger labeled "Filters".
 * - The "Actions" tray (end region, priority 5, `overflowGroup="Actions"`,
 *   `overflowMode="grouped"`) collapses as a complete unit into its own
 *   overflow trigger labeled "Actions".
 * - Because "Filters" has higher priority (6) than "Actions" (5), the
 *   Filters tray should overflow first.
 * - Both triggers should be visually distinct through their label-only
 *   treatment, so users can tell them apart without relying on a shared
 *   overflow icon.
 * - Each named trigger replaces its collapsed tray inline within its own
 *   region rather than jumping to the end of the toolbar.
 * - Clicking a named trigger opens a panel showing that group's controls
 *   in a horizontal toolbar-like layout.
 * - Escape closes the panel and returns focus to the trigger.
 */
export const NamedOverflow: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Toolbar with named overflow">
    <ToolbarRegion position="start">
      <TooltrayNext role="group" aria-label="Search" overflowMode="none">
        <Input
          bordered
          startAdornment={<SearchIcon />}
          placeholder="Search"
          style={{ width: 180 }}
        />
      </TooltrayNext>
      <Divider orientation="vertical" variant="secondary" />
      <TooltrayNext
        aria-label="Filters"
        overflowGroup="Filters"
        overflowLabel="Filters"
        overflowMode="grouped"
        overflowPriority={6}
        role="group"
      >
        <Dropdown bordered defaultSelected={["Option A"]} style={{ width: 160 }}>
          {options.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
        <Button appearance="transparent">
          <FilterIcon aria-hidden />
          Filters
        </Button>
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
        <Button appearance="transparent">
          <ExportIcon aria-hidden />
          Export
        </Button>
        <Button appearance="transparent">
          <SettingsIcon aria-hidden />
          Settings
        </Button>
      </TooltrayNext>
    </ToolbarRegion>
  </ToolbarNext>
);
NamedOverflow.globals = {
  responsive: "wrap",
};

/**
 * Priority-driven overflow ordering.
 *
 * Intended behavior:
 * - Four trays with `overflowMode="independent"` and ascending priorities:
 *   "Pinned" (1), "Views" (1), "Status" (3), "Export" (5).
 * - As the toolbar narrows, the highest-priority tray ("Export", 5)
 *   should overflow first, then "Status" (3), then the two priority-1
 *   trays in reverse source order ("Views" before "Pinned").
 * - All trays share the default `overflowGroup="shared"`, so a single
 *   overflow trigger appears once any tray is hidden.
 * - This story validates that `overflowPriority` correctly controls the
 *   collapse sequence: higher numbers overflow before lower numbers,
 *   and equal priorities collapse from trailing edge to leading edge.
 */
export const OverflowPriorities: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Toolbar with overflow priorities">
    <TooltrayNext overflowMode="independent" overflowPriority={1}>
      <Button appearance="transparent">Pinned</Button>
    </TooltrayNext>
    <TooltrayNext overflowMode="independent" overflowPriority={1}>
      <Button appearance="transparent">Views</Button>
    </TooltrayNext>
    <TooltrayNext overflowMode="independent" overflowPriority={3}>
      <Button appearance="transparent">Status</Button>
    </TooltrayNext>
    <TooltrayNext align="end" overflowMode="independent" overflowPriority={5}>
      <Button appearance="transparent">
        <ExportIcon aria-hidden />
        Export
      </Button>
    </TooltrayNext>
  </ToolbarNext>
);
OverflowPriorities.globals = {
  responsive: "wrap",
};

/**
 * General toolbar with dividers carried into overflow.
 *
 * Intended behavior:
 * - At full width, the action controls are separate trays with visible
 *   dividers between them.
 * - Use the Storybook responsive wrapper to reduce the toolbar width. The
 *   grouped action trays collapse into the named Actions overflow trigger.
 * - The dividers are authored between those trays, so they move with the
 *   overflowed controls and appear between actions inside the overflow panel.
 */
export const OverflowMenuDividers: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Toolbar with overflow menu dividers">
    <ToolbarRegion position="start">
      <TooltrayNext overflowMode="none" role="group" aria-label="Search">
        <Input
          bordered
          startAdornment={<SearchIcon />}
          placeholder="Search"
          style={{ width: 180 }}
        />
      </TooltrayNext>
      <TooltrayNext overflowMode="none">
        <Dropdown bordered defaultSelected={["Option A"]} style={{ width: 160 }}>
          {options.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="end">
      <TooltrayNext
        overflowGroup="Actions"
        overflowLabel="Actions"
        overflowMode="grouped"
        overflowPriority={5}
      >
        <Button appearance="transparent">Columns</Button>
      </TooltrayNext>
      <Divider orientation="vertical" variant="secondary" />
      <TooltrayNext
        overflowGroup="Actions"
        overflowLabel="Actions"
        overflowMode="grouped"
        overflowPriority={5}
      >
        <Button appearance="transparent">
          <ExportIcon aria-hidden />
          Export
        </Button>
      </TooltrayNext>
      <Divider orientation="vertical" variant="secondary" />
      <TooltrayNext
        overflowGroup="Actions"
        overflowLabel="Actions"
        overflowMode="grouped"
        overflowPriority={5}
      >
        <Button appearance="solid">Run</Button>
      </TooltrayNext>
    </ToolbarRegion>
  </ToolbarNext>
);
OverflowMenuDividers.globals = {
  responsive: "wrap",
};

/**
 * Named overflow with preserved dividers and fixed quick actions.
 *
 * Collapse sequence (widest to narrowest):
 *
 * 1. Full width:
 *    `[Value] [Value v] [Value v] | [Decline Request] [Adjust Price]   Q @`
 *    The two quick-action icons live in an implicit end region, so they
 *    remain pinned at toolbar end.
 *
 * 2. Actions collapse first (grouped, priority 5):
 *    `[Value] [Value v] [Value v] | ACTIONS   Q @`
 *    "Decline Request" and "Adjust Price" disappear together into a
 *    labeled ACTIONS trigger. The divider between filters and actions
 *    is preserved because the ACTIONS trigger replaces the tray inline
 *    in the start region.
 *
 * 3. Trailing dropdown collapses into Filters (independent, priority 4):
 *    `[Value] [Value v] FILTERS | ACTIONS   Q @`
 *    The trailing filter dropdown overflows first. A FILTERS trigger
 *    appears in that dropdown's original slot, while the divider before
 *    ACTIONS remains attached to the actions position.
 *
 * 4. Leading dropdown also collapses into Filters (independent, priority 3):
 *    `[Value] FILTERS | ACTIONS   Q @`
 *    The last filter dropdown overflows, and the FILTERS trigger moves to
 *    the first hidden filter slot so it continues to replace the hidden
 *    subset inline.
 *
 * At every step:
 * - The first Value input (`overflowMode="none"`) never collapses.
 * - The search and settings icon buttons (`overflowMode="none"`) never
 *   collapse.
 * - Named triggers show only their label, not the overflow dots icon.
 * - The quick-action icons remain at toolbar end because they use
 *   `align="end"` in flat mode.
 * - Dividers stay attached to the surviving visual representation of the
 *   action group and disappear only when their slot has no visible
 *   replacement.
 */
export const NamedOverflowWithDividers: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Data entry toolbar with named overflow">
    <TooltrayNext overflowMode="none">
      <Input bordered placeholder="Value" style={{ width: 180 }} />
    </TooltrayNext>
    <TooltrayNext
      overflowGroup="Filters"
      overflowLabel="Filters"
      overflowMode="independent"
      overflowPriority={3}
    >
      <Dropdown bordered defaultSelected={["Option A"]} style={{ width: 160 }}>
        {options.map((option) => (
          <Option value={option} key={option} />
        ))}
      </Dropdown>
    </TooltrayNext>
    <TooltrayNext
      overflowGroup="Filters"
      overflowLabel="Filters"
      overflowMode="independent"
      overflowPriority={4}
    >
      <Dropdown bordered defaultSelected={["Option A"]} style={{ width: 160 }}>
        {options.map((option) => (
          <Option value={option} key={option} />
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
      <Button appearance="transparent" aria-label="Search">
        <SearchIcon aria-hidden />
      </Button>
      <Button appearance="transparent" aria-label="Settings">
        <SettingsIcon aria-hidden />
      </Button>
    </TooltrayNext>
  </ToolbarNext>
);
NamedOverflowWithDividers.globals = {
  responsive: "wrap",
};
