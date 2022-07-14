import {
  useAriaAnnouncer,
  AriaAnnouncerProvider,
} from "@jpmorganchase/uitk-core";
import { ContentStatus } from "@jpmorganchase/uitk-lab";

describe("GIVEN Content Status", () => {
  it("renders the info status with NO title AND NO message and NO actions WHEN no props are passed", () => {
    cy.mount(<ContentStatus id="1" />);

    cy.findByRole("region").should("not.exist"); // the content
    cy.findByTestId("InfoIcon").should("exist");
  });

  it("renders the spinner WHEN the LOADING status is passed", () => {
    cy.get('[aria-live="assertive"]').should("not.exist");

    cy.mount(
      <AriaAnnouncerProvider>
        <ContentStatus id="1" status="loading" />
      </AriaAnnouncerProvider>
    );

    cy.findByRole("region").should("not.exist"); // the content
    cy.findByTestId("spinner-1").should("exist");

    cy.get('[aria-live="assertive"]').should("contain", "loading");
  });

  it("renders the correct icon WHEN the WARNING status is passed", () => {
    cy.mount(
      <AriaAnnouncerProvider>
        <ContentStatus id="1" status="warning" />
      </AriaAnnouncerProvider>
    );

    cy.findByRole("region").should("not.exist"); // the content
    cy.findByTestId("WarningIcon").should("exist");

    cy.get('[aria-live="assertive"]').should("contain", "warning");
  });

  it("renders the correct icon WHEN the ERROR status is passed", () => {
    cy.mount(
      <AriaAnnouncerProvider>
        <ContentStatus id="1" status="error" />
      </AriaAnnouncerProvider>
    );

    cy.findByRole("region").should("not.exist"); // the content
    cy.findByTestId("ErrorIcon").should("exist");

    cy.get('[aria-live="assertive"]').should("contain", "error");
  });

  it("renders the correct icon WHEN the SUCCESS status is passed", () => {
    cy.mount(
      <AriaAnnouncerProvider>
        <ContentStatus id="1" status="success" />
      </AriaAnnouncerProvider>
    );

    cy.findByRole("region").should("not.exist"); // the content
    cy.findByTestId("SuccessIcon").should("exist");

    cy.get('[aria-live="assertive"]').should("contain", "success");
  });

  it("renders the correct title WHEN it is passed", () => {
    cy.mount(
      <AriaAnnouncerProvider>
        <ContentStatus id="1" title="Test Title" />
      </AriaAnnouncerProvider>
    );

    cy.findByRole("region").children().should("have.length", 1);
    cy.findByText("Test Title").should("exist");
    cy.findByTestId("InfoIcon").should("exist");

    cy.get('[aria-live="assertive"]').should("contain", "Test Title info");
  });

  it("renders the correct message WHEN it is passed", () => {
    cy.mount(
      <AriaAnnouncerProvider>
        <ContentStatus id="1" message="Test message" />
      </AriaAnnouncerProvider>
    );

    cy.findByRole("region").children().should("have.length", 1);
    cy.findByText("Test message").should("exist");
    cy.findByTestId("InfoIcon").should("exist");

    cy.get('[aria-live="assertive"]').should("contain", "Test message info");
  });

  it("render default actions WHEN actionLabel and onActionClick are passed", () => {
    cy.mount(
      <AriaAnnouncerProvider>
        <ContentStatus
          actionLabel="My Label"
          id="1"
          onActionClick={cy.spy().as("onActionClickSpy")}
        />
      </AriaAnnouncerProvider>
    );

    cy.findByRole("region").children().should("have.length", 1);
    cy.findByText("My Label").should("exist");
    cy.findByTestId("InfoIcon").should("exist");

    cy.findByText("My Label").click();
    cy.get("@onActionClickSpy").should("have.been.calledOnce");

    cy.get('[aria-live="assertive"]').should("contain", "info");
  });

  it("DOES NOT render actions WHEN actionLabel IS NOT passed", () => {
    cy.mount(
      <ContentStatus id="1" onActionClick={cy.spy().as("onActionClickSpy")} />
    );

    cy.findByRole("region").should("not.exist");
    cy.findByText("My Label").should("not.exist");
    cy.findByTestId("InfoIcon").should("exist");

    cy.get("@onActionClickSpy").should("not.have.been.called");
  });

  it("DOES NOT render actions WHEN onActionClick IS NOT passed", () => {
    cy.mount(<ContentStatus actionLabel="My Label" id="1" />);

    cy.findByRole("region").should("not.exist");
    cy.findByText("My Label").should("not.exist");
    cy.findByTestId("InfoIcon").should("exist");
  });

  it("render children as actions WHEN they are passed", () => {
    cy.mount(
      <ContentStatus id="1">
        <div>Test Children</div>
      </ContentStatus>
    );

    cy.findByRole("region").children().should("have.length", 1);
    cy.findByText("Test Children").should("exist");
    cy.findByTestId("InfoIcon").should("exist");
  });

  it("buttonRef callback function is called WHEN the button is mounted", () => {
    cy.mount(
      <ContentStatus
        actionLabel="My Label"
        buttonRef={cy.spy().as("buttonRefSpy")}
        id="1"
        onActionClick={cy.spy().as("onActionClickSpy")}
      />
    );

    cy.findByRole("region").children().should("have.length", 1);
    cy.get("button").should("exist");
    cy.findByTestId("InfoIcon").should("exist");

    cy.get("@buttonRefSpy").should("have.been.calledOnce");
  });

  it("announces when new prop is passed in", () => {
    cy.mount(
      <AriaAnnouncerProvider>
        <ContentStatus id="1" status="loading" />
      </AriaAnnouncerProvider>
    );

    cy.get('[aria-live="assertive"]').should("announce", "loading");

    cy.mount(
      <AriaAnnouncerProvider>
        <ContentStatus id="1" status="success" />
      </AriaAnnouncerProvider>
    );

    // Disabled completion announcement from spinner
    cy.get('[aria-live="assertive"]').should(
      "not.announce",
      "finished loading"
    );
    cy.get('[aria-live="assertive"]').should("contain", "success");
  });

  it("disableAnnouncer will disable the announcement", () => {
    cy.mount(
      <AriaAnnouncerProvider>
        <ContentStatus disableAnnouncer id="1" status="loading" />
      </AriaAnnouncerProvider>
    );

    cy.get('[aria-live="assertive"]').should("not.announce", "loading");
  });

  /* TODO: custom ariaLabel prop removed causing issues here */
  xdescribe("indeterminate loading", () => {
    it("props from spinner can be customized", () => {
      const ariaLabel = "Loading component";

      cy.mount(
        <AriaAnnouncerProvider>
          <ContentStatus
            SpinnerProps={{ "aria-label": ariaLabel, announcerInterval: 2000 }}
            status="loading"
          />
        </AriaAnnouncerProvider>
      );

      cy.wait(2500);

      cy.get('[aria-live="assertive"]').should("contain", "Loading component");
    });
  });
});
