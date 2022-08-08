import { Link } from "@jpmorganchase/uitk-lab";

describe("GIVEN a link", () => {
  it("WHEN passed children node, THEN children should be rendered", () => {
    const testId = "children-testid";
    cy.mount(
      <Link href="#root" data-testid={testId}>
        hello world
      </Link>
    );
    cy.findByTestId(testId).should("exist");
  });

  it('WHEN passed target="_blank", THEN should render the Link with the tear out icon', () => {
    cy.mount(
      <Link href="#root" target="_blank">
        Action
      </Link>
    );

    cy.findByTestId(/TearOutIcon/i).should("exist");
  });

  it("WHEN passed disabled prop, THEN should render the Link with disabled class", () => {
    const testid = "disabled-link";
    cy.mount(
      <Link disabled href="#root" data-testid={testid}>
        Action
      </Link>
    );

    cy.findByTestId(testid).should("have.class", "uitkLink-disabled");
  });

  describe("WHEN passed 'truncate' prop and parent width =150px", () => {
    it("THEN it should NOT truncate text and NOT show tooltip on focus/hover", () => {
      cy.mount(
        <div style={{ width: 150 }}>
          <Link truncate href="#root">
            Far far away, behind the word mountains, far from the countries
            Vokalia and Consonantia, there live the blind texts.
          </Link>
        </div>
      );

      cy.get(".uitkLink")
        .should("have.class", "uitkText-lineClamp")
        .and("not.have.css", "-webkit-line-clamp", "1");

      cy.realPress("Tab");
      cy.findByRole("tooltip").should("not.exist");

      cy.realPress("Escape");

      cy.get(".uitkText").realHover();
      cy.findByRole("tooltip").should("not.exist");
    });

    it("and maxRows=1, THEN it should truncate text and show tooltip on focus/hover", () => {
      cy.mount(
        <div style={{ width: 150 }}>
          <Link truncate maxRows={1} href="#root">
            Far far away, behind the word mountains, far from the countries
            Vokalia and Consonantia, there live the blind texts.
          </Link>
        </div>
      );

      cy.get(".uitkLink")
        .should("have.class", "uitkText-lineClamp")
        .and("have.css", "-webkit-line-clamp", "1");

      cy.realPress("Tab");
      cy.findByRole("tooltip").should("be.visible");

      cy.realPress("Escape");

      cy.get(".uitkLink").realHover();
      cy.findByRole("tooltip").should("be.visible");
    });

    it("and parent height = 20px, THEN it should truncate text and show tooltip on focus/hover", () => {
      cy.mount(
        <div style={{ width: 150, height: 20 }}>
          <Link truncate href="#root">
            Far far away, behind the word mountains, far from the countries
            Vokalia and Consonantia, there live the blind texts.
          </Link>
        </div>
      );

      cy.get(".uitkLink")
        .should("have.class", "uitkText-lineClamp")
        .and("have.css", "-webkit-line-clamp", "1");

      cy.realPress("Tab");
      cy.findByRole("tooltip").should("be.visible");

      cy.realPress("Escape");

      cy.get(".uitkLink").realHover();
      cy.findByRole("tooltip").should("be.visible");
    });
  });

  describe("WHEN passed 'truncate' prop", () => {
    it("THEN it should NOT truncate text and NOT show tooltip on focus/hover", () => {
      cy.mount(
        <Link truncate href="#root">
          Far far away, behind the word mountains, far from the countries
          Vokalia and Consonantia, there live the blind texts.
        </Link>
      );

      cy.get(".uitkLink")
        .should("have.class", "uitkText-lineClamp")
        .and("have.css", "-webkit-line-clamp", "none");

      cy.realPress("Tab");
      cy.findByRole("tooltip").should("not.exist");

      cy.realPress("Escape");

      cy.get(".uitkText").realHover();
      cy.findByRole("tooltip").should("not.exist");
    });

    it("and maxRows=1, THEN it should NOT truncate text and NOT show tooltip on focus/hover", () => {
      cy.mount(
        <Link truncate maxRows={1} href="#root">
          Far far away, behind the word mountains, far from the countries
          Vokalia and Consonantia, there live the blind texts.
        </Link>
      );

      cy.get(".uitkLink")
        .should("have.class", "uitkText-lineClamp")
        .and("have.css", "-webkit-line-clamp", "none");

      cy.realPress("Tab");
      cy.findByRole("tooltip").should("not.exist");

      cy.realPress("Escape");

      cy.get(".uitkText").realHover();
      cy.findByRole("tooltip").should("not.exist");
    });
  });
});
