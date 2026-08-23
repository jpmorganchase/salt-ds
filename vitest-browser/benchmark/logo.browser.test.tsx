import { Text } from "@salt-ds/core";
import { Logo, LogoImage, LogoSeparator } from "@salt-ds/lab";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "../render";

const appTitle = "Test App Title";
const src = "test-src.svg";

describe("GIVEN a logo", () => {
  it("renders an image", async () => {
    await renderWithSalt(
      <Logo>
        <LogoImage src={src} alt="Logo image" />
        <Text>{appTitle}</Text>
      </Logo>,
    );
    await expect
      .element(page.getByRole("img", { name: "Logo image" }))
      .toBeInTheDocument();
  });

  it("renders a separator", async () => {
    await renderWithSalt(
      <Logo>
        <LogoImage src={src} alt="Logo image" />
        <LogoSeparator data-testid="logo-separator" />
        <Text>{appTitle}</Text>
      </Logo>,
    );
    await expect.element(page.getByTestId("logo-separator")).toBeInTheDocument();
  });

  it("renders an app title", async () => {
    await renderWithSalt(
      <Logo>
        <LogoImage src={src} alt="Logo image" />
        <Text>{appTitle}</Text>
      </Logo>,
    );
    await expect.element(page.getByText(appTitle)).toBeInTheDocument();
  });

  it("supports text instead of an image", async () => {
    await renderWithSalt(
      <Logo>
        <Text>{src}</Text>
        <LogoSeparator data-testid="logo-separator" />
        <Text>{appTitle}</Text>
      </Logo>,
    );

    await expect.element(page.getByText(src)).toBeInTheDocument();
    await expect.element(page.getByTestId("logo-separator")).toBeInTheDocument();
  });
});
