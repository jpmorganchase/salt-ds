import {
  Button,
  Dialog,
  DialogContent,
  Link,
  List,
  ListItem,
  ListItemAction,
  ListItemActions,
  ListItemContent,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
} from "@salt-ds/core";
import { DocumentIcon } from "@salt-ds/icons";
import {
  type ComponentPropsWithoutRef,
  createRef,
  forwardRef,
  useState,
} from "react";

const RouterLink = forwardRef<
  HTMLAnchorElement,
  Omit<ComponentPropsWithoutRef<"a">, "href"> & { to: string }
>(function RouterLink({ to, ...rest }, ref) {
  return <a {...rest} href={to} ref={ref} />;
});

function FormExample({ renderSubmit = false }: { renderSubmit?: boolean }) {
  const [submissions, setSubmissions] = useState(0);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmissions((count) => count + 1);
      }}
    >
      <List>
        <ListItem>
          <ListItemAction
            render={renderSubmit ? <button type="submit" /> : undefined}
          >
            <ListItemContent>Run report</ListItemContent>
          </ListItemAction>
        </ListItem>
      </List>
      <output aria-label="Submission count">{submissions}</output>
    </form>
  );
}

function DialogExample({ onOpenChange }: { onOpenChange: () => void }) {
  const [open, setOpen] = useState(true);

  return (
    <Dialog
      initialFocus={0}
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange();
        setOpen(nextOpen);
      }}
    >
      <DialogContent>
        <List aria-label="Dialog reports">
          <ListItem>
            <ListItemAction>
              <ListItemContent>Open dialog report</ListItemContent>
            </ListItemAction>
            <ListItemActions>
              <Button aria-label="More dialog report actions" />
            </ListItemActions>
          </ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
}

function OverlayExample({ onOpenChange }: { onOpenChange: () => void }) {
  const [open, setOpen] = useState(true);

  return (
    <Overlay
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange();
        setOpen(nextOpen);
      }}
    >
      <OverlayTrigger>
        <Button>Show reports</Button>
      </OverlayTrigger>
      <OverlayPanel>
        <OverlayPanelContent>
          <List aria-label="Overlay reports">
            <ListItem>
              <ListItemAction>
                <ListItemContent>Open overlay report</ListItemContent>
              </ListItemAction>
              <ListItemActions>
                <Button aria-label="More overlay report actions" />
              </ListItemActions>
            </ListItem>
          </List>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
}

