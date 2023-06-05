import { Logo } from "@salt-ds/lab";
import { LogoImage, LogoSeparator, LogoText } from "packages/lab/src/logo";

describe("GIVEN a logo", () => {
  const appTitle = "Test App Title";
  const src = "test-src.svg";

  it("renders an image", () => {
    cy.mount(
      <Logo>
        <LogoImage src={src} />
        <LogoText>{appTitle}</LogoText>
      </Logo>
    );
    cy.get("img").should("exist");
  });

  it("renders a separator", () => {
    cy.mount(
      <Logo>
        <LogoImage src={src} />
        <LogoSeparator />
        <LogoText>{appTitle}</LogoText>
      </Logo>
    );
    cy.get(".saltLogoSeparator").should("exist");
  });

  it("renders an appTitle", () => {
    cy.mount(
      <Logo>
        <LogoImage src={src} />
        <LogoText>{appTitle}</LogoText>
      </Logo>
    );
    cy.findByText(appTitle).should("exist");
  });

  it("rendering text instead of image", () => {
    cy.mount(
      <Logo>
        <LogoText>{src}</LogoText>
        <LogoSeparator />
        <LogoText>{appTitle}</LogoText>
      </Logo>
    );
    cy.findByText(src).should("exist");
    cy.get(".saltLogoSeparator").should("exist");
  });
});
