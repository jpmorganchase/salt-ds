import { Button, Dropdown, Input, Option } from "@salt-ds/core";
import { ToolbarNext, ToolbarRegion, TooltrayNext } from "@salt-ds/lab";
import { composeStories } from "@storybook/react-vite";
import { useState } from "react";
import * as toolbarNextStories from "../../../../stories/toolbar-next/toolbar-next.cypress.stories";

const {
  DefaultSharedOverflowFixture,
  KeyboardButtonsFixture,
  KeyboardComboBoxFixture,
  KeyboardDatePickerFixture,
  KeyboardDropdownFixture,
  KeyboardOverflowFixture,
  KeyboardOverflowRerenderFixture,
  KeyboardOverflowToggleGroupFixture,
  KeyboardRtlFixture,
  KeyboardTextInputFixture,
  KeyboardToggleGroupFixture,
  NamedOverflowWithDividersFixture,
  OverflowDividersFixture,
  SpacingOverflowFixture,
} = composeStories(toolbarNextStories);
const toolbarHarnessStyle = { height: 220, width: 760 };

function WidthChangingButton({
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

function SharedIntrinsicWidthTestCase() {
  return (
    <div className="IntrinsicWidthHarness" style={{ height: 220, width: 500 }}>
      <ToolbarNext aria-label="Toolbar with shared intrinsic width changes">
        <TooltrayNext overflowMode="none" role="group" aria-label="Search">
          <WidthChangingButton
            ariaLabel="Toggle shared width"
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

function OverflowPrioritiesKeyboardTestCase() {
  return (
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
        <Button appearance="transparent">Export</Button>
      </TooltrayNext>
    </ToolbarNext>
  );
}

function NamedGroupCollapseTestCase({
  overflowMode,
}: {
  overflowMode: "grouped" | "independent";
}) {
  return (
    <div className="Flexbox" style={toolbarHarnessStyle}>
      <ToolbarNext aria-label={`${overflowMode} named filters toolbar`}>
        <ToolbarRegion position="start">
          <TooltrayNext overflowMode="none" role="group" aria-label="Search">
            <Button style={{ width: 140 }}>Search</Button>
          </TooltrayNext>
          <TooltrayNext
            overflowGroup="Filters"
            overflowLabel="Filters"
            overflowMode={overflowMode}
            overflowPriority={3}
            role="group"
            aria-label="Primary filters"
          >
            <Button appearance="transparent" style={{ width: 110 }}>
              Filter A
            </Button>
          </TooltrayNext>
          <TooltrayNext
            overflowGroup="Filters"
            overflowLabel="Filters"
            overflowMode={overflowMode}
            overflowPriority={4}
            role="group"
            aria-label="Secondary filters"
          >
            <Button appearance="transparent" style={{ width: 110 }}>
              Status
            </Button>
          </TooltrayNext>
          <TooltrayNext
            overflowGroup="Filters"
            overflowLabel="Filters"
            overflowMode={overflowMode}
            overflowPriority={5}
            role="group"
            aria-label="Tertiary filters"
          >
            <Button appearance="transparent" style={{ width: 110 }}>
              Columns
            </Button>
          </TooltrayNext>
        </ToolbarRegion>
        <ToolbarRegion position="end">
          <TooltrayNext
            overflowMode="none"
            role="group"
            aria-label="Quick actions"
          >
            <Button appearance="transparent" style={{ width: 100 }}>
              Refresh
            </Button>
            <Button appearance="solid" style={{ width: 100 }}>
              Run
            </Button>
          </TooltrayNext>
        </ToolbarRegion>
      </ToolbarNext>
    </div>
  );
}

function CenteredToolbarTestCase({
  ariaLabel,
  includeStart = true,
  includeOverflow = false,
  startWidth = 120,
  endWidth = 120,
}: {
  ariaLabel: string;
  includeOverflow?: boolean;
  includeStart?: boolean;
  startWidth?: number;
  endWidth?: number;
}) {
  return (
    <div className="Flexbox" style={{ height: 220, width: 760 }}>
      <ToolbarNext aria-label={ariaLabel}>
        {includeStart ? (
          <ToolbarRegion position="start">
            <TooltrayNext overflowMode="none" role="group" aria-label="Leading">
              <Button style={{ width: startWidth }}>Start</Button>
            </TooltrayNext>
          </ToolbarRegion>
        ) : null}
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
            overflowMode={includeOverflow ? "grouped" : "none"}
            overflowPriority={5}
            role="group"
          >
            <Button appearance="transparent" style={{ width: endWidth }}>
              End primary
            </Button>
            {includeOverflow ? (
              <Button appearance="transparent" style={{ width: 120 }}>
                End secondary
              </Button>
            ) : null}
          </TooltrayNext>
        </ToolbarRegion>
      </ToolbarNext>
    </div>
  );
}

function NamedIntrinsicWidthTestCase() {
  return (
    <div className="IntrinsicWidthHarness" style={{ height: 220, width: 480 }}>
      <ToolbarNext aria-label="Toolbar with named intrinsic width changes">
        <TooltrayNext overflowMode="none" role="group" aria-label="Search">
          <WidthChangingButton
            ariaLabel="Toggle named width"
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

function NamedOverflowFocusReentryTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 320, flexDirection: "column" }}
    >
      <button data-testid="toolbar-before">Before toolbar</button>
      <ToolbarNext aria-label="Named overflow focus toolbar">
        <ToolbarRegion position="start">
          <TooltrayNext overflowMode="none" role="group" aria-label="Search">
            <Input bordered placeholder="Search" />
          </TooltrayNext>
          <TooltrayNext
            overflowGroup="Filters"
            overflowLabel="Filters"
            overflowMode="grouped"
            overflowPriority={5}
            role="group"
            aria-label="Filters"
          >
            <Dropdown bordered defaultSelected={["Option A"]}>
              <Option value="Option A" />
              <Option value="Option B" />
            </Dropdown>
            <Button appearance="transparent">Filters</Button>
          </TooltrayNext>
        </ToolbarRegion>
        <ToolbarRegion position="end">
          <TooltrayNext
            overflowGroup="Actions"
            overflowLabel="Actions"
            overflowMode="grouped"
            overflowPriority={6}
            role="group"
            aria-label="Actions"
          >
            <Button appearance="transparent">Export</Button>
            <Button appearance="transparent">Settings</Button>
          </TooltrayNext>
        </ToolbarRegion>
      </ToolbarNext>
      <button data-testid="toolbar-after">After toolbar</button>
    </div>
  );
}

function SharedOverflowFocusReentryTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 320, flexDirection: "column" }}
    >
      <button data-testid="toolbar-before">Before toolbar</button>
      <ToolbarNext aria-label="Shared overflow focus toolbar">
        <ToolbarRegion position="start">
          <TooltrayNext role="group" aria-label="Search and filter">
            <Input bordered placeholder="Search" />
            <Dropdown bordered defaultSelected={["Option A"]}>
              <Option value="Option A" />
              <Option value="Option B" />
            </Dropdown>
          </TooltrayNext>
        </ToolbarRegion>
        <ToolbarRegion position="end">
          <TooltrayNext role="group" aria-label="Actions">
            <Button appearance="transparent">Export</Button>
            <Button appearance="solid">Run</Button>
          </TooltrayNext>
        </ToolbarRegion>
      </ToolbarNext>
      <button data-testid="toolbar-after">After toolbar</button>
    </div>
  );
}

function OverflowTextInputKeyboardTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 180, flexDirection: "column" }}
    >
      <button data-testid="toolbar-before">Before toolbar</button>
      <ToolbarNext aria-label="Overflow text input toolbar">
        <TooltrayNext
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode="grouped"
          overflowPriority={5}
          role="group"
          aria-label="Filters"
        >
          <Button appearance="transparent">Reset</Button>
          <Input bordered placeholder="Overflow search" />
          <Button appearance="transparent">Apply</Button>
        </TooltrayNext>
      </ToolbarNext>
      <button data-testid="toolbar-after">After toolbar</button>
    </div>
  );
}

function setFixtureWidth(width: number) {
  cy.get(".Flexbox").invoke("css", "width", `${width}px`);
}

function expectToolbarFits(name: string) {
  cy.findByRole("toolbar", { name }).should(($toolbar) => {
    expect($toolbar[0]?.scrollWidth, `scroll width for ${name}`).to.be.at.most(
      $toolbar[0]?.clientWidth ?? 0,
    );
  });
}

function expectVisibleSeparators(count: number) {
  cy.get("body").should(($body) => {
    expect($body.find('[role="separator"]:visible')).to.have.length(count);
  });
}

function expectIntrinsicHarnessWidth(width: number) {
  cy.get(".IntrinsicWidthHarness").should("have.css", "width", `${width}px`);
}

