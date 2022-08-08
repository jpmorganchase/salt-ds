import { render, screen } from "@testing-library/react";
import { Logo } from "../../logo";

const CustomLogoImage = ({ src }: any) => <div>{src}</div>;

describe("GIVEN a logo", () => {
  const appTitle = "Test App Title";
  const src = "test-src.svg";

  beforeEach(() => {
    render(
      <Logo
        src={src}
        appTitle={appTitle}
        LogoImageComponent={CustomLogoImage}
      />
    );
  });

  test("logo image is rendered", () => {
    expect(screen.getByText(src)).toBeInTheDocument();
  });

  test("appTitle is rendered", () => {
    expect(screen.getByText(appTitle)).toBeInTheDocument();
  });
});