describe("List", () => {
  it("renders native unordered and ordered list structures", () => {
    const unorderedRef = createRef<HTMLUListElement>();
    const orderedRef = createRef<HTMLUListElement>();

    cy.mount(
      <>
        <List className="reports" data-list="unordered" ref={unorderedRef}>
          <ListItem>Unordered item</ListItem>
        </List>
        <List
          data-list="ordered"
          data-source="list"
          ref={orderedRef}
          render={
            <ol className="ordered-render" data-source="render" start={2} />
          }
        >
          <ListItem>Ordered item</ListItem>
        </List>
      </>,
    );

    cy.get('ul[data-list="unordered"]')
      .should("have.class", "saltList")
      .and("have.class", "reports")
      .children("li")
      .should("have.length", 1);
    cy.get('ol[data-list="ordered"]')
      .should("have.attr", "start", "2")
      .and("have.attr", "data-source", "render")
      .and("have.class", "saltList")
      .and("have.class", "ordered-render")
      .children("li")
      .should("have.length", 1);
    cy.then(() => {
      expect(unorderedRef.current?.tagName).to.equal("UL");
      expect(orderedRef.current?.tagName).to.equal("OL");
    });
  });

  it("passes complete root props to a callback render", () => {
    const listRef = createRef<HTMLUListElement>();
    const renderSpy = cy.stub().as("listRender");

    cy.mount(
      <List
        aria-label="Ordered reports"
        className="reports"
        data-list="callback"
        ref={listRef}
        render={(props) => {
          renderSpy(props);
          return <ol {...props} data-render="callback" />;
        }}
      >
        <ListItem>First report</ListItem>
      </List>,
    );

    cy.findByRole("list", { name: "Ordered reports" })
      .should("match", "ol")
      .and("have.class", "saltList")
      .and("have.class", "reports")
      .and("have.attr", "data-list", "callback")
      .and("have.attr", "data-render", "callback")
      .children("li")
      .should("have.length", 1);
    cy.get("@listRender").should("have.been.calledWithMatch", {
      "aria-label": "Ordered reports",
      className: Cypress.sinon.match.string,
      children: Cypress.sinon.match.any,
      ref: Cypress.sinon.match.object,
    });
    cy.then(() => {
      expect(listRef.current?.tagName).to.equal("OL");
    });
  });

  it("keeps passive rows structural and out of the tab order", () => {
    cy.mount(
      <List aria-label="Reports">
        <ListItem>
          <ListItemContent>Quarterly report</ListItemContent>
        </ListItem>
      </List>,
    );

    cy.findByRole("list", { name: "Reports" }).should("exist");
    cy.findAllByRole("listitem").should("have.length", 1);
    cy.get("ul, li").should("not.have.attr", "tabindex");
    cy.get(
      '[role="menu"], [role="listbox"], [role="option"], [role="menuitem"]',
    ).should("not.exist");
    cy.get("button, a, input, select, textarea, [tabindex]").should(
      "not.exist",
    );
  });

  it("tabs only through secondary controls in passive rows", () => {
    cy.mount(
      <List>
        <ListItem>
          <ListItemContent>Quarterly report</ListItemContent>
          <ListItemActions>
            <Button aria-label="Download quarterly report" />
            <Button aria-label="Delete quarterly report" />
          </ListItemActions>
        </ListItem>
      </List>,
    );

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Download quarterly report" }).should(
      "be.focused",
    );
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Delete quarterly report" }).should(
      "be.focused",
    );
  });

  it("uses native button activation and preserves submit overrides", () => {
    const clickSpy = cy.stub().as("primaryClick");

    cy.mount(
      <List>
        <ListItem>
          <ListItemAction onClick={clickSpy}>
            <ListItemContent>Run report</ListItemContent>
          </ListItemAction>
        </ListItem>
      </List>,
    );

    cy.findByRole("button", { name: "Run report" })
      .should("have.attr", "type", "button")
      .realClick()
      .should("be.focused");
    cy.realPress("Enter");
    cy.realPress("Space");
    cy.get("@primaryClick").should("have.callCount", 3);

    cy.mount(<FormExample />);
    cy.findByRole("button", { name: "Run report" }).realClick();
    cy.findByRole("status", { name: "Submission count" }).should(
      "have.text",
      "0",
    );

    cy.mount(<FormExample renderSubmit />);
    cy.findByRole("button", { name: "Run report" })
      .should("have.attr", "type", "submit")
      .realClick();
    cy.findByRole("status", { name: "Submission count" }).should(
      "have.text",
      "1",
    );
  });

  it("uses native link attributes and keyboard activation", () => {
    const clickSpy = cy.stub().as("linkClick");

    cy.mount(
      <List>
        <ListItem>
          <ListItemAction
            aria-current="page"
            download="quarterly.csv"
            href="#quarterly"
            onClick={(event) => {
              event.preventDefault();
              clickSpy();
            }}
            rel="noreferrer"
            target="_blank"
          >
            <ListItemContent>Open report</ListItemContent>
          </ListItemAction>
        </ListItem>
      </List>,
    );

    cy.findByRole("link", { name: "Open report" })
      .should("have.attr", "href", "#quarterly")
      .and("have.attr", "target", "_blank")
      .and("have.attr", "rel", "noreferrer")
      .and("have.attr", "download", "quarterly.csv")
      .and("have.attr", "aria-current", "page")
      .and("not.have.attr", "type");
    cy.findByRole("link", { name: "Open report" }).focus();
    cy.realPress("Enter");
    cy.get("@linkClick").should("have.callCount", 1);
    cy.realPress("Space");
    cy.get("@linkClick").should("have.callCount", 1);
  });

  it("keeps primary and secondary actions as independent siblings", () => {
    cy.mount(
      <List>
        <ListItem data-row="button">
          <ListItemAction>
            <ListItemContent>Button report</ListItemContent>
          </ListItemAction>
          <ListItemActions>
            <Button aria-label="More button report actions" />
          </ListItemActions>
        </ListItem>
        <ListItem data-row="link">
          <ListItemAction href="#link-report">
            <ListItemContent>Link report</ListItemContent>
          </ListItemAction>
          <ListItemActions>
            <Button aria-label="More link report actions" />
          </ListItemActions>
        </ListItem>
      </List>,
    );

    cy.get('[data-row="button"] > button + div').should("exist");
    cy.get('[data-row="link"] > a + div').should("exist");
    cy.get("button button, button a, a button, a a").should("not.exist");

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Button report" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("button", {
      name: "More button report actions",
    }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("link", { name: "Link report" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "More link report actions" }).should(
      "be.focused",
    );
  });

  it("keeps the row clickable around multiple secondary actions", () => {
    const primarySpy = cy.stub().as("primaryAction");
    const firstSecondarySpy = cy.stub().as("firstSecondaryAction");
    const secondSecondarySpy = cy.stub().as("secondSecondaryAction");

    cy.mount(
      <List>
        <ListItem data-clickable-row>
          <ListItemAction onClick={primarySpy}>
            <ListItemContent>Run report</ListItemContent>
          </ListItemAction>
          <ListItemActions>
            <Button aria-label="Download report" onClick={firstSecondarySpy} />
            <Button
              aria-label="More report actions"
              onClick={secondSecondarySpy}
            />
          </ListItemActions>
        </ListItem>
      </List>,
    );

    cy.get("[data-clickable-row]").then(($row) => {
      const rowRect = $row[0].getBoundingClientRect();
      const secondaryActions = $row[0].querySelectorAll(
        ".saltListItemActions > button",
      );
      const firstActionRect = secondaryActions[0].getBoundingClientRect();
      const secondActionRect = secondaryActions[1].getBoundingClientRect();

      cy.wrap($row).realClick({
        x:
          firstActionRect.right +
          (secondActionRect.left - firstActionRect.right) / 2 -
          rowRect.left,
        y: rowRect.height / 2,
      });
      cy.wrap($row).realClick({
        x: rowRect.width - 2,
        y: rowRect.height / 2,
      });
    });

    cy.get("@primaryAction").should("have.callCount", 2);
    cy.findByRole("button", { name: "More report actions" }).realClick();
    cy.get("@secondSecondaryAction").should("have.been.calledOnce");
    cy.get("@firstSecondaryAction").should("not.have.been.called");
    cy.get("@primaryAction").should("have.callCount", 2);
  });

  it("does not leak secondary activation to the primary action", () => {
    const primarySpy = cy.stub().as("primaryAction");
    const secondarySpy = cy.stub().as("secondaryAction");

    cy.mount(
      <List>
        <ListItem>
          <ListItemAction onClick={primarySpy}>
            <ListItemContent>Run report</ListItemContent>
          </ListItemAction>
          <ListItemActions>
            <Button aria-label="More report actions" onClick={secondarySpy} />
          </ListItemActions>
        </ListItem>
      </List>,
    );

    cy.findByRole("button", { name: "More report actions" })
      .realClick()
      .realPress("Enter");
    cy.get("@secondaryAction").should("have.callCount", 2);
    cy.get("@primaryAction").should("not.have.been.called");
  });

  it("disables only the primary button", () => {
    const primarySpy = cy.stub().as("disabledPrimary");
    const secondarySpy = cy.stub().as("enabledSecondary");

    cy.mount(
      <List>
        <ListItem>
          <ListItemAction disabled onClick={primarySpy}>
            <ListItemContent>Run report</ListItemContent>
          </ListItemAction>
          <ListItemActions>
            <Button aria-label="Download report" onClick={secondarySpy} />
          </ListItemActions>
        </ListItem>
      </List>,
    );

    cy.findByRole("button", { name: "Run report" })
      .should("be.disabled")
      .realClick({ position: "center" });
    cy.get("@disabledPrimary").should("not.have.been.called");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Download report" })
      .should("be.focused")
      .realClick();
    cy.get("@enabledSecondary").should("have.been.calledOnce");
  });

  it("merges JSX and callback render props for both action branches", () => {
    const buttonRef = createRef<HTMLButtonElement>();
    const linkRef = createRef<HTMLAnchorElement>();
    const routerRef = createRef<HTMLAnchorElement>();

    cy.mount(
      <List>
        <ListItem>
          <ListItemAction
            aria-label="Custom button"
            className="consumer-button"
            data-consumer="button"
            ref={buttonRef}
            render={<button className="render-button" data-render="button" />}
          >
            <ListItemContent>Button label</ListItemContent>
          </ListItemAction>
        </ListItem>
        <ListItem>
          <ListItemAction
            className="consumer-link"
            href="#jsx-link"
            ref={linkRef}
            render={
              <a className="render-link" data-render="link" href="#jsx-link" />
            }
          >
            <ListItemContent>JSX link</ListItemContent>
          </ListItemAction>
        </ListItem>
        <ListItem>
          <ListItemAction
            href="/callback-link"
            ref={routerRef}
            render={({ href, ...props }) => (
              <RouterLink {...props} data-render="router" to={href} />
            )}
          >
            <ListItemContent>Callback link</ListItemContent>
          </ListItemAction>
        </ListItem>
      </List>,
    );

    cy.findByRole("button", { name: "Custom button" })
      .should("have.class", "saltListItemAction")
      .and("have.class", "consumer-button")
      .and("have.class", "render-button")
      .and("have.attr", "data-consumer", "button")
      .and("have.attr", "data-render", "button")
      .and("contain.text", "Button label");
    cy.findByRole("link", { name: "JSX link" })
      .should("have.class", "consumer-link")
      .and("have.class", "render-link")
      .and("have.attr", "href", "#jsx-link");
    cy.findByRole("link", { name: "Callback link" })
      .should("have.attr", "href", "/callback-link")
      .and("have.attr", "data-render", "router");
    cy.then(() => {
      expect(buttonRef.current?.tagName).to.equal("BUTTON");
      expect(linkRef.current?.tagName).to.equal("A");
      expect(routerRef.current?.tagName).to.equal("A");
    });
  });

  it("forwards native props and refs to every primitive", () => {
    const listRef = createRef<HTMLUListElement>();
    const itemRef = createRef<HTMLLIElement>();
    const contentRef = createRef<HTMLSpanElement>();
    const actionRef = createRef<HTMLButtonElement>();
    const actionsRef = createRef<HTMLDivElement>();

    cy.mount(
      <List aria-label="Reports" data-ref="list" ref={listRef}>
        <ListItem aria-label="Report row" data-ref="item" ref={itemRef}>
          <ListItemAction
            aria-describedby="description"
            data-ref="action"
            ref={actionRef}
          >
            <ListItemContent
              aria-label="Report content"
              data-ref="content"
              ref={contentRef}
            >
              Quarterly report
            </ListItemContent>
          </ListItemAction>
          <ListItemActions
            aria-label="Report controls"
            data-ref="actions"
            ref={actionsRef}
            role="group"
          >
            <Button aria-label="Download report" />
          </ListItemActions>
        </ListItem>
      </List>,
    );

    cy.get('[data-ref="list"]').should("have.attr", "aria-label", "Reports");
    cy.get('[data-ref="item"]').should("have.attr", "aria-label", "Report row");
    cy.get('[data-ref="content"]').should(
      "have.attr",
      "aria-label",
      "Report content",
    );
    cy.get('[data-ref="action"]').should(
      "have.attr",
      "aria-describedby",
      "description",
    );
    cy.get('[data-ref="actions"]')
      .should("have.attr", "role", "group")
      .and("have.attr", "aria-label", "Report controls");
    cy.then(() => {
      expect(listRef.current?.tagName).to.equal("UL");
      expect(itemRef.current?.tagName).to.equal("LI");
      expect(contentRef.current?.tagName).to.equal("SPAN");
      expect(actionRef.current?.tagName).to.equal("BUTTON");
      expect(actionsRef.current?.tagName).to.equal("DIV");
    });
  });

  it("passes accessibility checks for all canonical compositions", () => {
    cy.mount(
      <List aria-label="Reports">
        <ListItem>
          <ListItemContent>Passive report</ListItemContent>
        </ListItem>
        <ListItem>
          <ListItemContent>Passive report with actions</ListItemContent>
          <ListItemActions>
            <Button aria-label="Download passive report" />
            <Button aria-label="Delete passive report" />
          </ListItemActions>
        </ListItem>
        <ListItem>
          <ListItemAction>
            <ListItemContent>Button report</ListItemContent>
          </ListItemAction>
          <ListItemActions>
            <Button aria-label="More button report actions" />
          </ListItemActions>
        </ListItem>
        <ListItem>
          <ListItemAction href="#linked-report">
            <ListItemContent>Linked report</ListItemContent>
          </ListItemAction>
          <ListItemActions>
            <Button aria-label="Download linked report" />
          </ListItemActions>
        </ListItem>
      </List>,
    );

    cy.checkAxeComponent();
  });

  it("keeps leading icons and trailing actions aligned to the first text line", () => {
    cy.mount(
      <List aria-label="Alignment examples" style={{ width: 280 }}>
        <ListItem data-alignment-row="short">
          <ListItemContent>
            <DocumentIcon aria-hidden size={2} />
            <span data-alignment-text>Short report</span>
          </ListItemContent>
          <ListItemActions>
            <Button aria-label="Short report actions" />
          </ListItemActions>
        </ListItem>
        <ListItem data-alignment-row="long">
          <ListItemContent>
            <DocumentIcon aria-hidden size={2} />
            <span data-alignment-text>
              A report label that wraps onto at least three lines without moving
              its leading icon or trailing action away from the first line
            </span>
          </ListItemContent>
          <ListItemActions>
            <Button aria-label="Long report actions" />
          </ListItemActions>
        </ListItem>
        <ListItem data-alignment-row="external">
          <ListItemAction
            href="https://example.com/reports"
            render={<Link target="_blank" />}
          >
            <ListItemContent>
              <span data-alignment-text>External report</span>
            </ListItemContent>
          </ListItemAction>
        </ListItem>
      </List>,
    );

    cy.get('[data-alignment-row="short"], [data-alignment-row="long"]').then(
      ($rows) => {
        const getMetrics = (row: HTMLElement) => {
          const rowRect = row.getBoundingClientRect();
          const iconRect = row
            .querySelector<HTMLElement>(".saltIcon")
            ?.getBoundingClientRect();
          const text = row.querySelector<HTMLElement>("[data-alignment-text]");
          const textRect = text?.getBoundingClientRect();
          const actionRect = row
            .querySelector<HTMLElement>(".saltListItemActions button")
            ?.getBoundingClientRect();

          expect(iconRect).not.to.equal(undefined);
          expect(text).not.to.equal(null);
          expect(textRect).not.to.equal(undefined);
          expect(actionRect).not.to.equal(undefined);

          const lineHeight = Number.parseFloat(
            getComputedStyle(text as HTMLElement).lineHeight,
          );

          return {
            actionCenter:
              (actionRect as DOMRect).top +
              (actionRect as DOMRect).height / 2 -
              rowRect.top,
            firstLineCenter:
              (textRect as DOMRect).top + lineHeight / 2 - rowRect.top,
            iconCenter:
              (iconRect as DOMRect).top +
              (iconRect as DOMRect).height / 2 -
              rowRect.top,
            lineHeight,
            textHeight: (textRect as DOMRect).height,
          };
        };

        const short = getMetrics($rows[0]);
        const long = getMetrics($rows[1]);

        expect(long.textHeight).to.be.greaterThan(long.lineHeight * 2);
        expect(short.iconCenter).to.be.closeTo(short.firstLineCenter, 1);
        expect(long.iconCenter).to.be.closeTo(long.firstLineCenter, 1);
        expect(short.actionCenter).to.be.closeTo(short.firstLineCenter, 1);
        expect(long.actionCenter).to.be.closeTo(long.firstLineCenter, 1);
        expect(long.iconCenter).to.be.closeTo(short.iconCenter, 1);
        expect(long.actionCenter).to.be.closeTo(short.actionCenter, 1);
      },
    );

    cy.get('[data-alignment-row="external"]').then(($row) => {
      const rowRect = $row[0].getBoundingClientRect();
      const text = $row[0].querySelector<HTMLElement>("[data-alignment-text]");
      const textRect = text?.getBoundingClientRect();
      const iconRect = $row[0]
        .querySelector<HTMLElement>(".saltLink-icon")
        ?.getBoundingClientRect();

      expect(text).not.to.equal(null);
      expect(textRect).not.to.equal(undefined);
      expect(iconRect).not.to.equal(undefined);

      const lineHeight = Number.parseFloat(
        getComputedStyle(text as HTMLElement).lineHeight,
      );
      const firstLineCenter =
        (textRect as DOMRect).top + lineHeight / 2 - rowRect.top;
      const iconCenter =
        (iconRect as DOMRect).top +
        (iconRect as DOMRect).height / 2 -
        rowRect.top;

      expect(iconCenter).to.be.closeTo(firstLineCenter, 1);
    });
  });

  it("leaves focus containment and Escape handling to Dialog and Overlay", () => {
    const dialogOpenChange = cy.stub().as("dialogOpenChange");

    cy.mount(<DialogExample onOpenChange={dialogOpenChange} />);
    cy.findByRole("dialog").should("be.visible");
    cy.findByRole("button", { name: "Open dialog report" }).should(
      "be.focused",
    );
    cy.get("ul, li").should("not.have.attr", "tabindex");
    cy.realPress("ArrowDown");
    cy.findByRole("button", { name: "Open dialog report" }).should(
      "be.focused",
    );
    cy.realPress("Tab");
    cy.findByRole("button", { name: "More dialog report actions" })
      .should("be.focused")
      .realClick();
    cy.findByRole("dialog").should("be.visible");
    cy.get("@dialogOpenChange").should("not.have.been.called");
    cy.realPress("Escape");
    cy.get("@dialogOpenChange").should("have.been.calledOnce");

    const overlayOpenChange = cy.stub().as("overlayOpenChange");
    cy.mount(<OverlayExample onOpenChange={overlayOpenChange} />);
    cy.findByRole("dialog").should("be.visible");
    cy.findByRole("button", { name: "Open overlay report" }).should(
      "be.focused",
    );
    cy.realPress("ArrowDown");
    cy.findByRole("button", { name: "Open overlay report" }).should(
      "be.focused",
    );
    cy.realPress("Tab");
    cy.findByRole("button", { name: "More overlay report actions" })
      .should("be.focused")
      .realClick();
    cy.findByRole("dialog").should("be.visible");
    cy.get("@overlayOpenChange").should("not.have.been.called");
    cy.realPress("Escape");
    cy.get("@overlayOpenChange").should("have.been.calledOnce");
    cy.findByRole("button", { name: "Show reports" }).should("be.focused");
  });
});
