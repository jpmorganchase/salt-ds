import {
  Button,
  Checkbox,
  ComboBox,
  Divider,
  Dropdown,
  Input,
  Link,
  Option,
  RadioButton,
  RadioButtonGroup,
  Switch,
  Tag,
  Text,
  ToggleButton,
  ToggleButtonGroup,
  Toggletip,
  ToggletipPanel,
  ToggletipTrigger,
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
import {
  CurrencyIcon,
  ExportIcon,
  FilterIcon,
  GridIcon,
  HelpCircleIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
} from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Core/Toolbar",
  component: Toolbar,
  parameters: {
    layout: "padded",
  },
  subcomponents: {
    ToolbarContent,
    Tooltray,
  },
} as Meta<typeof Toolbar>;

const filterOptions = [
  "Filter: Option A",
  "Filter: Option B",
  "Filter: Option C",
];
const statusOptions = ["All", "New", "Working", "Fully Filled", "Cancelled"];
const toolbarVariants = ["primary", "secondary", "tertiary"] as const;

/**
 * Flat align sugar — no explicit `ToolbarContent` wrappers.
 *
 * Intended behavior:
 * - `Tooltray` children are bucketed into implicit content via their
 *   `align` prop (`"start"` by default, `"end"` for the actions and search
 *   trays).
 * - The toolbar renders a start content with the dropdown on the left, and an
 *   end content with icon buttons, a solid button, and the search input on the
 *   right.
 * - The trays use the default shared overflow behavior, so constrained width
 *   collapses content into the generic overflow trigger.
 */
export const FlatAlignSugar: StoryFn<typeof Toolbar> = () => (
  <Toolbar aria-label="Flat toolbar">
    <Tooltray>
      <Dropdown
        aria-label="Filter option"
        bordered
        defaultSelected={[filterOptions[0]]}
        style={{ width: 160 }}
      >
        {filterOptions.map((option) => (
          <Option value={option} key={option} />
        ))}
      </Dropdown>
    </Tooltray>
    <Tooltray align="end">
      <Button appearance="transparent" aria-label="Grid view">
        <GridIcon aria-hidden />
      </Button>
      <Button appearance="transparent" aria-label="List view">
        <ListIcon aria-hidden />
      </Button>
      <Button appearance="solid">Button</Button>
    </Tooltray>
    <Tooltray align="end">
      <Input
        bordered
        startAdornment={<SearchIcon aria-hidden />}
        placeholder="Search"
        style={{ width: 180 }}
      />
    </Tooltray>
  </Toolbar>
);
FlatAlignSugar.globals = {
  responsive: "wrap",
};

/**
 * Explicit three-content layout using `ToolbarContent`.
 *
 * Intended behavior:
 * - The toolbar uses explicit `ToolbarContent` wrappers with `position`
 *   set to `"start"`, `"center"`, and `"end"`.
 * - The start content holds descriptive text, the center content holds a
 *   toggle button group, and the end content holds the search input.
 * - The toggle button group should remain visually centered between the
 *   start and end content regardless of how much content is in each.
 * - Trays use the default shared overflow behavior, validating that the
 *   content-first authoring model also collapses responsively.
 */
export const ContentFirst: StoryFn<typeof Toolbar> = () => (
  <Toolbar aria-label="Content first toolbar">
    <ToolbarContent position="start">
      <Tooltray>
        <Text styleAs="label">Description</Text>
      </Tooltray>
    </ToolbarContent>
    <ToolbarContent position="center">
      <Tooltray>
        <ToggleButtonGroup aria-label="Toggle options">
          <ToggleButton value="toggle-1">Toggle</ToggleButton>
          <ToggleButton value="toggle-2">Toggle</ToggleButton>
          <ToggleButton value="toggle-3">Toggle</ToggleButton>
        </ToggleButtonGroup>
      </Tooltray>
    </ToolbarContent>
    <ToolbarContent position="end">
      <Tooltray>
        <Input
          bordered
          startAdornment={<SearchIcon aria-hidden />}
          placeholder="Search"
          style={{ width: 180 }}
        />
      </Tooltray>
    </ToolbarContent>
  </Toolbar>
);
ContentFirst.globals = {
  responsive: "wrap",
};

/**
 * Centered layout with a named inline overflow trigger in the end band.
 *
 * Intended behavior:
 * - As width decreases, the end-content actions collapse into an inline
 *   `Actions` trigger.
 * - Replacing the end tray with that trigger must not pull the center control
 *   off the toolbar midpoint.
 */
