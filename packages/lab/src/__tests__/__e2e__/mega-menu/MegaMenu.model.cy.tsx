import { Button, FlexLayout, Link } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuGroup,
  MegaMenuGroups,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuPanel,
  MegaMenuSupportingActions,
  MegaMenuSupportingContent,
  MegaMenuTrigger,
} from "@salt-ds/lab";
import { useState } from "react";
// `getModel` is imported directly from source (not exported from the package):
// the navigation model is derived purely from the open panel's DOM, so the test
// asserts the model that real rendered fixtures produce — no probe component.
import { getModel } from "../../../mega-menu/megaMenuModel";

/**
 * Asserts the document-position navigation model. The model is a pure function
 * of the panel DOM, so these assertions also prove that groups, custom regions,
 * orphan items and dynamic mounts all resolve to the correct columns/order.
 */

const Groups = () => (
  <MegaMenuGroups>
    <MegaMenuGroup>
      <MegaMenuHeader>Financial services</MegaMenuHeader>
      <MegaMenuItem href="/digital-banking" onClick={(e) => e.preventDefault()}>
        Digital banking
      </MegaMenuItem>
      <MegaMenuItem href="/risk-management" onClick={(e) => e.preventDefault()}>
        Risk management
      </MegaMenuItem>
    </MegaMenuGroup>
    <MegaMenuGroup>
      <MegaMenuHeader>Healthcare</MegaMenuHeader>
      <MegaMenuItem
        href="/patient-management"
        onClick={(e) => e.preventDefault()}
      >
        Patient management
      </MegaMenuItem>
      <MegaMenuItem href="/telemedicine" onClick={(e) => e.preventDefault()}>
        Telemedicine
      </MegaMenuItem>
    </MegaMenuGroup>
  </MegaMenuGroups>
);

const Actions = () => (
  <FlexLayout gap={3}>
    <MegaMenuSupportingActions>
      <Link href="#book" onClick={(e) => e.preventDefault()}>
        Book a demo
      </Link>
    </MegaMenuSupportingActions>
    <MegaMenuSupportingActions>
      <Link href="#support" onClick={(e) => e.preventDefault()}>
        Support center
      </Link>
    </MegaMenuSupportingActions>
  </FlexLayout>
);

const SupportingContent = () => (
  <MegaMenuSupportingContent>
    <FlexLayout direction="column" gap={2}>
      {/* a non-focusable element that must be excluded from the model */}
      <img alt="Featured" src="/img/examples/image-skeleton.png" width={40} />
      <Link href="#guidelines" onClick={(e) => e.preventDefault()}>
        View guidelines
      </Link>
    </FlexLayout>
  </MegaMenuSupportingContent>
);

const NormalMegaMenu = () => (
  <MegaMenu defaultOpen>
    <MegaMenuTrigger>
      <Button>Normal</Button>
    </MegaMenuTrigger>
    <MegaMenuPanel>
      <Groups />
    </MegaMenuPanel>
  </MegaMenu>
);