function expectCenteredControl(toolbarName: string, controlName: string) {
  cy.findByRole("toolbar", { name: toolbarName }).then(($toolbar) => {
    const toolbarRect = $toolbar[0]?.getBoundingClientRect();

    cy.findByRole("button", { name: controlName }).then(($button) => {
      const buttonRect = $button[0]?.getBoundingClientRect();
      const toolbarMidpoint =
        (toolbarRect?.left ?? 0) + (toolbarRect?.width ?? 0) / 2;
      const buttonMidpoint =
        (buttonRect?.left ?? 0) + (buttonRect?.width ?? 0) / 2;

      expect(
        Math.abs(toolbarMidpoint - buttonMidpoint),
        `center offset for ${toolbarName}`,
      ).to.be.lessThan(1.5);
    });
  });
}

describe("Given ToolbarNext variants and appearances", () => {
  it("applies primary and bordered classes by default", () => {
    cy.mount(
      <ToolbarNext aria-label="Default toolbar">
        <TooltrayNext>
          <Button>Action</Button>
        </TooltrayNext>
      </ToolbarNext>,
    );

    cy.findByRole("toolbar", { name: "Default toolbar" })
      .should("have.class", "saltToolbarNext-primary")
      .and("have.class", "saltToolbarNext-bordered");
  });

  it("applies secondary and tertiary variant classes", () => {
    cy.mount(
      <>
        <ToolbarNext variant="secondary" aria-label="Secondary toolbar">
          <TooltrayNext>
            <Button>Secondary action</Button>
          </TooltrayNext>
        </ToolbarNext>
        <ToolbarNext variant="tertiary" aria-label="Tertiary toolbar">
          <TooltrayNext>
            <Button>Tertiary action</Button>
          </TooltrayNext>
        </ToolbarNext>
      </>,
    );

    cy.findByRole("toolbar", { name: "Secondary toolbar" })
      .should("have.class", "saltToolbarNext-secondary")
      .and("have.class", "saltToolbarNext-bordered");
    cy.findByRole("toolbar", { name: "Tertiary toolbar" })
      .should("have.class", "saltToolbarNext-tertiary")
      .and("have.class", "saltToolbarNext-bordered");
  });

  it("applies transparent appearance without bordered chrome", () => {
    cy.mount(
      <ToolbarNext appearance="transparent" aria-label="Transparent toolbar">
        <TooltrayNext>
          <Button>Action</Button>
        </TooltrayNext>
      </ToolbarNext>,
    );

    cy.findByRole("toolbar", { name: "Transparent toolbar" })
      .should("have.class", "saltToolbarNext-primary")
      .and("have.class", "saltToolbarNext-transparent")
      .and("not.have.class", "saltToolbarNext-bordered");
  });
});

