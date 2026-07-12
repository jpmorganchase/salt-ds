import { Spinner } from "@salt-ds/core";
import { type ComponentProps, useState } from "react";

const ariaLabel = "Loading component";

function SpinnerHarness(props: ComponentProps<typeof Spinner>) {
  const [showSpinner, setShowSpinner] = useState(true);

  return (
    <>
      <button onClick={() => setShowSpinner(false)}>Unmount spinner</button>
      {showSpinner ? <Spinner {...props} /> : null}
    </>
  );
}

describe("GIVEN a Spinner", () => {
  it("THEN it should render with the correct default ARIA attributes", () => {
    cy.mount(<Spinner />);

    cy.findByRole("img", { name: "loading" }).should("exist");
  });

  it("THEN it should render with a custom ARIA label", () => {
    cy.mount(<Spinner aria-label="loading settings panel" />);

    cy.findByRole("img", { name: "loading settings panel" }).should("exist");
  });

  it("THEN the announcer should be called with aria-label", () => {
    cy.mount(<Spinner aria-label={ariaLabel} />);

    cy.findByRole("img").should("announce", ariaLabel);
  });
});

describe("GIVEN an available announcer", () => {
  it("THEN the announcer should be called with aria-label every 5 seconds", () => {
    cy.clock();
    cy.mount(<Spinner aria-label={ariaLabel} />);

    cy.findByRole("img").should("announce", ariaLabel);
    cy.tick(5000);

    cy.findByRole("img").should("announce", ariaLabel);
  });

  it("THEN the announcer should be called once when the component unmounts", () => {
    cy.clock();
    cy.mount(
      <SpinnerHarness
        aria-label={ariaLabel}
        announcerInterval={1000}
        announcerTimeout={2000}
      />,
    );

    cy.findByRole("img").should("announce", ariaLabel);
    cy.tick(1000);
    cy.get("body").should("announce", ariaLabel);
    cy.tick(1000);
    cy.get("body").should("announce", ariaLabel);
    cy.tick(1000);
    cy.get("body").should(
      "announce",
      `${ariaLabel} is still in progress, but will no longer announce.`,
    );
    cy.tick(300);

    cy.findByRole("button", { name: "Unmount spinner" }).click();
    cy.get("body").should("announce", `finished ${ariaLabel}`);
    cy.tick(300);
    cy.get("body").should("not.announce", `finished ${ariaLabel}`);

    cy.tick(25000);
    cy.get("body").should("not.announce", ariaLabel);
  });

  it("THEN nothing should be announced when announcer is disabled", () => {
    cy.clock();
    cy.mount(<SpinnerHarness aria-label={ariaLabel} disableAnnouncer />);

    cy.get("body").should("not.announce", ariaLabel);
    cy.findByRole("button", { name: "Unmount spinner" }).click();
    cy.get("body").should("not.announce", `finished ${ariaLabel}`);

    cy.tick(25000);
    cy.get("body").should("not.announce", ariaLabel);
  });

  it("THEN it should not announce completion message when set to null", () => {
    cy.clock();
    cy.mount(
      <SpinnerHarness
        aria-label={ariaLabel}
        completionAnnouncement={null}
      />,
    );

    cy.findByRole("img").should("announce", ariaLabel);
    cy.findByRole("button", { name: "Unmount spinner" }).click();
    cy.get("body").should("not.announce", `finished ${ariaLabel}`);

    cy.tick(25000);
    cy.get("body").should("not.announce", ariaLabel);
  });
});
