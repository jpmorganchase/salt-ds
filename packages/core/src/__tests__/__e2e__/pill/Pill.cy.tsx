import { Pill } from "@jpmorganchase/uitk-core";
import { CallIcon } from "@jpmorganchase/uitk-icons";

/**
 * Changes applied to the tests after copy over
 *
 * - All snapshot tests are skipped
 * - New API `clickable` `deletable` or variant="x" is added to the relavent test
 * - Remove `classes={{ active: 'foo' }}` for '.Pill-active'
 * - Use event.key instead of 'keycode' for events
 * - Use userEvent.type instead of fireEvent.keyDown
 */

describe("GIVEN a Pill", () => {
  it("THEN should call onClick when Pill is clicked", () => {
    const clickSpy = cy.stub().as("clickSpy");
    cy.mount(<Pill label="label" onClick={clickSpy} />);
    cy.findByRole("button").click();
    cy.get("@clickSpy").should("have.callCount", 1);
  });

  it("THEN should ignore onClick when both onClick and onDelete are passed as props", () => {
    const clickSpy = cy.stub().as("clickSpy");
    const deleteSpy = cy.stub().as("deleteSpy");
    cy.mount(
      <Pill
        label="label"
        variant="closable"
        onClick={clickSpy}
        onDelete={deleteSpy}
      />
    );
    cy.findByRole("button").click();
    cy.get("@clickSpy").should("have.callCount", 0);
  });

  it("THEN clicking the pill should not trigger onDelete", () => {
    const deleteSpy = cy.stub().as("deleteSpy");
    cy.mount(<Pill label="label" variant="closable" onDelete={deleteSpy} />);
    cy.findByRole("button").click();
    cy.get("@deleteSpy").should("have.callCount", 0);
  });

  it("THEN should call onClick when Enter is pressed", () => {
    const clickSpy = cy.stub().as("clickSpy");
    cy.mount(<Pill label="label" onClick={clickSpy} />);
    cy.findByRole("button").focus();
    cy.realPress("{enter}");
    cy.get("@clickSpy").should("have.callCount", 1);
  });

  it("THEN should call onClick when Space is pressed", () => {
    const clickSpy = cy.stub().as("clickSpy");
    cy.mount(<Pill label="label" onClick={clickSpy} />);
    cy.findByRole("button").focus();
    cy.realPress(" ");
    cy.get("@clickSpy").should("have.callCount", 1);
  });

  (["Enter", " "] as const).forEach((key) => {
    it(`THEN should apply the keyboard active class when clickable and "${key}" is held down`, () => {
      cy.mount(<Pill label="label" />);
      cy.findByRole("button").focus().trigger("keydown", { key });
      cy.findByRole("button").should("have.class", "uitkPill-active");
    });
  });

  (["Delete", "Backspace"] as const).forEach((key) => {
    it(`THEN should NOT apply the keyboard active class when clickable and "${key}" is held down`, () => {
      cy.mount(<Pill label="label" />);
      cy.findByRole("button").focus().trigger("keydown", { key });

      cy.findByRole("button").should("not.have.class", "uitkPill-active");
    });
  });

  it("THEN should call onDelete when Delete button is clicked", () => {
    const deleteSpy = cy.stub().as("deleteSpy");
    cy.mount(<Pill label="label" variant="closable" onDelete={deleteSpy} />);
    cy.findByTestId("pill-delete-button").click();
    cy.get("@deleteSpy").should("have.callCount", 1);
  });

  it("THEN should call onDelete when Enter is pressed", () => {
    const deleteSpy = cy.stub().as("deleteSpy");
    cy.mount(<Pill label="label" variant="closable" onDelete={deleteSpy} />);
    cy.findByRole("button").focus();
    cy.realPress("{enter}");
    cy.get("@deleteSpy").should("have.callCount", 1);
  });

  (["{del}", "{backspace}"] as const).forEach((key) => {
    it(`THEN should call onDelete when ${key} is pressed`, () => {
      const deleteSpy = cy.stub().as("deleteSpy");
      cy.mount(<Pill label="label" variant="closable" onDelete={deleteSpy} />);
      cy.findByRole("button").focus();
      cy.realPress(key);
      cy.get("@deleteSpy").should("have.callCount", 1);
    });
  });

  (["Enter", "Delete", "Backspace"] as const).forEach((key) => {
    it(`THEN should apply the keyboard active class when deletable and ${key} is held down`, () => {
      cy.mount(<Pill label="label" variant="closable" />);
      cy.findByRole("button").focus().trigger("keydown", { key });
      cy.findByRole("button").should("have.class", "uitkPill-active");
    });
  });

  it("THEN should render an icon given icon component", () => {
    cy.mount(<Pill icon={<CallIcon />} label="label" />);
    cy.findByTestId(/CallIcon/i).should("exist");
  });

  it("SHOULD have no a11y violations on load", () => {
    cy.mount(<Pill label="label" />);
    cy.checkAxeComponent();
  });
});
