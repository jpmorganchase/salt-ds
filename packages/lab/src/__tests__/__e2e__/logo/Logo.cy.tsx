import { Logo } from "@salt-ds/lab";
import { LogoImage, LogoTitle } from "packages/lab/src/logo";

const CustomLogoImage = ({ src }: any) => <div>{src}</div>;

describe("GIVEN a logo", () => {
  const appTitle = "Test App Title";
  const src = "test-src.svg";

  it("renders an image", () => {
    cy.mount(
      <Logo
      // LogoImageComponent={CustomLogoImage}
      >
        <LogoImage src={src} />
        <LogoTitle>{appTitle}</LogoTitle>
      </Logo>
    );
    cy.get("img").should("exist");
  });

  it("renders an appTitle", () => {
    cy.mount(
      <Logo
      // LogoImageComponent={CustomLogoImage}
      >
        <LogoImage src={src} />

        <LogoTitle>{appTitle}</LogoTitle>
      </Logo>
    );
    cy.findByText(appTitle).should("exist");
  });
});