describe("Given ToolbarNext overflow measurements", () => {
  it("collapses omitted overflowMode trays into the shared generic trigger by default", () => {
    cy.mount(<DefaultSharedOverflowFixture width={420} />);

    cy.findByRole("button", { name: /Open overflow\./i }).should("be.visible");
    cy.findByRole("button", { name: "Export" }).should("not.exist");
    cy.findByRole("button", { name: "Columns" }).should("be.visible");
    expectToolbarFits("Toolbar with default shared overflow");
  });

  it("keeps divider-heavy shared overflow layouts clipped-free as trays collapse", () => {
    cy.mount(<OverflowDividersFixture width={560} />);

    expectVisibleSeparators(2);
    cy.findByRole("button", { name: /Open overflow\./i }).should("not.exist");
    expectToolbarFits("Toolbar with divider overflow");

    setFixtureWidth(360);
    cy.findByRole("button", { name: /Open overflow\./i }).should("be.visible");
    expectVisibleSeparators(1);
    expectToolbarFits("Toolbar with divider overflow");

    setFixtureWidth(260);
    expectVisibleSeparators(0);
    expectToolbarFits("Toolbar with divider overflow");
  });

  it("measures named trigger anchors with preserved dividers before clipping", () => {
    cy.mount(<NamedOverflowWithDividersFixture width={760} />);

    expectToolbarFits("Data entry toolbar with named overflow");

    setFixtureWidth(540);
    cy.findByRole("button", { name: /Open Actions overflow\./i }).should(
      "be.visible",
    );
    cy.findByRole("button", { name: /Open Actions overflow\./i })
      .closest('[data-position="start"]')
      .should("exist");
    expectVisibleSeparators(1);
    expectToolbarFits("Data entry toolbar with named overflow");

    setFixtureWidth(420);
    cy.findByRole("button", { name: /Open Filters overflow\./i }).should(
      "be.visible",
    );
    cy.findByRole("button", { name: /Open Filters overflow\./i })
      .closest('[data-position="start"]')
      .should("exist");
    cy.findByRole("button", { name: /Open Actions overflow\./i }).should(
      "be.visible",
    );
    expectVisibleSeparators(1);
    expectToolbarFits("Data entry toolbar with named overflow");
  });

  it("accounts for spacing overrides when deciding shared overflow", () => {
    cy.mount(<SpacingOverflowFixture width={520} />);

    cy.findByRole("button", { name: /Open overflow\./i }).should("not.exist");
    cy.findByRole("button", { name: "Primary" }).should("be.visible");
    cy.findByRole("button", { name: "Run" }).should("be.visible");
    expectToolbarFits("Toolbar with overflow spacing");

    setFixtureWidth(360);
    cy.findByRole("button", { name: /Open overflow\./i }).should("be.visible");
    cy.findByRole("button", { name: "Primary" }).should("be.visible");
    cy.findByRole("button", { name: "Run" }).should("be.visible");
    expectToolbarFits("Toolbar with overflow spacing");
  });

  it("remeasures shared overflow when a visible tray changes width", () => {
    cy.mount(<SharedIntrinsicWidthTestCase />);

    cy.findByRole("button", { name: /Open overflow\./i }).should("not.exist");
    cy.findByRole("button", { name: "Columns" }).should("be.visible");
    expectIntrinsicHarnessWidth(500);
    expectToolbarFits("Toolbar with shared intrinsic width changes");

    cy.findByRole("button", { name: "Toggle shared width" }).click();

    cy.findByRole("button", { name: /Open overflow\./i }).should("be.visible");
    cy.findByRole("button", { name: "Columns" }).should("not.exist");
    expectIntrinsicHarnessWidth(500);
    expectToolbarFits("Toolbar with shared intrinsic width changes");

    cy.findByRole("button", { name: "Toggle shared width" }).click();

    cy.findByRole("button", { name: /Open overflow\./i }).should("not.exist");
    cy.findByRole("button", { name: "Columns" }).should("be.visible");
    expectIntrinsicHarnessWidth(500);
    expectToolbarFits("Toolbar with shared intrinsic width changes");
  });

  it("remeasures named overflow when a visible tray changes width", () => {
    cy.mount(<NamedIntrinsicWidthTestCase />);

    cy.findByRole("toolbar", {
      name: "Toolbar with named intrinsic width changes",
    }).within(() => {
      cy.findByRole("button", { name: /Open Actions overflow\./i }).should(
        "not.exist",
      );
      cy.findByRole("button", { name: "Export" }).should("be.visible");
      cy.findByRole("button", { name: "Apply" }).should("be.visible");
    });
    expectIntrinsicHarnessWidth(480);
    expectToolbarFits("Toolbar with named intrinsic width changes");

    cy.findByRole("button", { name: "Toggle named width" }).click();

    cy.findByRole("toolbar", {
      name: "Toolbar with named intrinsic width changes",
    }).within(() => {
      cy.findByRole("button", { name: /Open Actions overflow\./i }).should(
        "be.visible",
      );
      cy.findByRole("button", { name: "Export" }).should("not.exist");
      cy.findByRole("button", { name: "Apply" }).should("not.exist");
    });
    expectIntrinsicHarnessWidth(480);
    expectToolbarFits("Toolbar with named intrinsic width changes");

    cy.findByRole("button", { name: "Toggle named width" }).click();

    cy.findByRole("toolbar", {
      name: "Toolbar with named intrinsic width changes",
    }).within(() => {
      cy.findByRole("button", { name: /Open Actions overflow\./i }).should(
        "not.exist",
      );
      cy.findByRole("button", { name: "Export" }).should("be.visible");
      cy.findByRole("button", { name: "Apply" }).should("be.visible");
    });
    expectIntrinsicHarnessWidth(480);
    expectToolbarFits("Toolbar with named intrinsic width changes");
  });

  it("preserves progressive versus grouped behavior for multi-tray named overflow", () => {
    cy.mount(<NamedGroupCollapseTestCase overflowMode="independent" />);

    cy.findByRole("button", { name: /Open Filters overflow\./i }).should(
      "not.exist",
    );
    cy.findByRole("button", { name: "Status" }).should("be.visible");
    cy.findByRole("button", { name: "Columns" }).should("be.visible");

    setFixtureWidth(590);
    cy.findByRole("button", { name: /Open Filters overflow\./i }).should(
      "be.visible",
    );
    cy.findByRole("button", { name: "Columns" }).should("not.exist");
    cy.findByRole("button", { name: "Filter A" }).should("be.visible");
    expectToolbarFits("independent named filters toolbar");

    cy.mount(<NamedGroupCollapseTestCase overflowMode="grouped" />);

    cy.findByRole("button", { name: /Open Filters overflow\./i }).should(
      "not.exist",
    );
    setFixtureWidth(590);
    cy.findByRole("button", { name: /Open Filters overflow\./i }).should(
      "be.visible",
    );
    cy.findByRole("button", { name: "Columns" }).should("not.exist");
    cy.findByRole("button", { name: "Filter A" }).should("not.exist");
    expectToolbarFits("grouped named filters toolbar");
  });

  it("keeps centered content on the toolbar midpoint with asymmetric side widths", () => {
    cy.mount(
      <CenteredToolbarTestCase
        ariaLabel="Centered asymmetric toolbar"
        endWidth={80}
        startWidth={220}
      />,
    );
    expectCenteredControl("Centered asymmetric toolbar", "Center action");
    expectToolbarFits("Centered asymmetric toolbar");
  });

  it("keeps centered content centered when only the end band is populated", () => {
    cy.mount(
      <CenteredToolbarTestCase
        ariaLabel="Centered end-only toolbar"
        endWidth={180}
        includeStart={false}
      />,
    );

    expectCenteredControl("Centered end-only toolbar", "Center action");
    expectToolbarFits("Centered end-only toolbar");
  });

  it("keeps centered content centered after a named overflow trigger replaces end content", () => {
    cy.mount(
      <CenteredToolbarTestCase
        ariaLabel="Centered named overflow toolbar"
        endWidth={180}
        includeOverflow
      />,
    );

    setFixtureWidth(420);
    cy.findByRole("button", { name: /Open Actions overflow\./i }).should(
      "be.visible",
    );
    cy.findByRole("button", { name: /Open Actions overflow\./i })
      .closest('[data-band-position="end"]')
      .should("exist");
    expectCenteredControl("Centered named overflow toolbar", "Center action");
    expectToolbarFits("Centered named overflow toolbar");
  });
});

