import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  InteractableCard,
  LinkCard,
} from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { Fragment, useState } from "react";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as cardStories from "~stories/card/card.stories";

const composedStories = composeStories(cardStories);
const { Default } = composedStories;

function DynamicCard() {
  const [showContent, setShowContent] = useState(true);

  return (
    <>
      <button type="button" onClick={() => setShowContent((value) => !value)}>
        Toggle content
      </button>
      <Card data-testid="dynamic-card">
        {showContent ? (
          <CardContent>Content</CardContent>
        ) : (
          <span>Plain child</span>
        )}
      </Card>
    </>
  );
}

function DynamicMultipleSectionsCard() {
  const [showFooter, setShowFooter] = useState(true);

  return (
    <>
      <button type="button" onClick={() => setShowFooter((value) => !value)}>
        Toggle footer
      </button>
      <Card data-testid="multiple-sections-card">
        <CardContent>Content</CardContent>
        {showFooter && <CardFooter>Footer</CardFooter>}
      </Card>
    </>
  );
}

function WrappedContent() {
  return <CardContent>Wrapped content</CardContent>;
}

describe("Given a Card", () => {
  checkAccessibility(composedStories);

  it("renders children", async () => {
    await renderWithSalt(<Default />);
    await expect
      .element(page.getByText("Sustainable investing products"))
      .toBeVisible();
    await expect
      .element(
        page.getByText(
          "We have a commitment to provide a wide range of investment solutions to enable you to align your financial goals to your values.",
        ),
      )
      .toBeVisible();
  });

  it("applies hover styling when hoverable", async () => {
    await renderWithSalt(<Card data-testid="hoverable-card" hoverable />);
    const card = page.getByTestId("hoverable-card");

    await expect.element(card).toHaveClass("saltCard-hoverable");
  });

  it("applies sectioned layout for direct sections", async () => {
    await renderWithSalt(
      <Card data-testid="card">
        <CardContent>Content</CardContent>
      </Card>,
    );
    const card = page.getByTestId("card");

    await expect.element(card).toHaveClass("saltCard-sectioned");
    card.element().classList.remove("saltCard-sectioned");
    expect(getComputedStyle(card.element()).display).toBe("flex");
    expect(getComputedStyle(card.element()).paddingTop).toBe("0px");
  });

  it("updates sectioned layout when direct sections change", async () => {
    await renderWithSalt(<DynamicCard />);
    const card = page.getByTestId("dynamic-card");

    await expect.element(card).toHaveClass("saltCard-sectioned");
    await page.getByRole("button", { name: "Toggle content" }).click();
    await expect.element(card).not.toHaveClass("saltCard-sectioned");
  });

  it("keeps sectioned layout while any direct section remains", async () => {
    await renderWithSalt(<DynamicMultipleSectionsCard />);
    const card = page.getByTestId("multiple-sections-card");

    await expect.element(card).toHaveClass("saltCard-sectioned");
    await page.getByRole("button", { name: "Toggle footer" }).click();
    await expect.element(card).toHaveClass("saltCard-sectioned");
  });

  it("only detects exact direct section components", async () => {
    await renderWithSalt(
      <>
        <Card data-testid="wrapped-card">
          <WrappedContent />
        </Card>
        <Card data-testid="fragment-card">
          <Fragment key="content">
            <CardContent>Fragment content</CardContent>
          </Fragment>
        </Card>
      </>,
    );

    await expect
      .element(page.getByTestId("wrapped-card"))
      .not.toHaveClass("saltCard-sectioned");
    await expect
      .element(page.getByTestId("fragment-card"))
      .not.toHaveClass("saltCard-sectioned");
  });

  it("collapses padding between adjacent sections", async () => {
    await renderWithSalt(
      <Card>
        <CardHeader data-testid="header">Header</CardHeader>
        <CardContent data-testid="content">Content</CardContent>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>,
    );

    expect(
      getComputedStyle(page.getByTestId("header").element()).paddingTop,
    ).not.toBe("0px");
    expect(
      getComputedStyle(page.getByTestId("content").element()).paddingTop,
    ).toBe("0px");
    expect(
      getComputedStyle(page.getByTestId("footer").element()).paddingTop,
    ).toBe("0px");
  });

  it("keeps section padding around a full-bleed child", async () => {
    await renderWithSalt(
      <Card>
        <CardHeader>Header</CardHeader>
        <img
          alt=""
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E"
        />
        <CardContent data-testid="content">Content</CardContent>
      </Card>,
    );

    expect(
      getComputedStyle(page.getByTestId("content").element()).paddingTop,
    ).not.toBe("0px");
  });

  it("pins a footer when content is omitted", async () => {
    await renderWithSalt(
      <Card data-testid="card" style={{ height: 300, width: 200 }}>
        <CardHeader>Header</CardHeader>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>,
    );

    const cardBottom = page
      .getByTestId("card")
      .element()
      .getBoundingClientRect().bottom;
    const footerBottom = page
      .getByTestId("footer")
      .element()
      .getBoundingClientRect().bottom;
    expect(cardBottom - footerBottom).toBeLessThan(2);
  });

  it("stretches raw media to the card edges", async () => {
    await renderWithSalt(
      <Card data-testid="card" style={{ width: 260 }}>
        <img
          alt=""
          data-testid="media"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E"
        />
        <CardContent>Content</CardContent>
      </Card>,
    );

    expect(
      page.getByTestId("media").element().getBoundingClientRect().width,
    ).toBeCloseTo(
      (page.getByTestId("card").element() as HTMLElement).clientWidth,
      0,
    );
  });

  it("supports sections in link and interactable cards", async () => {
    await renderWithSalt(
      <>
        <LinkCard data-testid="link-card" href="#">
          <CardHeader>Link header</CardHeader>
          <CardContent>Link content</CardContent>
        </LinkCard>
        <InteractableCard data-testid="interactable-card">
          <CardHeader>Interactable header</CardHeader>
          <CardContent>Interactable content</CardContent>
        </InteractableCard>
      </>,
    );

    const linkCard = page.getByTestId("link-card");
    await expect.element(linkCard).toHaveClass("saltLinkCard-sectioned");
    linkCard.element().classList.remove("saltLinkCard-sectioned");
    expect(getComputedStyle(linkCard.element()).paddingTop).toBe("0px");

    const interactableCard = page.getByTestId("interactable-card");
    await expect
      .element(interactableCard)
      .toHaveClass("saltInteractableCard-sectioned");
    interactableCard
      .element()
      .classList.remove("saltInteractableCard-sectioned");
    expect(getComputedStyle(interactableCard.element()).paddingTop).toBe("0px");
  });
});
