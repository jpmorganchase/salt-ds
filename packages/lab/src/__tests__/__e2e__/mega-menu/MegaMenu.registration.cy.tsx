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
// Probe imported directly from source — never exported from the package.
import { MegaMenuGridProbe } from "../../../mega-menu/MegaMenuGridContext";

/**
 * Asserts the declarative document-position registration model. Crucially it
 * checks that in-group items actually REGISTER (via `data-raw-items`), not
 * merely that they appear in the final model — where the scoped custom-region
 * fallback could otherwise mask a ref regression (footgun: `ItemAction` must be
 * a `forwardRef`).
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
      <MegaMenuGridProbe />
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
      <MegaMenuGridProbe />
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
      <MegaMenuGridProbe />
    </MegaMenuPanel>
  </MegaMenu>
);

function readModel(): Cypress.Chainable<string[][]> {
  return cy
    .get('[data-testid="grid-model"]', { timeout: 8000 })
    .should("have.attr", "data-model")
    .then((attr) => JSON.parse(attr as unknown as string) as string[][]);
}

function readRawItems(): Cypress.Chainable<string[]> {
  return cy
    .get('[data-testid="grid-model"]', { timeout: 8000 })
    .should("have.attr", "data-raw-items")
    .then((attr) => JSON.parse(attr as unknown as string) as string[]);
}

describe("Given a MegaMenu's registration model", () => {
  it("registers in-group items (not merely the scoped fallback)", () => {
    cy.mount(<NormalMegaMenu />);
    // The raw registration set is what proves the `forwardRef`/ref wiring works.
    // For a group column the scoped fallback would also find these links, so a
    // model-only assertion could not detect a registration regression.
    readRawItems().then((items) => {
      expect(items).to.include.members([
        "Digital banking",
        "Risk management",
        "Patient management",
        "Telemedicine",
      ]);
    });
  });

  it("orders a normal multi-group panel into columns in group order", () => {
    cy.mount(<NormalMegaMenu />);
    readModel().then((model) => {
      expect(model).to.deep.equal([
        ["Digital banking", "Risk management"],
        ["Patient management", "Telemedicine"],
      ]);
    });
  });

  it("places a content-on-RIGHT custom region as the LAST column", () => {
    cy.mount(<ContentOnRightMegaMenu />);
    readModel().then((model) => {
      expect(model).to.deep.equal([
        ["Digital banking", "Risk management"],
        ["Patient management", "Telemedicine"],
        ["Book a demo"],
        ["Support center"],
        ["View guidelines"], // custom-region focusable via scoped fallback, last
      ]);
    });
  });

  it("places a content-on-LEFT custom region as the FIRST column", () => {
    cy.mount(<ContentOnLeftMegaMenu />);
    readModel().then((model) => {
      expect(model).to.deep.equal([
        ["View guidelines"], // custom-region focusable via scoped fallback, first
        ["Digital banking", "Risk management"],
        ["Patient management", "Telemedicine"],
        ["Book a demo"],
        ["Support center"],
      ]);
    });
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
          <MegaMenuGridProbe />
        </MegaMenuPanel>
      </MegaMenu>
    );
    cy.mount(<Orphan />);
    readModel().then((model) => {
      expect(model).to.deep.equal([
        ["Digital banking", "Risk management"],
        ["Patient management", "Telemedicine"],
        ["See all solutions"], // orphan as its own column, at its position
      ]);
    });
  });

  it("registers render-prop items (e.g. a RouterLink) rather than relying on the fallback", () => {
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
          <MegaMenuGridProbe />
        </MegaMenuPanel>
      </MegaMenu>
    );
    cy.mount(<RenderProp />);
    // Must come from registration, not the column fallback query.
    readRawItems().then((items) => {
      expect(items).to.include("Custom link");
    });
    readModel().then((model) => {
      expect(model).to.deep.equal([["Custom link"]]);
    });
  });

  it("composes a consumer's own ref on the `render` element without dropping registration", () => {
    const consumerRef = cy.stub().as("consumerRef");
    const RenderPropWithRef = () => (
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
                  <a href="/x" ref={consumerRef} data-custom-link="">
                    Custom link
                  </a>
                }
                onClick={(e) => e.preventDefault()}
              >
                Custom link
              </MegaMenuItem>
            </MegaMenuGroup>
          </MegaMenuGroups>
          <MegaMenuGridProbe />
        </MegaMenuPanel>
      </MegaMenu>
    );
    cy.mount(<RenderPropWithRef />);
    // The consumer's own ref still receives the element...
    cy.get("@consumerRef").should(
      "have.been.calledWith",
      Cypress.sinon.match.instanceOf(HTMLAnchorElement),
    );
    // ...and the item still registered (our ref was not overwritten).
    readRawItems().then((items) => {
      expect(items).to.include("Custom link");
    });
  });

  it("updates the model at the right position when a column mounts/unmounts", () => {
    const Dynamic = () => {
      const [showExtra, setShowExtra] = useState(false);
      return (
        <MegaMenu defaultOpen>
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
            <button type="button" onClick={() => setShowExtra((s) => !s)}>
              toggle
            </button>
            <MegaMenuGridProbe />
          </MegaMenuPanel>
        </MegaMenu>
      );
    };
    cy.mount(<Dynamic />);
    readModel().then((model) => {
      expect(model).to.deep.equal([["A"], ["B"]]);
    });
    cy.findByRole("button", { name: "toggle" }).click();
    readModel().then((model) => {
      // new column inserted between the two existing ones, by document position
      expect(model).to.deep.equal([["A"], ["M"], ["B"]]);
    });
    cy.findByRole("button", { name: "toggle" }).click();
    readModel().then((model) => {
      expect(model).to.deep.equal([["A"], ["B"]]);
    });
  });
});