describe("Given ToolbarNext keyboard navigation", () => {
  it("restores the last focused control when tabbing back into the toolbar", () => {
    cy.mount(<KeyboardButtonsFixture />);

    cy.findByTestId("toolbar-before").focus();
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Cut" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Copy" }).should("be.focused");

    cy.realPress("Tab");
    cy.findByTestId("toolbar-after").should("be.focused");

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("button", { name: "Copy" }).should("be.focused");
  });

  it("moves focus before the toolbar on Shift+Tab from a button", () => {
    cy.mount(<KeyboardButtonsFixture />);

    cy.findByRole("button", { name: "Run" }).focus();
    cy.realPress(["Shift", "Tab"]);
    cy.findByTestId("toolbar-before").should("be.focused");
  });

  it("does not tab between buttons when no focus target follows the toolbar", () => {
    cy.mount(<OverflowPrioritiesKeyboardTestCase />);

    cy.findByRole("button", { name: "Pinned" }).focus();
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Pinned" }).should("not.be.focused");
    cy.findByRole("button", { name: "Views" }).should("not.be.focused");
  });

  it("wraps horizontal navigation from the last control back to the first", () => {
    cy.mount(<KeyboardButtonsFixture />);

    cy.findByTestId("toolbar-before").focus();
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Cut" }).should("be.focused");
    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "Run" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Cut" }).should("be.focused");
  });

  it("keeps plain text inputs on native left/right behavior and uses Tab to leave them", () => {
    cy.mount(<KeyboardTextInputFixture />);

    cy.findByPlaceholderText("Search").focus();
    cy.realPress("ArrowRight");
    cy.findByPlaceholderText("Search").should("be.focused");

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Columns" }).should("be.focused");

    cy.realPress("Tab");
    cy.findByTestId("toolbar-after").should("be.focused");
  });

  it("keeps overflow panel text inputs on native left/right behavior and uses Tab within the panel", () => {
    cy.mount(<OverflowTextInputKeyboardTestCase />);

    cy.findByRole("button", { name: /Open Filters overflow\./i }).click();
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("be.visible");
    cy.findByPlaceholderText("Overflow search").focus();

    cy.realPress("ArrowRight");
    cy.findByPlaceholderText("Overflow search").should("be.focused");

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("be.visible");
    cy.findByRole("button", { name: "Reset" }).should("be.focused");

    cy.findByPlaceholderText("Overflow search").focus();
    cy.realPress("Tab");
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("be.visible");
    cy.findByRole("button", { name: "Apply" }).should("be.focused");
  });

  it("keeps combo boxes on native left/right behavior and native Tab order", () => {
    cy.mount(<KeyboardComboBoxFixture />);

    cy.findByRole("combobox").focus();
    cy.realPress("ArrowRight");
    cy.findByRole("combobox").should("be.focused");
    cy.realPress("ArrowLeft");
    cy.findByRole("combobox").should("be.focused");

    cy.realPress("ArrowDown");
    cy.findByRole("combobox").should("have.attr", "aria-activedescendant");
    cy.realPress("Escape");
    cy.findByRole("combobox").should("be.focused");

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Columns" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByTestId("toolbar-after").should("be.focused");
  });

  it("uses Left and Right to move through the toolbar from a dropdown", () => {
    cy.mount(<KeyboardDropdownFixture />);

    cy.findByRole("combobox").focus();
    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Columns" }).should("be.focused");
    cy.realPress("ArrowLeft");
    cy.findByRole("combobox").should("be.focused");
  });

  it("uses Tab and Shift+Tab to leave the toolbar from a dropdown", () => {
    cy.mount(<KeyboardDropdownFixture />);

    cy.findByRole("combobox").focus();
    cy.realPress("Tab");
    cy.findByTestId("toolbar-after").should("be.focused");

    cy.findByRole("combobox").focus();
    cy.realPress(["Shift", "Tab"]);
    cy.findByTestId("toolbar-before").should("be.focused");
  });

  it("allows tabbing within the date picker trigger and arrowing from the calendar button", () => {
    cy.mount(<KeyboardDatePickerFixture />);

    cy.findByPlaceholderText("Select date").focus();
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Open Calendar" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("toolbar", {
      name: "Keyboard date picker toolbar",
    }).within(() => {
      cy.findByRole("button", { name: "Apply" }).should("be.focused");
    });

    cy.realPress("Tab");
    cy.findByTestId("toolbar-after").should("be.focused");
  });

  it("moves through toggle buttons and hands off at toolbar boundaries", () => {
    cy.mount(<KeyboardToggleGroupFixture />);

    cy.findByRole("button", { name: "First Run" }).focus();
    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "All" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Archived" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Run" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "Archived" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "All" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "First Run" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "All" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("Tab");
    cy.findByTestId("toolbar-after").should("be.focused");

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("radio", { name: "Active" }).should("be.focused");
  });

  it("does not skip a toggle group when its first toggle button is disabled", () => {
    cy.mount(<KeyboardToggleGroupFixture disableFirstToggle />);

    cy.findByRole("button", { name: "First Run" }).focus();
    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Archived" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Run" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "Archived" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "First Run" }).should("be.focused");
  });

  it("moves through toggle buttons and hands off inside overflow panels", () => {
    cy.mount(<KeyboardOverflowToggleGroupFixture width={260} />);

    cy.findByRole("button", { name: /Open Views overflow\./i }).click();
    cy.findByRole("toolbar", { name: "Views overflow" }).should("be.visible");
    cy.findByRole("button", { name: "Before toggles" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "All" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Archived" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Confirm view" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "Archived" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "All" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "Before toggles" }).should("be.focused");
  });

  it("does not skip a disabled-leading toggle group inside overflow panels", () => {
    cy.mount(
      <KeyboardOverflowToggleGroupFixture disableFirstToggle width={260} />,
    );

    cy.findByRole("button", { name: /Open Views overflow\./i }).click();
    cy.findByRole("toolbar", { name: "Views overflow" }).should("be.visible");
    cy.findByRole("button", { name: "Before toggles" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Archived" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Confirm view" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "Archived" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "Before toggles" }).should("be.focused");
  });

  it("moves focus into overflow panels, supports horizontal navigation there, and returns focus on Escape", () => {
    cy.mount(<KeyboardOverflowFixture width={260} />);

    cy.findByRole("button", { name: /Open Actions overflow\./i }).click();
    cy.findByRole("toolbar", { name: "Actions overflow" }).should("be.visible");
    cy.findByRole("button", { name: "Export" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Run" }).should("be.focused");

    cy.realPress("Escape");
    cy.findByRole("toolbar", { name: "Actions overflow" }).should("not.exist");
    cy.findByRole("button", { name: /Open Actions overflow\./i }).should(
      "be.focused",
    );
  });

  it("closes a portaled overflow panel and moves focus after the toolbar on Tab", () => {
    cy.mount(<KeyboardOverflowFixture width={260} />);

    cy.findByRole("button", { name: /Open Actions overflow\./i }).click();
    cy.findByRole("toolbar", { name: "Actions overflow" }).should("be.visible");
    cy.findByRole("button", { name: "Export" }).should("be.focused");

    cy.realPress("Tab");

    cy.findByRole("toolbar", { name: "Actions overflow" }).should("not.exist");
    cy.findByTestId("toolbar-after").should("be.focused");
  });

  it("closes a portaled overflow panel and returns focus to the trigger on Shift+Tab", () => {
    cy.mount(<KeyboardOverflowFixture width={260} />);

    cy.findByRole("button", { name: /Open Actions overflow\./i }).click();
    cy.findByRole("toolbar", { name: "Actions overflow" }).should("be.visible");
    cy.findByRole("button", { name: "Export" }).should("be.focused");

    cy.realPress(["Shift", "Tab"]);

    cy.findByRole("toolbar", { name: "Actions overflow" }).should("not.exist");
    cy.findByRole("button", { name: /Open Actions overflow\./i }).should(
      "be.focused",
    );
  });

  it("closes a portaled overflow panel when focus moves outside", () => {
    cy.mount(<KeyboardOverflowFixture width={260} />);

    cy.findByRole("button", { name: /Open Actions overflow\./i }).click();
    cy.findByRole("toolbar", { name: "Actions overflow" }).should("be.visible");

    cy.findByTestId("toolbar-after").click();

    cy.findByRole("toolbar", { name: "Actions overflow" }).should("not.exist");
    cy.findByTestId("toolbar-after").should("be.focused");
  });

  it("restores focus to the named overflow trigger when tabbing back into the toolbar", () => {
    cy.mount(<NamedOverflowFocusReentryTestCase />);

    cy.findByRole("button", { name: /Open Filters overflow\./i }).should(
      "be.visible",
    );
    cy.findByPlaceholderText("Search").focus();
    cy.realPress("Tab");
    cy.findByRole("button", { name: /Open Filters overflow\./i }).should(
      "be.focused",
    );

    cy.realPress("Space");
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("be.visible");
    cy.findByRole("combobox").should("be.focused");

    cy.findByTestId("toolbar-after").click();
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("not.exist");

    cy.findByTestId("toolbar-before").focus();
    cy.realPress("Tab");
    cy.findByRole("button", { name: /Open Filters overflow\./i }).should(
      "be.focused",
    );

    cy.realPress("Space");
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("be.visible");
    cy.findByRole("combobox").should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Filters" }).should("be.focused");
  });

  it("restores visible shared overflow controls when re-entering through the overflow trigger", () => {
    cy.mount(<SharedOverflowFocusReentryTestCase />);

    cy.findByRole("button", { name: /Open overflow\./i }).should("be.visible");
    cy.findByPlaceholderText("Search").focus();
    cy.realPress("Tab");
    cy.findByRole("combobox").should("be.focused");

    cy.realPress("Tab");
    cy.findByTestId("toolbar-after").should("be.focused");

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("combobox").should("be.focused");
  });

  it("restores named overflow controls to toolbar arrow navigation after expansion", () => {
    cy.mount(<NamedOverflowFocusReentryTestCase />);

    cy.findByRole("button", { name: /Open Filters overflow\./i }).should(
      "be.visible",
    );
    cy.findByRole("button", { name: /Open Filters overflow\./i })
      .focus()
      .should("be.focused");

    cy.realPress("Space");
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("be.visible");
    cy.findByRole("combobox").should("be.focused");

    cy.realPress("Escape");
    cy.findByRole("button", { name: /Open Filters overflow\./i }).should(
      "be.focused",
    );

    setFixtureWidth(760);
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("not.exist");

    cy.findByRole("combobox").focus().should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Filters" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Export" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "Filters" }).should("be.focused");
    cy.realPress("ArrowLeft");
    cy.findByRole("combobox").should("be.focused");
  });

  it("preserves focused overflow panel control when its tray returns to the toolbar", () => {
    cy.mount(<NamedOverflowFocusReentryTestCase />);

    cy.findByRole("button", { name: /Open Filters overflow\./i }).should(
      "be.visible",
    );
    cy.findByRole("button", { name: /Open Filters overflow\./i })
      .focus()
      .should("be.focused");

    cy.realPress("Space");
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("be.visible");
    cy.findByRole("combobox").should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Filters" }).should("be.focused");

    setFixtureWidth(760);
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("not.exist");

    cy.findByTestId("toolbar-before").focus();
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Filters" }).should("be.focused");
  });

  it("keeps the portaled overflow panel inside the viewport", () => {
    cy.viewport(430, 500);
    cy.mount(<KeyboardOverflowFixture width={260} />);

    cy.findByRole("button", { name: /Open Actions overflow\./i }).click();
    cy.findByRole("toolbar", { name: "Actions overflow" }).should("be.visible");

    cy.get("html").should(($html) => {
      const { clientWidth, scrollWidth } = $html[0];
      expect(scrollWidth).to.equal(clientWidth);
    });
  });

  it("preserves focus inside an open overflow panel across parent re-renders", () => {
    cy.mount(<KeyboardOverflowRerenderFixture width={260} />);

    cy.findByRole("button", { name: /Open Actions overflow\./i }).click();
    cy.findByRole("toolbar", { name: "Actions overflow" }).should("be.visible");
    cy.findByRole("button", { name: "Export" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Re-render 0" }).should("be.focused");

    cy.findByRole("button", { name: "Re-render 0" }).click();
    cy.findByRole("button", { name: "Re-render 1" }).should("be.focused");
    cy.findByRole("button", { name: "Export" }).should("not.be.focused");
  });

  it("uses visual ordering for horizontal navigation in RTL", () => {
    cy.mount(<KeyboardRtlFixture />);

    cy.findByTestId("toolbar-before").focus();
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Columns" }).should("be.focused");
    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "Status" }).should("be.focused");
    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "Run" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Status" }).should("be.focused");
  });
});
