import {
  Button,
  Dropdown,
  Input,
  Option,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { SearchIcon } from "@salt-ds/icons";
import { ToolbarContent, ToolbarNext, TooltrayNext } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";

export default {
  title: "Lab/Toolbar Next/Overflow Modes",
  component: ToolbarNext,
  includeStories: [
    "NamedOverflowModesComparison",
    "PriorityOrderingComparison",
  ],
  parameters: {
    layout: "padded",
  },
  subcomponents: {
    ToolbarContent,
    TooltrayNext,
  },
} as Meta<typeof ToolbarNext>;

const options = ["Option A", "Option B", "Option C"];

const wrapGlobals = {
  responsive: "wrap",
};

const noteStyle = {
  background: "var(--salt-container-secondary-background)",
  border:
    "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
  borderRadius: "var(--salt-palette-corner, 0)",
  padding: "var(--salt-spacing-200)",
};

const listStyle = {
  margin: 0,
  paddingInlineStart: "var(--salt-spacing-300)",
};

const comparisonGridStyle = {
  display: "flex" as const,
  flexDirection: "column" as const,
  gap: "var(--salt-spacing-300)",
};

const comparisonCardStyle = {
  background: "var(--salt-container-primary-background)",
  border:
    "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
  borderRadius: "var(--salt-palette-corner, 0)",
  padding: "var(--salt-spacing-200)",
};

interface StoryExampleProps {
  children: ReactNode;
  codeRelation: string[];
  expectedBehavior: string[];
  title: string;
}

function StoryExample({
  children,
  codeRelation,
  expectedBehavior,
  title,
}: StoryExampleProps) {
  return (
    <StackLayout gap={1.5} style={{ maxWidth: 960 }}>
      <Text>
        <strong>{title}</strong>
      </Text>
      {children}
      <div style={noteStyle}>
        <StackLayout gap={1}>
          <Text>
            <strong>Expected behavior</strong>
          </Text>
          <ul style={listStyle}>
            {expectedBehavior.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
          <Text>
            <strong>How this relates to the code</strong>
          </Text>
          <ul style={listStyle}>
            {codeRelation.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
        </StackLayout>
      </div>
    </StackLayout>
  );
}

function ComparisonLabel({ children }: { children: ReactNode }) {
  return (
    <Text>
      <strong>{children}</strong>
    </Text>
  );
}

function SingleTrayToolbar({
  overflowMode,
}: {
  overflowMode: "independent" | "grouped";
}) {
  return (
    <ToolbarNext aria-label={`${overflowMode} single-tray overflow toolbar`}>
      <TooltrayNext overflowMode="none">
        <Input
          bordered
          startAdornment={<SearchIcon aria-hidden />}
          placeholder="Search"
        />
      </TooltrayNext>
      <TooltrayNext
        align="end"
        aria-label="Actions"
        overflowGroup="Actions"
        overflowLabel="Actions"
        overflowMode={overflowMode}
        overflowPriority={5}
        role="group"
      >
        <Button appearance="transparent">Export</Button>
        <Button appearance="transparent">Settings</Button>
        <Button appearance="solid">Run</Button>
      </TooltrayNext>
    </ToolbarNext>
  );
}

function SharedToolbar({
  overflowMode,
}: {
  overflowMode: "independent" | "grouped";
}) {
  return (
    <ToolbarNext aria-label={`${overflowMode} shared overflow toolbar`}>
      <TooltrayNext overflowMode="none">
        <Input
          bordered
          startAdornment={<SearchIcon aria-hidden />}
          placeholder="Search"
        />
      </TooltrayNext>
      <TooltrayNext overflowMode={overflowMode} overflowPriority={2}>
        <Button appearance="transparent">Columns</Button>
      </TooltrayNext>
      <TooltrayNext overflowMode={overflowMode} overflowPriority={4}>
        <Dropdown
          aria-label="Filter option"
          bordered
          defaultSelected={["Option A"]}
        >
          {options.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
      <TooltrayNext
        align="end"
        overflowMode={overflowMode}
        overflowPriority={6}
        role="group"
        aria-label="Actions"
      >
        <Button appearance="transparent">Export</Button>
      </TooltrayNext>
    </ToolbarNext>
  );
}

function NamedFiltersToolbar({
  overflowMode,
}: {
  overflowMode: "independent" | "grouped";
}) {
  return (
    <ToolbarNext aria-label={`${overflowMode} named filters toolbar`}>
      <ToolbarContent position="start">
        <TooltrayNext overflowMode="none">
          <Input
            bordered
            startAdornment={<SearchIcon aria-hidden />}
            placeholder="Search"
          />
        </TooltrayNext>
        <TooltrayNext
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode={overflowMode}
          overflowPriority={3}
          role="group"
          aria-label="Primary filters"
        >
          <Dropdown
            aria-label="Primary filter"
            bordered
            defaultSelected={["Option A"]}
          >
            {options.map((option) => (
              <Option value={option} key={option} />
            ))}
          </Dropdown>
        </TooltrayNext>
        <TooltrayNext
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode={overflowMode}
          overflowPriority={4}
          role="group"
          aria-label="Secondary filters"
        >
          <Button appearance="transparent">Status</Button>
        </TooltrayNext>
        <TooltrayNext
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode={overflowMode}
          overflowPriority={5}
          role="group"
          aria-label="Tertiary filters"
        >
          <Button appearance="transparent">Columns</Button>
        </TooltrayNext>
      </ToolbarContent>
      <ToolbarContent position="end">
        <TooltrayNext
          overflowMode="none"
          role="group"
          aria-label="Quick actions"
        >
          <Button appearance="transparent">Refresh</Button>
          <Button appearance="solid">Run</Button>
        </TooltrayNext>
      </ToolbarContent>
    </ToolbarNext>
  );
}

interface PriorityOrdering {
  columns: number;
  status: number;
  views: number;
}

function PriorityOrderingToolbar({
  ariaLabel,
  priorities,
}: {
  ariaLabel: string;
  priorities: PriorityOrdering;
}) {
  return (
    <ToolbarNext aria-label={ariaLabel}>
      <ToolbarContent position="start">
        <TooltrayNext overflowMode="none">
          <Input
            bordered
            startAdornment={<SearchIcon aria-hidden />}
            placeholder="Search"
          />
        </TooltrayNext>
        <TooltrayNext
          overflowMode="independent"
          overflowPriority={priorities.views}
        >
          <Button appearance="transparent">Views</Button>
        </TooltrayNext>
        <TooltrayNext
          overflowMode="independent"
          overflowPriority={priorities.status}
        >
          <Button appearance="transparent">Status</Button>
        </TooltrayNext>
        <TooltrayNext
          overflowMode="independent"
          overflowPriority={priorities.columns}
        >
          <Button appearance="transparent">Columns</Button>
        </TooltrayNext>
      </ToolbarContent>
      <ToolbarContent position="end">
        <TooltrayNext
          overflowMode="none"
          role="group"
          aria-label="Primary action"
        >
          <Button appearance="solid">Run</Button>
        </TooltrayNext>
      </ToolbarContent>
    </ToolbarNext>
  );
}

function PriorityOrderingCard({
  priorities,
  title,
}: {
  priorities: PriorityOrdering;
  title: string;
}) {
  return (
    <div style={comparisonCardStyle}>
      <StackLayout gap={1}>
        <Text>
          <strong>{title}</strong>
        </Text>
        <Text>
          Views {priorities.views}, Status {priorities.status}, Columns{" "}
          {priorities.columns}
        </Text>
        <PriorityOrderingToolbar
          ariaLabel={`${title} priority ordering toolbar`}
          priorities={priorities}
        />
      </StackLayout>
    </div>
  );
}

function IntrinsicWidthToggle({
  ariaLabel,
  collapsedLabel,
  collapsedWidth,
  expandedLabel,
  expandedWidth,
}: {
  ariaLabel: string;
  collapsedLabel: string;
  collapsedWidth: number;
  expandedLabel: string;
  expandedWidth: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Button
      appearance="transparent"
      aria-label={ariaLabel}
      aria-pressed={expanded}
      onClick={() => {
        setExpanded((current) => !current);
      }}
      style={{ width: expanded ? expandedWidth : collapsedWidth }}
    >
      {expanded ? expandedLabel : collapsedLabel}
    </Button>
  );
}

function SharedIntrinsicWidthToolbar() {
  return (
    <div style={{ width: 500 }}>
      <ToolbarNext aria-label="Shared intrinsic width overflow toolbar">
        <TooltrayNext overflowMode="none" role="group" aria-label="Search">
          <IntrinsicWidthToggle
            ariaLabel="Toggle shared tray width"
            collapsedLabel="Search"
            collapsedWidth={120}
            expandedLabel="Search with advanced filters"
            expandedWidth={300}
          />
        </TooltrayNext>
        <TooltrayNext overflowMode="independent" overflowPriority={5}>
          <Button appearance="transparent" style={{ width: 150 }}>
            Columns
          </Button>
        </TooltrayNext>
        <TooltrayNext
          overflowMode="none"
          role="group"
          aria-label="Primary action"
        >
          <Button appearance="solid" style={{ width: 100 }}>
            Run
          </Button>
        </TooltrayNext>
      </ToolbarNext>
    </div>
  );
}

function NamedIntrinsicWidthToolbar() {
  return (
    <div style={{ width: 480 }}>
      <ToolbarNext aria-label="Named intrinsic width overflow toolbar">
        <TooltrayNext overflowMode="none" role="group" aria-label="Search">
          <IntrinsicWidthToggle
            ariaLabel="Toggle named tray width"
            collapsedLabel="Search"
            collapsedWidth={120}
            expandedLabel="Search with advanced filters"
            expandedWidth={360}
          />
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
          <Button appearance="transparent">Export</Button>
          <Button appearance="solid">Apply</Button>
        </TooltrayNext>
      </ToolbarNext>
    </div>
  );
}

/**
 * Named overflow mode comparison.
 *
 * Intended behavior:
 * - `independent` collapses one Filters tray at a time according to priority.
 * - `grouped` collapses the whole Filters batch together.
 * - Both examples keep Search and quick actions visible, so the difference is
 *   isolated to the named overflow mode.
 */
export const NamedOverflowModesComparison: StoryFn<typeof ToolbarNext> = () => (
  <StoryExample
    title="Named overflow modes: progressive or batched collapse"
    expectedBehavior={[
      "Resize the story and compare the two toolbars.",
      "The independent toolbar should hide Filters trays progressively: Columns, then Status, then the dropdown.",
      "The grouped toolbar should replace all Filters trays with one Filters trigger at the same time.",
    ]}
    codeRelation={[
      "All Filters trays share the same non-shared overflowGroup, so they render under one named trigger when hidden.",
      "With independent, each TooltrayNext remains its own collapse unit.",
      "With grouped, trays in the same named group are merged into one collapse unit.",
    ]}
  >
    <StackLayout gap={1.5}>
      <ComparisonLabel>
        Toolbar A: `overflowMode=&quot;independent&quot;`
      </ComparisonLabel>
      <NamedFiltersToolbar overflowMode="independent" />
      <ComparisonLabel>
        Toolbar B: `overflowMode=&quot;grouped&quot;`
      </ComparisonLabel>
      <NamedFiltersToolbar overflowMode="grouped" />
    </StackLayout>
  </StoryExample>
);
NamedOverflowModesComparison.globals = wrapGlobals;

/**
 * Single-tray comparison for `independent` and `grouped`.
 *
 * Intended behavior:
 * - Both toolbars should look and behave the same as you resize.
 * - The entire `Actions` tray stays visible until it no longer fits, then the
 *   whole tray is replaced by a single named trigger.
 * - None of the buttons inside the tray split out individually.
 * - This makes the "single tray" caveat explicit: `independent` and `grouped`
 *   only
 *   diverge once there are multiple trays in the same named group.
 */
export const SingleTrayComparison: StoryFn<typeof ToolbarNext> = () => (
  <StoryExample
    title="Single tray: independent and grouped look the same"
    expectedBehavior={[
      "Resize the story and compare both toolbars. They should overflow at the same point and replace the full Actions tray with the same Actions trigger.",
      "Export, Settings, and Run move together. There is no state where only one of those controls remains visible.",
      "This example is intentionally not visually distinct: it shows that a single tray is one overflow unit regardless of whether the mode is independent or grouped.",
    ]}
    codeRelation={[
      "The overflow engine measures TooltrayNext, not the controls inside it, so one tray becomes one ToolbarNextOverflowItem.",
      "With only one tray in the Actions group, grouped has nothing to batch together and ends up behaving the same as independent.",
      "The difference between the modes only becomes visible when multiple non-shared named trays share the same overflow group.",
    ]}
  >
    <StackLayout gap={1.5}>
      <ComparisonLabel>
        Toolbar A: `overflowMode=&quot;independent&quot;`
      </ComparisonLabel>
      <SingleTrayToolbar overflowMode="independent" />
      <ComparisonLabel>
        Toolbar B: `overflowMode=&quot;grouped&quot;`
      </ComparisonLabel>
      <SingleTrayToolbar overflowMode="grouped" />
    </StackLayout>
  </StoryExample>
);
SingleTrayComparison.globals = wrapGlobals;

/**
 * Multi-tray named overflow using `independent`.
 *
 * Intended behavior:
 * - The search tray and end-content quick actions never overflow.
 * - The three `Filters` trays collapse progressively, one `TooltrayNext` at a
 *   time, because they are separate trays in the same named group.
 * - The highest-priority tray overflows first, then the next, then the next.
 * - The named `Filters` trigger stays inline in the start content and represents
 *   whichever subset of the group is currently hidden.
 */
export const NamedGroupIndependentProgressive: StoryFn<
  typeof ToolbarNext
> = () => (
  <StoryExample
    title="Named group with independent: progressive tray-by-tray collapse"
    expectedBehavior={[
      "Resize the story. The Search tray and the end-content quick actions remain visible while the Filters group collapses in stages.",
      "The tertiary Filters tray overflows first, then the secondary tray, then the primary tray. You should see several distinct collapse steps rather than a single jump.",
      "A single Filters trigger appears inline in the start content and continues to represent more hidden content as additional trays overflow.",
    ]}
    codeRelation={[
      "All three Filters trays share the same non-shared overflowGroup, so they end up under one named trigger.",
      "Because the mode is independent, buildCollapseUnits creates one collapse unit per TooltrayNext, which allows the group to disappear progressively.",
      "The trigger sits where the first hidden tray used to be, so it behaves like an inline replacement rather than a trailing shared overflow button.",
    ]}
  >
    <ToolbarNext aria-label="Named independent progressive overflow toolbar">
      <ToolbarContent position="start">
        <TooltrayNext overflowMode="none">
          <Input
            bordered
            startAdornment={<SearchIcon aria-hidden />}
            placeholder="Search"
          />
        </TooltrayNext>
        <TooltrayNext
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode="independent"
          overflowPriority={3}
          role="group"
          aria-label="Primary filters"
        >
          <Dropdown
            aria-label="Primary filter"
            bordered
            defaultSelected={["Option A"]}
          >
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
          role="group"
          aria-label="Secondary filters"
        >
          <Button appearance="transparent">Status</Button>
        </TooltrayNext>
        <TooltrayNext
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode="independent"
          overflowPriority={5}
          role="group"
          aria-label="Tertiary filters"
        >
          <Button appearance="transparent">Columns</Button>
        </TooltrayNext>
      </ToolbarContent>
      <ToolbarContent position="end">
        <TooltrayNext
          overflowMode="none"
          role="group"
          aria-label="Quick actions"
        >
          <Button appearance="transparent">Refresh</Button>
          <Button appearance="solid">Run</Button>
        </TooltrayNext>
      </ToolbarContent>
    </ToolbarNext>
  </StoryExample>
);
NamedGroupIndependentProgressive.globals = wrapGlobals;

/**
 * Multi-tray named overflow using `grouped`.
 *
 * Intended behavior:
 * - The search tray and end-content quick actions never overflow.
 * - The three `Filters` trays all disappear together once the toolbar needs
 *   space from that named group.
 * - There is no intermediate state where one or two filter trays remain visible
 *   while the others have already overflowed.
 * - Compared with the independent example, this should feel like a single jump.
 */
export const NamedGroupGroupedBatch: StoryFn<typeof ToolbarNext> = () => (
  <StoryExample
    title="Named group with grouped: the whole batch disappears together"
    expectedBehavior={[
      "Resize the story and watch the Filters group. Instead of collapsing in several steps, all three Filters trays disappear together and are replaced by one Filters trigger.",
      "The Search tray and the end-content quick actions remain visible, which makes the batch collapse easier to notice.",
      "Compared with the independent example, this story should have one obvious transition point rather than multiple progressive transitions.",
    ]}
    codeRelation={[
      "All three Filters trays share the same non-shared overflowGroup and all use grouped.",
      "In buildCollapseUnits, that causes the trays to be merged into one collapse unit, so the hook either keeps all of them visible or hides all of them together.",
      "The visible result is one named trigger representing the whole group at once.",
    ]}
  >
    <ToolbarNext aria-label="Named grouped batch overflow toolbar">
      <ToolbarContent position="start">
        <TooltrayNext overflowMode="none">
          <Input
            bordered
            startAdornment={<SearchIcon aria-hidden />}
            placeholder="Search"
          />
        </TooltrayNext>
        <TooltrayNext
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode="grouped"
          overflowPriority={3}
          role="group"
          aria-label="Primary filters"
        >
          <Dropdown
            aria-label="Primary filter"
            bordered
            defaultSelected={["Option A"]}
          >
            {options.map((option) => (
              <Option value={option} key={option} />
            ))}
          </Dropdown>
        </TooltrayNext>
        <TooltrayNext
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode="grouped"
          overflowPriority={4}
          role="group"
          aria-label="Secondary filters"
        >
          <Button appearance="transparent">Status</Button>
        </TooltrayNext>
        <TooltrayNext
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode="grouped"
          overflowPriority={5}
          role="group"
          aria-label="Tertiary filters"
        >
          <Button appearance="transparent">Columns</Button>
        </TooltrayNext>
      </ToolbarContent>
      <ToolbarContent position="end">
        <TooltrayNext
          overflowMode="none"
          role="group"
          aria-label="Quick actions"
        >
          <Button appearance="transparent">Refresh</Button>
          <Button appearance="solid">Run</Button>
        </TooltrayNext>
      </ToolbarContent>
    </ToolbarNext>
  </StoryExample>
);
NamedGroupGroupedBatch.globals = wrapGlobals;

/**
 * Shared overflow comparison for `independent` and `grouped`.
 *
 * Intended behavior:
 * - Both toolbars should collapse in the same order: Export first, then the
 *   dropdown, then Columns.
 * - Everything that overflows moves into the same generic shared trigger at the
 *   trailing edge.
 * - This is a deliberate comparison showing that shared overflow does not get a
 *   special batching behavior from `grouped` in the current implementation.
 */
export const SharedOverflowComparison: StoryFn<typeof ToolbarNext> = () => (
  <StoryExample
    title="Shared overflow: independent and grouped still behave the same today"
    expectedBehavior={[
      "Resize the story and compare both toolbars. They should collapse in the same sequence: Export first, then the dropdown, then Columns.",
      "In both cases, overflowed trays move into the same generic shared trigger at the toolbar edge rather than producing named inline triggers.",
      "This example is useful because it shows another case where switching from independent to grouped does not change visible behavior.",
    ]}
    codeRelation={[
      "The special grouped path only applies when overflowGroup is not shared.",
      "For shared overflow, each TooltrayNext remains its own collapse unit even when the mode is grouped.",
      "That means both shared examples still collapse tray by tray according to overflowPriority and source order.",
    ]}
  >
    <StackLayout gap={1.5}>
      <ComparisonLabel>Toolbar A: shared `independent`</ComparisonLabel>
      <SharedToolbar overflowMode="independent" />
      <ComparisonLabel>Toolbar B: shared `grouped`</ComparisonLabel>
      <SharedToolbar overflowMode="grouped" />
    </StackLayout>
  </StoryExample>
);
SharedOverflowComparison.globals = wrapGlobals;

/**
 * Shared overflow comparison with identical trays but different priority orders.
 *
 * Intended behavior:
 * - Each panel uses the same toolbar width and the same tray widths.
 * - The only difference is the `overflowPriority` values on the three middle
 *   trays.
 * - Higher `overflowPriority` values overflow sooner, so each panel preserves a
 *   different tray inline for longer.
 * - This makes priority ordering easy to compare side by side without relying
 *   on a large resize.
 */
export const PriorityOrderingComparison: StoryFn<typeof ToolbarNext> = () => (
  <StoryExample
    title="Priority ordering: the same toolbar preserves different trays"
    expectedBehavior={[
      "All three examples start from the same toolbar structure and the same fixed width, so any visible difference should come from priority ordering alone.",
      "The tray with the lowest overflowPriority should remain visible the longest. Changing the numbers should change which of Views, Status, or Columns survives inline.",
      "If you resize the story, each panel should continue to collapse its trays in the order implied by the numbers shown above it.",
    ]}
    codeRelation={[
      "Each middle tray uses shared independent overflow, so the comparison is specifically about collapse order rather than grouped batching behavior.",
      "Higher overflowPriority values are consumed first by the overflow solver, which is why swapping the numbers changes which tray disappears first.",
      "Because the toolbar width and tray widths are held constant across panels, the story isolates overflowPriority as the main variable.",
    ]}
  >
    <div style={comparisonGridStyle}>
      <PriorityOrderingCard
        title="Protect Views"
        priorities={{ views: 1, status: 4, columns: 5 }}
      />
      <PriorityOrderingCard
        title="Protect Status"
        priorities={{ views: 4, status: 1, columns: 5 }}
      />
      <PriorityOrderingCard
        title="Protect Columns"
        priorities={{ views: 5, status: 4, columns: 1 }}
      />
    </div>
  </StoryExample>
);
PriorityOrderingComparison.globals = wrapGlobals;

/**
 * Intrinsic child-width changes without any parent resize.
 *
 * Intended behavior:
 * - Each toolbar is rendered at a fixed width. Do not resize the story.
 * - Click the first tray button in each example to switch between a short and
 *   long label. That changes the child's intrinsic width from inside the tray.
 * - In the shared example, the generic overflow trigger should appear and
 *   disappear as the leading tray grows and shrinks.
 * - In the named example, the `Actions` tray should collapse into and out of
 *   its inline named trigger as the leading tray grows and shrinks.
 * - This story demonstrates the overflow invalidation fix specifically: the
 *   toolbar should react immediately even though the container width never
 *   changes.
 */
export const IntrinsicWidthChanges: StoryFn<typeof ToolbarNext> = () => (
  <StoryExample
    title="Intrinsic tray width changes now invalidate overflow"
    expectedBehavior={[
      "Leave the story width alone and click the first tray button in each toolbar.",
      "The button changes its own intrinsic width from a short label to a longer one without resizing the toolbar container.",
      "In the shared example, a generic overflow trigger should appear when the first tray grows and disappear when it shrinks.",
      "In the named example, the Actions tray should be replaced by its inline Actions trigger when the first tray grows and return when it shrinks.",
    ]}
    codeRelation={[
      "The width change comes from state local to the child control, not from resizing the toolbar or rerendering ToolbarNext from above.",
      "useToolbarNextOverflow now observes the same measured slot wrappers and trigger measurement nodes that the overflow solver already uses.",
      "That means internal tray-width changes can invalidate cached widths and trigger a fresh overflow computation immediately.",
    ]}
  >
    <StackLayout gap={1.5}>
      <ComparisonLabel>
        Toolbar A: shared overflow reacts to child width
      </ComparisonLabel>
      <SharedIntrinsicWidthToolbar />
      <ComparisonLabel>
        Toolbar B: named overflow reacts to child width
      </ComparisonLabel>
      <NamedIntrinsicWidthToolbar />
    </StackLayout>
  </StoryExample>
);
