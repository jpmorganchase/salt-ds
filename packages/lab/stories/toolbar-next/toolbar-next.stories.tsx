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
import {
  ExportIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
} from "@salt-ds/icons";
import {
  DateInputSingle,
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleGridPanel,
  DatePickerSingleInput,
  DatePickerTrigger,
  ToolbarNext,
  ToolbarRegion,
  TooltrayNext,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Lab/Toolbar Next",
  component: ToolbarNext,
  includeStories: [
    "FlatAlignSugar",
    "RegionFirst",
    "MixedFormControls",
    "CenteredNamedOverflow",
    "Variants",
    "Transparent",
    "RightToLeft",
    "DefaultSharedOverflow",
    "NamedOverflow",
  ],
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
const deskOptions = ["All desks", "Rates", "Credit", "Equities"];
const exceptionRows = [
  ["FX-4120", "Morgan Stanley", "Missing allocation"],
  ["EQ-8091", "BlackRock", "Limit override"],
  ["CR-1174", "Goldman Sachs", "Price tolerance"],
];

const clippingValidationShellStyle = {
  maxWidth: 680,
};

const clippingValidationCardStyle = {
  background: "var(--salt-container-primary-background)",
  border:
    "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
  borderRadius: "var(--salt-palette-corner, 0)",
  boxShadow: "var(--salt-overlayable-shadow-popout)",
  display: "flex" as const,
  flexDirection: "column" as const,
  height: 260,
  overflow: "hidden" as const,
};

const clippingValidationHeaderStyle = {
  borderBottom:
    "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
  padding: "var(--salt-spacing-200)",
};

const clippingValidationBodyStyle = {
  display: "flex" as const,
  flex: 1,
  flexDirection: "column" as const,
  gap: "var(--salt-spacing-100)",
  minHeight: 0,
  overflow: "hidden" as const,
  padding: "var(--salt-spacing-200)",
};

const clippingValidationRowStyle = {
  alignItems: "center",
  background: "var(--salt-container-secondary-background)",
  border:
    "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
  display: "grid" as const,
  gap: "var(--salt-spacing-100)",
  gridTemplateColumns: "80px minmax(0, 1fr) minmax(0, 1.4fr)",
  padding: "var(--salt-spacing-100) var(--salt-spacing-150)",
};

const clippingValidationToolbarDockStyle = {
  background: "var(--salt-container-secondary-background)",
  borderTop:
    "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
  padding: "var(--salt-spacing-100)",
};

const clippingValidationNoteStyle = {
  marginTop: "var(--salt-spacing-200)",
};

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
      <Dropdown bordered defaultSelected={["Option A"]}>
        {options.map((option) => (
          <Option value={option} key={option} />
        ))}
      </Dropdown>
    </TooltrayNext>
    <TooltrayNext role="group" aria-label="Search and filter">
      <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
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
 * Flat layout with vertical dividers separating logical groups.
 *
 * Intended behavior:
 * - Dividers sit between tooltray groups and visually separate search/filter
 *   controls from descriptive text and from end-aligned actions.
 * - Dividers are attached to adjacent trays in the internal model, so they
 *   do not become standalone overflow items. If a tray overflows, its
 *   adjacent divider should disappear with it.
 * - No overflow is configured here, so the toolbar is purely structural.
 *   All four tooltray groups plus two dividers remain visible at any width.
 */
export const FlatWithDividers: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Toolbar with dividers">
    <TooltrayNext role="group" aria-label="Search and filter">
      <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
      <Dropdown bordered defaultSelected={["Option A"]}>
        {options.map((option) => (
          <Option value={option} key={option} />
        ))}
      </Dropdown>
    </TooltrayNext>
    <Divider orientation="vertical" variant="secondary" />
    <TooltrayNext>
      <Text>Description</Text>
    </TooltrayNext>
    <TooltrayNext align="end">
      <Dropdown bordered defaultSelected={["Option A"]}>
        {options.map((option) => (
          <Option value={option} key={option} />
        ))}
      </Dropdown>
    </TooltrayNext>
    <Divider orientation="vertical" variant="secondary" />
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

/**
 * Custom spacing between tooltray groups using inline margin overrides.
 *
 * Intended behavior:
 * - The `marginRight` on the first and third trays creates wider visual
 *   gaps between groups without adding dividers. This demonstrates that
 *   consumers can use style overrides for custom spacing.
 * - No overflow is configured; the toolbar is structural only. Controls
 *   remain visible at any width.
 */
export const Spacing300Groups: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Toolbar with dividers">
    <TooltrayNext
      role="group"
      aria-label="Search and filter"
      style={{ marginRight: "var(--salt-spacing-300)" }}
    >
      <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
      <Dropdown bordered defaultSelected={["Option A"]}>
        {options.map((option) => (
          <Option value={option} key={option} />
        ))}
      </Dropdown>
    </TooltrayNext>
    <TooltrayNext>
      <Text>Description</Text>
    </TooltrayNext>
    <TooltrayNext
      align="end"
      style={{ marginRight: "var(--salt-spacing-300)" }}
    >
      <Dropdown bordered defaultSelected={["Option A"]}>
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
);

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
        <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
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
 * Form controls arranged across explicit start, center, and end regions.
 *
 * Intended behavior:
 * - The start region contains a bordered text input that can collapse into a
 *   named inline overflow trigger.
 * - The center region contains a toggle button group that should remain on the
 *   toolbar midpoint and never overflow.
 * - The end region contains a single-date picker composed from `DatePicker`
 *   primitives and can also collapse into a named inline overflow trigger.
 * - This demonstrates a centered layout where side form controls yield space
 *   responsively without pulling the middle toggle group off center.
 */
