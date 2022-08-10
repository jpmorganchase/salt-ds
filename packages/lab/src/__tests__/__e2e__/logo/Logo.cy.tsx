import { Logo } from "@jpmorganchase/uitk-lab";

const CustomLogoImage = ({ src }: any) => <div>{src}</div>;

describe("GIVEN a logo", () => {
  const appTitle = "Test App Title";
  const src = "test-src.svg";

  it("renders an image", () => {
    cy.mount(
      <Logo
        src={src}
        appTitle={appTitle}
        LogoImageComponent={CustomLogoImage}
      />
    );
    cy.findByText(src).should("exist");
  });

  it("renders an appTitle", () => {
    cy.mount(
      <Logo
        src={src}
        appTitle={appTitle}
        LogoImageComponent={CustomLogoImage}
      />
    );
    cy.findByText(appTitle).should("exist");
  });
});