const ContentOnRightMegaMenu = () => (
  <MegaMenu defaultOpen>
    <MegaMenuTrigger>
      <Button>Content on right</Button>
    </MegaMenuTrigger>
    <MegaMenuPanel>
      {/* arbitrary consumer wrapper div */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Groups />
        <Actions />
      </div>
      <SupportingContent />
    </MegaMenuPanel>
  </MegaMenu>
);

const ContentOnLeftMegaMenu = () => (
  <MegaMenu defaultOpen>
    <MegaMenuTrigger>
      <Button>Content on left</Button>
    </MegaMenuTrigger>
    <MegaMenuPanel>
      <SupportingContent />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Groups />
        <Actions />
      </div>
    </MegaMenuPanel>
  </MegaMenu>
);

// Assert the model via `.should(callback)` so the model read RETRIES until it
// matches — the model is a live DOM read, so after a dynamic mount the new
// column appears on a subsequent React commit.
function assertModel(expected: string[][]) {
  cy.get(".saltMegaMenuPanel", { timeout: 8000 }).should(([panel]) => {
    const model = getModel(panel as HTMLElement).map((column) =>
      column.map((el) => (el.textContent ?? "").replace(/\s+/g, " ").trim()),
    );
    expect(model).to.deep.equal(expected);
  });
}

describe("Given a MegaMenu's navigation model", () => {
  it("orders a normal multi-group panel into columns in group order", () => {
    cy.mount(<NormalMegaMenu />);
    assertModel([
      ["Digital banking", "Risk management"],
      ["Patient management", "Telemedicine"],
    ]);
  });

  it("places a content-on-RIGHT custom region as the LAST column", () => {
    cy.mount(<ContentOnRightMegaMenu />);
    assertModel([
      ["Digital banking", "Risk management"],
      ["Patient management", "Telemedicine"],
      ["Book a demo"],
      ["Support center"],
      ["View guidelines"], // custom-region focusable, last; non-focusable img excluded
    ]);
  });

  it("places a content-on-LEFT custom region as the FIRST column", () => {
    cy.mount(<ContentOnLeftMegaMenu />);
    assertModel([
      ["View guidelines"], // custom-region focusable, first
      ["Digital banking", "Risk management"],
      ["Patient management", "Telemedicine"],
      ["Book a demo"],
      ["Support center"],
    ]);
  });

  it("interleaves an orphan item by document position", () => {
    const Orphan = () => (
      <MegaMenu defaultOpen>
        <MegaMenuTrigger>
          <Button>Orphan</Button>
        </MegaMenuTrigger>
        <MegaMenuPanel>
          <Groups />
          {/* MegaMenuItem rendered outside any column */}
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            <MegaMenuItem href="/see-all" onClick={(e) => e.preventDefault()}>
              See all solutions
            </MegaMenuItem>
          </ol>
        </MegaMenuPanel>
      </MegaMenu>
    );
    cy.mount(<Orphan />);
    assertModel([
      ["Digital banking", "Risk management"],
      ["Patient management", "Telemedicine"],
      ["See all solutions"], // orphan as its own column, at its position
    ]);
  });

  it("excludes a non-focusable item (an <a> without href)", () => {
    const MixedFocusability = () => (
      <MegaMenu defaultOpen>
        <MegaMenuTrigger>
          <Button>Mixed</Button>
        </MegaMenuTrigger>
        <MegaMenuPanel>
          <MegaMenuGroups>
            <MegaMenuGroup>
              <MegaMenuHeader>Group</MegaMenuHeader>
              {/* No href and no render — not focusable, excluded. */}
              <MegaMenuItem>Non Focusable</MegaMenuItem>
              <MegaMenuItem href="/x" onClick={(e) => e.preventDefault()}>
                Digital banking
              </MegaMenuItem>
            </MegaMenuGroup>
          </MegaMenuGroups>
        </MegaMenuPanel>
      </MegaMenu>
    );
    cy.mount(<MixedFocusability />);
    assertModel([["Digital banking"]]);
  });

  it("treats a render-prop item (e.g. a router Link) as the focusable target", () => {
    const RenderProp = () => (
      <MegaMenu defaultOpen>
        <MegaMenuTrigger>
          <Button>Render</Button>
        </MegaMenuTrigger>
        <MegaMenuPanel>
          <MegaMenuGroups>
            <MegaMenuGroup>
              <MegaMenuHeader>Group</MegaMenuHeader>
              <MegaMenuItem
                render={
                  <a href="/x" data-custom-link="">
                    Custom link
                  </a>
                }
                onClick={(e) => e.preventDefault()}
              >
                Custom link
              </MegaMenuItem>
            </MegaMenuGroup>
          </MegaMenuGroups>
        </MegaMenuPanel>
      </MegaMenu>
    );
    cy.mount(<RenderProp />);
    assertModel([["Custom link"]]);
  });

  it("reflects a column mounting/unmounting at the right position (live DOM)", () => {
    const Dynamic = () => {
      const [showExtra, setShowExtra] = useState(false);
      return (
        <>
          {/* Toggle lives OUTSIDE the panel so it is not part of the model;
              `open` is forced so the outside click does not dismiss the panel. */}
          <button type="button" onClick={() => setShowExtra((s) => !s)}>
            toggle
          </button>
          <MegaMenu open>
            <MegaMenuTrigger>
              <Button>Dynamic</Button>
            </MegaMenuTrigger>
            <MegaMenuPanel>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuHeader>One</MegaMenuHeader>
                  <MegaMenuItem href="/a" onClick={(e) => e.preventDefault()}>
                    A
                  </MegaMenuItem>
                </MegaMenuGroup>
                {showExtra && (
                  <MegaMenuGroup>
                    <MegaMenuHeader>Mid</MegaMenuHeader>
                    <MegaMenuItem href="/m" onClick={(e) => e.preventDefault()}>
                      M
                    </MegaMenuItem>
                  </MegaMenuGroup>
                )}
                <MegaMenuGroup>
                  <MegaMenuHeader>Two</MegaMenuHeader>
                  <MegaMenuItem href="/b" onClick={(e) => e.preventDefault()}>
                    B
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuPanel>
          </MegaMenu>
        </>
      );
    };
    cy.mount(<Dynamic />);
    assertModel([["A"], ["B"]]);
    cy.findByRole("button", { name: "toggle" }).click();
    // new column inserted between the two existing ones, by document position
    assertModel([["A"], ["M"], ["B"]]);
    cy.findByRole("button", { name: "toggle" }).click();
    assertModel([["A"], ["B"]]);
  });
});