export const CenteredFormControls: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Toolbar with centered toggle group">
    <ToolbarRegion position="start">
      <TooltrayNext
        role="group"
        aria-label="Search"
        overflowGroup="Search"
        overflowLabel="Search"
        overflowMode="grouped"
        overflowPriority={4}
      >
        <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="center">
      <TooltrayNext role="group" aria-label="View toggle" overflowMode="none">
        <ToggleButtonGroup defaultValue="all">
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="active">Active</ToggleButton>
          <ToggleButton value="archived">Archived</ToggleButton>
        </ToggleButtonGroup>
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="end">
      <TooltrayNext
        role="group"
        aria-label="Date"
        overflowGroup="Date"
        overflowLabel="Date"
        overflowMode="grouped"
        overflowPriority={5}
      >
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
  </ToolbarNext>
);
CenteredFormControls.globals = {
  responsive: "wrap",
};

/**
 * Symmetric side widths with a truly centered middle control.
 *
 * Intended behavior:
 * - The start and end regions have equal visual weight.
 * - The center control should sit on the actual toolbar midpoint.
 * - This is the baseline centering case: if this story is off-center, the
 *   root band layout is incorrect.
 */
export const CenteredSymmetric: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Centered symmetric toolbar">
    <ToolbarRegion position="start">
      <TooltrayNext role="group" aria-label="Leading">
        <Button style={{ width: 120 }}>Start</Button>
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="center">
      <TooltrayNext role="group" aria-label="Centered">
        <Button style={{ width: 140 }}>Center action</Button>
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="end">
      <TooltrayNext role="group" aria-label="Actions">
        <Button style={{ width: 120 }}>End</Button>
      </TooltrayNext>
    </ToolbarRegion>
  </ToolbarNext>
);

/**
 * Asymmetric side widths with the center still pinned to the midpoint.
 *
 * Intended behavior:
 * - The start region is materially wider than the end region.
 * - The center control should still remain at the toolbar midpoint rather than
 *   drifting toward the lighter side.
 */
export const CenteredAsymmetric: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Centered asymmetric toolbar">
    <ToolbarRegion position="start">
      <TooltrayNext role="group" aria-label="Leading">
        <Button style={{ width: 220 }}>Long start action</Button>
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="center">
      <TooltrayNext role="group" aria-label="Centered">
        <Button style={{ width: 140 }}>Center action</Button>
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="end">
      <TooltrayNext role="group" aria-label="Actions">
        <Button style={{ width: 80 }}>End</Button>
      </TooltrayNext>
    </ToolbarRegion>
  </ToolbarNext>
);

/**
 * Center plus end only, with no authored start content.
 *
 * Intended behavior:
 * - The center control should still remain on the toolbar midpoint.
 * - The empty start band is intentionally part of the contract when a toolbar
 *   opts into centered layout.
 * - This may trigger overflow earlier than a packed start/end layout because
 *   the component reserves symmetric side space to protect the center.
 */