export const CenteredNamedOverflow: StoryFn<typeof Toolbar> = () => (
  <Toolbar
    aria-label="Centered named overflow toolbar"
    style={{ minWidth: "30vw" }}
  >
    <ToolbarContent position="start">
      <Tooltray overflowMode="none">
        <Button style={{ width: 140 }}>Start</Button>
      </Tooltray>
    </ToolbarContent>
    <ToolbarContent position="center">
      <Tooltray overflowMode="none">
        <Button style={{ width: 180 }}>Center action</Button>
      </Tooltray>
    </ToolbarContent>
    <ToolbarContent position="end">
      <Tooltray
        overflowGroup="Actions"
        overflowLabel="Actions"
        overflowMode="grouped"
        overflowPriority={5}
      >
        <Button appearance="transparent" style={{ width: 180 }}>
          End primary
        </Button>
        <Button appearance="transparent" style={{ width: 180 }}>
          End secondary
        </Button>
      </Tooltray>
    </ToolbarContent>
  </Toolbar>
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
 * - The two-content layout (start and end) still works; the filter aligns to
 *   the start edge, while utility actions and search align to the end edge.
 * - The trays still use default shared overflow, validating the transparent
 *   treatment with the generic trigger.
 */
export const Transparent: StoryFn<typeof Toolbar> = () => (
  <Toolbar appearance="transparent" aria-label="App header toolbar">
    <ToolbarContent position="start">
      <Tooltray>
        <Dropdown
          aria-label="Filter option"
          bordered
          defaultSelected={[filterOptions[0]]}
          style={{ width: 160 }}
        >
          {filterOptions.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
      </Tooltray>
    </ToolbarContent>
    <ToolbarContent position="end">
      <Tooltray>
        <Button appearance="transparent" aria-label="Grid view">
          <GridIcon aria-hidden />
        </Button>
        <Button appearance="transparent" aria-label="List view">
          <ListIcon aria-hidden />
        </Button>
        <Button appearance="solid">Button</Button>
      </Tooltray>
      <Tooltray>
        <Input
          bordered
          startAdornment={<SearchIcon aria-hidden />}
          placeholder="Search"
          style={{ width: 180 }}
        />
      </Tooltray>
    </ToolbarContent>
  </Toolbar>
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
export const Variants: StoryFn<typeof Toolbar> = () => (
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
        <Toolbar
          variant={variant}
          aria-label={`${variant} toolbar`}
          style={{ minWidth: "14vw" }}
        >
          <ToolbarContent position="start">
            <Tooltray>
              <Dropdown
                aria-label="Filter option"
                bordered
                defaultSelected={[filterOptions[0]]}
                style={{ width: 160 }}
              >
                {filterOptions.map((option) => (
                  <Option value={option} key={option} />
                ))}
              </Dropdown>
            </Tooltray>
          </ToolbarContent>
          <ToolbarContent position="end">
            <Tooltray>
              <Button appearance="transparent">Export</Button>
              <Button appearance="solid">Button</Button>
            </Tooltray>
            <Tooltray overflowMode="none">
              <Input
                bordered
                startAdornment={<SearchIcon aria-hidden />}
                placeholder="Search"
                style={{ width: 180 }}
              />
            </Tooltray>
          </ToolbarContent>
        </Toolbar>
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
 * - Demonstrates that `Tooltray` can hold arbitrary Salt form
 *   controls (Input, Dropdown, DatePicker, Switch, Button), not
 *   only buttons.
 * - The start content groups filtering criteria; the end content groups
 *   a toggle, a primary action, and the search input.
 * - The groups use default shared overflow, so non-button controls can collapse
 *   into the generic overflow menu.
 */
export const MixedFormControls: StoryFn<typeof Toolbar> = () => (
  <Toolbar aria-label="Mixed controls toolbar">
    <ToolbarContent position="start">
      <Tooltray>
        <Dropdown
          aria-label="Criteria option"
          bordered
          defaultSelected={[filterOptions[0]]}
          style={{ width: 160 }}
        >
          {filterOptions.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
        <Text styleAs="label">Settlement date</Text>
        <DatePicker selectionVariant="single">
          <DatePickerTrigger>
            <DatePickerSingleInput
              bordered
              aria-label="Settlement date"
              style={{ width: 180 }}
            />
          </DatePickerTrigger>
          <DatePickerOverlay>
            <DatePickerSingleGridPanel />
          </DatePickerOverlay>
        </DatePicker>
      </Tooltray>
    </ToolbarContent>
    <ToolbarContent position="end">
      <Tooltray>
        <Switch label="Pinned" />
        <Button appearance="solid" disabled focusableWhenDisabled>
          Run
        </Button>
      </Tooltray>
      <Tooltray>
        <Input
          bordered
          startAdornment={<SearchIcon aria-hidden />}
          placeholder="Search"
          style={{ width: 180 }}
        />
      </Tooltray>
    </ToolbarContent>
  </Toolbar>
);
MixedFormControls.globals = {
  responsive: "wrap",
};

/**
 * Multiselect combo box with pill selection in the toolbar.
 *
 * Intended behavior:
 * - A `ComboBox` with `multiselect` shows selected options as removable pills
 *   inside the field, which is a common filter pattern in data toolbars.
 * - `truncate` keeps the field at toolbar height when unfocused; it expands on
 *   focus or when the list is open so users can reach all pills.
 * - The status filter sits in the start band; utility actions and search stay
 *   on the end band.
 * - The filter tray uses default shared overflow so the combo box can collapse
 *   into the generic overflow trigger when width is constrained.
 */
export const MultiselectComboBoxPills: StoryFn<typeof Toolbar> = () => (
  <Toolbar aria-label="Toolbar with multiselect combo box">
    <ToolbarContent position="start">
      <Tooltray overflowPriority={4}>
        <ComboBox
          aria-label="Status filter"
          bordered
          defaultSelected={["New", "Working"]}
          multiselect
          truncate
          style={{ width: 260 }}
        >
          {statusOptions.map((option) => (
            <Option key={option} value={option} />
          ))}
        </ComboBox>
      </Tooltray>
    </ToolbarContent>
    <ToolbarContent position="end">
      <Tooltray align="end" overflowPriority={6}>
        <Button appearance="transparent">
          <ExportIcon aria-hidden />
          Export
        </Button>
        <Button appearance="transparent">
          <SettingsIcon aria-hidden />
          Settings
        </Button>
      </Tooltray>
      <Tooltray align="end" overflowMode="none">
        <Input
          bordered
          startAdornment={<SearchIcon aria-hidden />}
          placeholder="Search"
          style={{ width: 180 }}
        />
      </Tooltray>
    </ToolbarContent>
  </Toolbar>
);
MultiselectComboBoxPills.globals = {
  responsive: "wrap",
};

/**
 * Mixed Salt core controls with independent overflow.
 *
 * Intended behavior:
 * - Demonstrates that `Tooltray` can compose Tag, Checkbox,
 *   RadioButtonGroup/RadioButton, DatePicker, Toggletip, and Link.
 * - Each control is authored in an independent tray with a distinct overflow
 *   priority, so reducing width collapses them one by one.
 * - The varied control types provide a keyboard navigation surface across
 *   buttons, inputs, toggles, and links.
 */
export const IndependentMixedControls: StoryFn<typeof Toolbar> = () => (
  <Toolbar aria-label="Toolbar with independent mixed controls">
    <ToolbarContent position="start">
      <Tooltray overflowMode="independent" overflowPriority={1}>
        <Tag category={1} variant="primary">
          Draft
        </Tag>
      </Tooltray>
      <Tooltray overflowMode="independent" overflowPriority={2}>
        <Checkbox label="Show archived" />
      </Tooltray>
      <Tooltray overflowMode="independent" overflowPriority={3}>
        <Text styleAs="label">Due date</Text>
        <DatePicker selectionVariant="single">
          <DatePickerTrigger>
            <DatePickerSingleInput
              bordered
              aria-label="Due date"
              style={{ width: 150 }}
            />
          </DatePickerTrigger>
          <DatePickerOverlay>
            <DatePickerSingleGridPanel />
          </DatePickerOverlay>
        </DatePicker>
      </Tooltray>
      <Tooltray overflowMode="independent" overflowPriority={4}>
        <RadioButtonGroup
          aria-label="Review mode"
          direction="horizontal"
          defaultValue="review"
        >
          <RadioButton label="Review" value="review" />
          <RadioButton label="Approve" value="approve" />
        </RadioButtonGroup>
      </Tooltray>
    </ToolbarContent>
    <ToolbarContent position="end">
      <Tooltray overflowMode="independent" overflowPriority={5}>
        <Toggletip placement="bottom">
          <ToggletipTrigger aria-label="Review mode help">
            <HelpCircleIcon aria-hidden />
          </ToggletipTrigger>
          <ToggletipPanel>
            <Text>
              Use review mode to compare pending changes before approval.{" "}
              <Link href="#">Read guidelines</Link>
            </Text>
          </ToggletipPanel>
        </Toggletip>
      </Tooltray>
      <Tooltray overflowMode="independent" overflowPriority={6}>
        <Link href="#">View audit trail</Link>
      </Tooltray>
    </ToolbarContent>
  </Toolbar>
);
IndependentMixedControls.globals = {
  responsive: "wrap",
};

/**
 * Right-to-left layout without overflow.
 *
 * Intended behavior:
 * - The wrapping `div` sets `dir="rtl"`, reversing the inline direction
 *   of the entire toolbar.
 * - The start-aligned actions tray should appear on the right; the
 *   end-aligned search and filter tray should appear on the left.
 * - The groups use default shared overflow, validating the generic trigger
 *   under RTL.
 */
export const RightToLeft: StoryFn<typeof Toolbar> = () => (
  <div dir="rtl">
    <Toolbar aria-label="RTL toolbar">
      <Tooltray>
        <Button appearance="transparent" aria-label="Grid view">
          <GridIcon aria-hidden />
        </Button>
        <Button appearance="transparent" aria-label="List view">
          <ListIcon aria-hidden />
        </Button>
        <Button appearance="solid">Button</Button>
      </Tooltray>
      <Tooltray align="end">
        <Dropdown
          aria-label="Filter option"
          bordered
          defaultSelected={[filterOptions[0]]}
          style={{ width: 160 }}
        >
          {filterOptions.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
        <Input
          bordered
          startAdornment={<SearchIcon aria-hidden />}
          placeholder="Search"
          style={{ width: 180 }}
        />
      </Tooltray>
    </Toolbar>
  </div>
);
RightToLeft.globals = {
  responsive: "wrap",
};

/**
 * Default shared overflow — omitted overflowMode collapses into the generic trigger.
 *
 * Intended behavior:
 * - The dropdown/filters tray (priority 4) and the actions tray
 *   (priority 6) omit `overflowMode`, so both use the default shared overflow.
 * - As the toolbar narrows, the highest-priority tray (actions,
 *   priority 6) should overflow first, followed by the filters tray
 *   (priority 4). They collapse one at a time, not all at once.
 * - A single shared overflow trigger (ellipsis icon, no label) appears
 *   at the trailing edge once any tray has overflowed.
 * - Dividers between trays should disappear when their adjacent tray
 *   overflows, rather than remaining as orphaned separators.
 * - The search tray has `overflowMode="none"` and is authored at the end of
 *   the toolbar. It remains visible at all widths.
 * - The overflow surface should present overflowed trays horizontally
 *   with toolbar-like spacing, not as a vertical menu.
 * - Use the Storybook responsive wrapper (wrap/unwrap toggle) to
 *   resize and observe the progressive collapse.
 */
export const DefaultSharedOverflow: StoryFn<typeof Toolbar> = () => (
  <Toolbar
    aria-label="Toolbar with shared overflow"
    style={{ minWidth: "14vw" }}
  >
    <Tooltray overflowPriority={4}>
      <Dropdown
        aria-label="Filter option"
        bordered
        defaultSelected={[filterOptions[0]]}
        style={{ width: 160 }}
      >
        {filterOptions.map((option) => (
          <Option value={option} key={option} />
        ))}
      </Dropdown>
      <Button appearance="transparent">
        <FilterIcon aria-hidden />
        Filters
      </Button>
    </Tooltray>
    <Tooltray align="end" overflowPriority={6}>
      <Button appearance="transparent">
        <ExportIcon aria-hidden />
        Export
      </Button>
      <Button appearance="transparent">
        <SettingsIcon aria-hidden />
        Settings
      </Button>
    </Tooltray>
    <Tooltray align="end" overflowMode="none">
      <Input
        bordered
        startAdornment={<SearchIcon aria-hidden />}
        placeholder="Search"
        style={{ width: 180 }}
      />
    </Tooltray>
  </Toolbar>
);
DefaultSharedOverflow.globals = {
  responsive: "wrap",
};

/**
 * Named overflow — grouped collapse into distinct named overflow triggers.
 *
 * Intended behavior:
 * - Uses explicit `ToolbarContent` wrappers (start and end).
 * - The "Filters" tray (start content, priority 6, `overflowGroup="Filters"`,
 *   `overflowMode="grouped"`) collapses as a complete unit into its own
 *   overflow trigger labeled "Filters".
 * - The "Actions" tray (end content, priority 5, `overflowGroup="Actions"`,
 *   `overflowMode="grouped"`) collapses as a complete unit into its own
 *   overflow trigger labeled "Actions".
 * - Because "Filters" has higher priority (6) than "Actions" (5), the
 *   Filters tray should overflow first.
 * - Both triggers should be visually distinct through their label-only
 *   treatment, so users can tell them apart without relying on a shared
 *   overflow icon.
 * - Each named trigger replaces its collapsed tray inline within its own
 *   content rather than jumping to the end of the toolbar.
 * - Clicking a named trigger opens a panel showing that group's controls
 *   in a horizontal toolbar-like layout.
 * - Escape closes the panel and returns focus to the trigger.
 * - The search tray (`overflowMode="none"`) is the final toolbar control and
 *   never collapses.
 */
export const NamedOverflow: StoryFn<typeof Toolbar> = () => (
  <Toolbar
    aria-label="Toolbar with named overflow"
    style={{ minWidth: "20vw" }}
  >
    <ToolbarContent position="start">
      <Tooltray
        overflowGroup="Filters"
        overflowLabel="Filters"
        overflowMode="grouped"
        overflowPriority={6}
      >
        <Dropdown
          aria-label="Filter option"
          bordered
          defaultSelected={[filterOptions[0]]}
          style={{ width: 160 }}
        >
          {filterOptions.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
        <Button appearance="transparent">
          <FilterIcon aria-hidden />
          Filters
        </Button>
      </Tooltray>
    </ToolbarContent>
    <ToolbarContent position="end">
      <Tooltray
        overflowGroup="Actions"
        overflowLabel="Actions"
        overflowMode="grouped"
        overflowPriority={5}
      >
        <Button appearance="transparent">
          <ExportIcon aria-hidden />
          Export
        </Button>
        <Button appearance="transparent">
          <SettingsIcon aria-hidden />
          Settings
        </Button>
      </Tooltray>
      <Tooltray overflowMode="none">
        <Input
          bordered
          startAdornment={<SearchIcon aria-hidden />}
          placeholder="Search"
          style={{ width: 180 }}
        />
      </Tooltray>
    </ToolbarContent>
  </Toolbar>
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
export const OverflowPriorities: StoryFn<typeof Toolbar> = () => (
  <Toolbar aria-label="Toolbar with overflow priorities">
    <Tooltray overflowMode="independent" overflowPriority={1}>
      <Button appearance="transparent">Pinned</Button>
    </Tooltray>
    <Tooltray overflowMode="independent" overflowPriority={1}>
      <Button appearance="transparent">Views</Button>
    </Tooltray>
    <Tooltray overflowMode="independent" overflowPriority={3}>
      <Button appearance="transparent">Status</Button>
    </Tooltray>
    <Tooltray align="end" overflowMode="independent" overflowPriority={5}>
      <Button appearance="transparent">
        <ExportIcon aria-hidden />
        Export
      </Button>
    </Tooltray>
  </Toolbar>
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
 * - The search input remains visible at the toolbar end.
 * - Use the Storybook responsive wrapper to reduce the toolbar width. The
 *   grouped action trays collapse into the named Actions overflow trigger.
 * - The dividers are authored between those trays, so they move with the
 *   overflowed controls and appear between actions inside the overflow panel.
 */
export const OverflowMenuDividers: StoryFn<typeof Toolbar> = () => (
  <Toolbar
    aria-label="Toolbar with overflow menu dividers"
    style={{ minWidth: "26vw" }}
  >
    <ToolbarContent position="start">
      <Tooltray overflowMode="none">
        <Dropdown
          aria-label="Filter option"
          bordered
          defaultSelected={[filterOptions[0]]}
          style={{ width: 160 }}
        >
          {filterOptions.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
      </Tooltray>
    </ToolbarContent>
    <ToolbarContent position="end">
      <Tooltray
        overflowGroup="Actions"
        overflowLabel="Actions"
        overflowMode="grouped"
        overflowPriority={5}
      >
        <Button appearance="transparent">Columns</Button>
      </Tooltray>
      <Divider aria-hidden orientation="vertical" variant="secondary" />
      <Tooltray
        overflowGroup="Actions"
        overflowLabel="Actions"
        overflowMode="grouped"
        overflowPriority={5}
      >
        <Button appearance="transparent">
          <ExportIcon aria-hidden />
          Export
        </Button>
      </Tooltray>
      <Divider aria-hidden orientation="vertical" variant="secondary" />
      <Tooltray
        overflowGroup="Actions"
        overflowLabel="Actions"
        overflowMode="grouped"
        overflowPriority={5}
      >
        <Button appearance="solid">Run</Button>
      </Tooltray>
      <Tooltray overflowMode="none">
        <Input
          bordered
          startAdornment={<SearchIcon aria-hidden />}
          placeholder="Search"
          style={{ width: 180 }}
        />
      </Tooltray>
    </ToolbarContent>
  </Toolbar>
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
 *    `[Value v] [Value v] | [Decline Request] [Adjust Price]   Q @ [Value]`
 *    The two quick-action icons live in an implicit end content before the
 *    trailing Value input.
 *
 * 2. Actions collapse first (grouped, priority 5):
 *    `[Value v] [Value v] | ACTIONS   Q @ [Value]`
 *    "Decline Request" and "Adjust Price" disappear together into a
 *    labeled ACTIONS trigger. The divider between filters and actions
 *    is preserved because the ACTIONS trigger replaces the tray inline
 *    in the start content.
 *
 * 3. Trailing dropdown collapses into Filters (independent, priority 4):
 *    `[Value v] FILTERS | ACTIONS   Q @ [Value]`
 *    The trailing filter dropdown overflows first. A FILTERS trigger
 *    appears in that dropdown's original slot, while the divider before
 *    ACTIONS remains attached to the actions position.
 *
 * 4. Leading dropdown also collapses into Filters (independent, priority 3):
 *    `FILTERS | ACTIONS   Q @ [Value]`
 *    The last filter dropdown overflows, and the FILTERS trigger moves to
 *    the first hidden filter slot so it continues to replace the hidden
 *    subset inline.
 *
 * At every step:
 * - The trailing Value input (`overflowMode="none"`) never collapses.
 * - The search and settings icon buttons (`overflowMode="none"`) never
 *   collapse.
 * - Named triggers show only their label, not the overflow dots icon.
 * - The quick-action icons remain near toolbar end because they use
 *   `align="end"` in flat mode, while the Value input is the final
 *   toolbar control.
 * - Dividers stay attached to the surviving visual representation of the
 *   action group and disappear only when their slot has no visible
 *   replacement.
 */
export const NamedOverflowWithDividers: StoryFn<typeof Toolbar> = () => (
  <Toolbar
    aria-label="Data entry toolbar with named overflow"
    style={{ minWidth: "25vw" }}
  >
    <Tooltray
      overflowGroup="Filters"
      overflowLabel="Filters"
      overflowMode="independent"
      overflowPriority={3}
    >
      <Text styleAs="label">Primary filter</Text>
      <Dropdown
        aria-label="Primary filter"
        bordered
        defaultSelected={[filterOptions[0]]}
        style={{ width: 160 }}
      >
        {filterOptions.map((option) => (
          <Option value={option} key={option} />
        ))}
      </Dropdown>
    </Tooltray>
    <Tooltray
      overflowGroup="Filters"
      overflowLabel="Filters"
      overflowMode="independent"
      overflowPriority={4}
    >
      <Text styleAs="label">Secondary filter</Text>
      <Dropdown
        aria-label="Secondary filter"
        bordered
        defaultSelected={[filterOptions[0]]}
        style={{ width: 160 }}
      >
        {filterOptions.map((option) => (
          <Option value={option} key={option} />
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
      <Button appearance="transparent" aria-label="Search">
        <SearchIcon aria-hidden />
      </Button>
      <Button appearance="transparent" aria-label="Settings">
        <SettingsIcon aria-hidden />
      </Button>
    </Tooltray>
    <Tooltray align="end" overflowMode="none">
      <Input
        bordered
        startAdornment={<CurrencyIcon aria-hidden />}
        placeholder="Enter price"
        style={{ width: 180 }}
      />
    </Tooltray>
  </Toolbar>
);
NamedOverflowWithDividers.globals = {
  responsive: "wrap",
};
