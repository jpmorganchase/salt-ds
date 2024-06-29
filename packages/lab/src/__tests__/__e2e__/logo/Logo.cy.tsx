import { Text } from "@salt-ds/core";
import { Logo, LogoImage, LogoSeparator } from "@salt-ds/lab";

describe("GIVEN a logo", () => {
  const appTitle = "Test App Title";
  const src = "test-src.svg";

  it("renders an image", () => {
    cy.mount(
      <Logo>
        <LogoImage src={src} alt="Logo image" />
        <Text>{appTitle}</Text>
      </Logo>,
    );
    cy.get("img").should("exist");
  });

  it("renders a separator", () => {
    cy.mount(
      <Logo>
        <LogoImage src={src} alt="Logo image" />
        <LogoSeparator />
        <Text>{appTitle}</Text>
      </Logo>,
    );
    cy.get(".saltLogoSeparator").should("exist");
  });

  it("renders an appTitle", () => {
    cy.mount(
      <Logo>
        <LogoImage src={src} alt="Logo image" />
        <Text>{appTitle}</Text>
      </Logo>,
    );
    cy.findByText(appTitle).should("exist");
  });

  it("rendering text instead of image", () => {
    cy.mount(
      <Logo>
        <Text>{src}</Text>
        <LogoSeparator />
        <Text>{appTitle}</Text>
      </Logo>,
    );
    cy.findByText(src).should("exist");
    cy.get(".saltLogoSeparator").should("exist");
  });
});