export const CenteredEndOnly: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Centered end-only toolbar">
    <ToolbarRegion position="center">
      <TooltrayNext role="group" aria-label="Centered">
        <Button style={{ width: 140 }}>Center action</Button>
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="end">
      <TooltrayNext role="group" aria-label="Actions">
        <Button style={{ width: 180 }}>End primary</Button>
      </TooltrayNext>
    </ToolbarRegion>
  </ToolbarNext>
);

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
        <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
        <Dropdown bordered defaultSelected={["Option A"]}>
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
            <TooltrayNext role="group" aria-label="Search and filter">
              <Input
                bordered
                startAdornment={<SearchIcon />}
                placeholder="Search"
              />
              <Dropdown bordered defaultSelected={["Option A"]}>
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
 * Data view toolbar with explicit regions and mixed tray types.
 *
 * Intended behavior:
 * - The start region contains a search/filter group separated by a
 *   divider from a description text tray. The end region contains a
 *   dropdown tray separated by a divider from an actions group.
 * - This validates that dividers work correctly inside explicit
 *   `ToolbarRegion` wrappers, not just in flat mode.
 * - No overflow is configured. All controls remain visible.
 */
export const DataViewActions: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Data view toolbar">
    <ToolbarRegion position="start">
      <TooltrayNext role="group" aria-label="Search and filter">
        <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
        <Dropdown bordered defaultSelected={["Option A"]}>
          {options.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
      <Divider orientation="vertical" variant="secondary" />
      <TooltrayNext>
        <Text>Description</Text>
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="end">
      <TooltrayNext>
        <Dropdown bordered defaultSelected={["Option A"]}>
          {options.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
      <Divider orientation="vertical" variant="secondary" />
      <TooltrayNext role="group" aria-label="Actions">
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
      <TooltrayNext role="group" aria-label="Criteria">
        <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
        <Dropdown bordered defaultSelected={["Option A"]}>
          {options.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
        <DateInputSingle bordered ariaLabel="Settlement date" />
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
        <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
        <Dropdown bordered defaultSelected={["Option A"]}>
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
      <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
    </TooltrayNext>
    <TooltrayNext overflowPriority={4}>
      <Dropdown bordered defaultSelected={["Option A"]}>
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
        <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
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
        <Dropdown bordered defaultSelected={["Option A"]}>
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
 * Divider behavior during overflow.
 *
 * Intended behavior:
 * - The search tray (`overflowMode="none"`) is separated from a
 *   "Description" tray (priority 5) by a divider, and the Description
 *   tray is separated from a "Secondary" tray (priority 6) by another
 *   divider.
 * - When "Secondary" (priority 6) overflows first, its leading divider
 *   should also disappear, because dividers are attached to adjacent
 *   trays rather than existing independently.
 * - When "Description" (priority 5) subsequently overflows, the
 *   remaining divider between search and description should also
 *   disappear.
 * - The search tray should never overflow and should remain as the
 *   last visible control with no orphaned dividers.
 */
export const OverflowDividers: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Toolbar with divider overflow">
    <TooltrayNext role="group" aria-label="Search" overflowMode="none">
      <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
    </TooltrayNext>
    <Divider orientation="vertical" variant="secondary" />
    <TooltrayNext overflowMode="independent" overflowPriority={5}>
      <Text>Description</Text>
    </TooltrayNext>
    <Divider orientation="vertical" variant="secondary" />
    <TooltrayNext overflowMode="independent" overflowPriority={6}>
      <Button appearance="transparent">Secondary</Button>
    </TooltrayNext>
  </ToolbarNext>
);
OverflowDividers.globals = {
  responsive: "wrap",
};

/**
 * Transparent appearance with named grouped overflow.
 *
 * Intended behavior:
 * - Combines `appearance="transparent"` (no border, no padding) with
 *   overflow behavior, validating that the overflow trigger and panel
 *   render correctly without the bordered toolbar frame.
 * - The search tray in the start region never collapses.
 * - The "Actions" tray in the end region uses `overflowMode="grouped"`
 *   with `overflowGroup="Actions"`, so it collapses as a unit into a
 *   labeled "Actions" overflow trigger when the toolbar becomes too
 *   narrow.
 * - Because it is a named overflow, the trigger remains in the end
 *   region at the collapsed tray's origin position.
 * - The overflow trigger and panel should inherit the transparent
 *   toolbar's visual context; the panel itself still uses menu-like
 *   styling with its own border and shadow.
 */
export const TransparentOverflow: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext
    appearance="transparent"
    aria-label="Transparent toolbar with overflow"
  >
    <ToolbarRegion position="start">
      <TooltrayNext role="group" aria-label="Search" overflowMode="none">
        <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
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
TransparentOverflow.globals = {
  responsive: "wrap",
};

/**
 * Right-to-left layout with named grouped overflow.
 *
 * Intended behavior:
 * - The wrapping `div` sets `dir="rtl"`, reversing the inline direction.
 * - The search tray (start-aligned, `overflowMode="none"`) should appear
 *   on the right side of the toolbar in RTL and never collapse.
 * - The "Actions" tray (end-aligned, `overflowMode="grouped"`,
 *   `overflowGroup="Actions"`) should appear on the left in RTL.
 * - When the toolbar narrows, the Actions tray collapses into a labeled
 *   "Actions" overflow trigger on the left (inline-end in RTL), where it
 *   replaces the tray within the end region rather than moving elsewhere.
 * - The overflow panel should open in the correct direction for RTL and
 *   display its contents with mirrored alignment.
 * - Escape closes the panel and returns focus to the trigger, just as
 *   in LTR mode.
 */
export const OverflowRightToLeft: StoryFn<typeof ToolbarNext> = () => (
  <div dir="rtl">
    <ToolbarNext aria-label="RTL overflow toolbar">
      <TooltrayNext role="group" aria-label="Search" overflowMode="none">
        <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
      </TooltrayNext>
      <TooltrayNext
        align="end"
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
    </ToolbarNext>
  </div>
);
OverflowRightToLeft.globals = {
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
      <Dropdown bordered defaultSelected={["Option A"]}>
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

/**
 * Overflow panel clipping validation in a realistic bounded container.
 *
 * Intended behavior:
 * - The toolbar is docked at the bottom of a compact review-queue card whose
 *   container uses `overflow: hidden`, like many dashboard cards and modals.
 * - The available width intentionally collapses the end-region actions into a
 *   named `Actions` overflow trigger.
 * - Open the Actions trigger. The overflow panel should float outside the card
 *   and remain fully visible over the note below instead of being clipped by
 *   the card boundary.
 * - This validates that the overflow surface is portalled and positioned by
 *   Floating UI rather than being rendered inside the clipped toolbar context.
 */
export const OverflowMenuInClippingContainer: StoryFn<
  typeof ToolbarNext
> = () => (
  <div style={clippingValidationShellStyle}>
    <div style={clippingValidationCardStyle}>
      <div style={clippingValidationHeaderStyle}>
        <Text>
          <strong>Trade exception review</strong>
        </Text>
        <Text>Resolve exceptions before the desk closes the batch.</Text>
      </div>
      <div style={clippingValidationBodyStyle}>
        {exceptionRows.map(([id, client, exception]) => (
          <div style={clippingValidationRowStyle} key={id}>
            <Text>{id}</Text>
            <Text>{client}</Text>
            <Text>{exception}</Text>
          </div>
        ))}
      </div>
      <div style={clippingValidationToolbarDockStyle}>
        <ToolbarNext
          appearance="transparent"
          aria-label="Trade exception review toolbar"
        >
          <ToolbarRegion position="start">
            <TooltrayNext overflowMode="none" role="group" aria-label="Search">
              <Input
                bordered
                placeholder="Search exceptions"
                startAdornment={<SearchIcon />}
                style={{ width: 180 }}
              />
            </TooltrayNext>
            <TooltrayNext
              overflowGroup="Filters"
              overflowLabel="Filters"
              overflowMode="independent"
              overflowPriority={3}
            >
              <Dropdown
                bordered
                defaultSelected={["All desks"]}
                style={{ width: 140 }}
              >
                {deskOptions.map((option) => (
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
              <Button appearance="transparent">
                <FilterIcon aria-hidden />
                Status
              </Button>
            </TooltrayNext>
          </ToolbarRegion>
          <ToolbarRegion position="end">
            <TooltrayNext
              aria-label="Review actions"
              overflowGroup="Actions"
              overflowLabel="Actions"
              overflowMode="grouped"
              overflowPriority={6}
              role="group"
            >
              <Button appearance="transparent">
                <ExportIcon aria-hidden />
                Export
              </Button>
              <Button appearance="transparent">Reassign</Button>
              <Button appearance="solid">Approve</Button>
            </TooltrayNext>
            <TooltrayNext
              overflowMode="none"
              role="group"
              aria-label="Toolbar settings"
            >
              <Button appearance="transparent" aria-label="Toolbar settings">
                <SettingsIcon aria-hidden />
              </Button>
            </TooltrayNext>
          </ToolbarRegion>
        </ToolbarNext>
      </div>
    </div>
    <Text style={clippingValidationNoteStyle}>
      Open the Actions menu from the toolbar footer. The panel should render
      over this note instead of disappearing behind the clipped card edge.
    </Text>
  </div>
);
OverflowMenuInClippingContainer.globals = {
  responsive: "wrap",
};
