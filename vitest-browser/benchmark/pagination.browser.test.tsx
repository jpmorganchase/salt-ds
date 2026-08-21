import {
  CompactInput,
  CompactPaginator,
  GoToInput,
  Pagination,
  Paginator,
} from "@salt-ds/core";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { renderWithSalt } from "../render";

const pageButton = (number: number) =>
  page.getByRole("button", { name: new RegExp(`Page ${number}`, "i") });
const textbox = () => page.getByRole("textbox");

async function expectCurrent(number: number) {
  await expect
    .element(pageButton(number).first())
    .toHaveAttribute("aria-current", "page");
}

async function renderDefault(defaultPage = 3, onPageChange = vi.fn()) {
  await renderWithSalt(
    <Pagination
      count={10}
      defaultPage={defaultPage}
      onPageChange={onPageChange}
    >
      <Paginator />
    </Pagination>,
  );
  return onPageChange;
}

async function renderCompact(
  defaultPage = 3,
  onPageChange = vi.fn(),
  withInput = false,
) {
  await renderWithSalt(
    <Pagination
      count={10}
      defaultPage={defaultPage}
      onPageChange={onPageChange}
    >
      <CompactPaginator>
        {withInput ? <CompactInput /> : undefined}
      </CompactPaginator>
    </Pagination>,
  );
  return onPageChange;
}

async function press(locator: ReturnType<typeof page.getByRole>) {
  (await locator.element()).focus();
  await userEvent.keyboard("{Enter}");
}

describe("GIVEN an Pagination", () => {
  describe("WHEN Default variant", () => {
    it("SHOULD not display when count is 1", async () => {
      await renderWithSalt(
        <Pagination count={1}>
          <Paginator />
        </Pagination>,
      );
      await expect
        .element(page.getByRole("navigation"))
        .not.toBeInTheDocument();
      await expect.element(pageButton(1)).not.toBeInTheDocument();
      await expect
        .element(page.getByRole("button", { name: "Previous Page" }))
        .not.toBeInTheDocument();
      await expect
        .element(page.getByRole("button", { name: "Next Page" }))
        .not.toBeInTheDocument();
    });

    it("THEN should disable the previous button on the first page", async () => {
      await renderDefault(1);
      await expectCurrent(1);
      await expect
        .element(page.getByRole("button", { name: "Previous Page" }))
        .toBeDisabled();
    });

    it("THEN should disable the next button on the last page", async () => {
      await renderDefault(10);
      await expectCurrent(10);
      await expect
        .element(page.getByRole("button", { name: "Next Page" }))
        .toBeDisabled();
    });

    it("THEN should move to the next page when clicked", async () => {
      const spy = await renderDefault();
      await expectCurrent(3);
      await pageButton(4).click();
      await expectCurrent(4);
      expect(spy).toHaveBeenCalledOnce();
    });

    it("THEN should move to the previous page when clicked", async () => {
      const spy = await renderDefault();
      await expectCurrent(3);
      await pageButton(2).click();
      await expectCurrent(2);
      expect(spy).toHaveBeenCalledOnce();
    });

    it("THEN should move to a clicked paginator item", async () => {
      const spy = await renderDefault();
      await expectCurrent(3);
      await pageButton(5).click();
      await expectCurrent(5);
      expect(spy).toHaveBeenCalledOnce();
    });

    it("THEN should move to the next page from the arrow button", async () => {
      const spy = await renderDefault();
      await page.getByRole("button", { name: "Next Page" }).click();
      await expectCurrent(4);
      expect(spy).toHaveBeenCalledOnce();
    });

    it("THEN should move to the previous page using keyboard", async () => {
      const spy = await renderDefault();
      await press(page.getByRole("button", { name: "Previous Page" }));
      await expectCurrent(2);
      expect(spy).toHaveBeenCalledOnce();
    });

    it("THEN should move to a selected page using keyboard", async () => {
      const spy = await renderDefault();
      await press(pageButton(5));
      await expectCurrent(5);
      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe("WHEN Compact variant", () => {
    it("THEN should move to the next page", async () => {
      const spy = await renderCompact();
      await expect
        .element(page.getByText("3", { exact: true }))
        .toBeInTheDocument();
      await page.getByRole("button", { name: "Next Page" }).click();
      await expect
        .element(page.getByText("4", { exact: true }))
        .toBeInTheDocument();
      expect(spy).toHaveBeenCalledOnce();
    });

    it("THEN should move to the previous page", async () => {
      const spy = await renderCompact();
      await page.getByRole("button", { name: "Previous Page" }).click();
      await expect
        .element(page.getByText("2", { exact: true }))
        .toBeInTheDocument();
      expect(spy).toHaveBeenCalledOnce();
    });

    it("THEN should move to the last page", async () => {
      const spy = await renderCompact();
      expect(
        await page.getByText("10", { exact: true }).elements(),
      ).toHaveLength(1);
      await pageButton(10).click();
      await expect
        .poll(
          async () =>
            (await page.getByText("10", { exact: true }).elements()).length,
        )
        .toBe(2);
      expect(spy).toHaveBeenCalledOnce();
    });

    it("THEN should move to the next page using keyboard", async () => {
      const spy = await renderCompact(1);
      await press(page.getByRole("button", { name: "Next Page" }));
      await expect
        .element(page.getByText("2", { exact: true }))
        .toBeInTheDocument();
      expect(spy).toHaveBeenCalledOnce();
    });

    it("THEN should move to the previous page using keyboard", async () => {
      const spy = await renderCompact();
      await press(page.getByRole("button", { name: "Previous Page" }));
      await expect
        .element(page.getByText("2", { exact: true }))
        .toBeInTheDocument();
      expect(spy).toHaveBeenCalledOnce();
    });

    it("THEN should move to the last page using keyboard", async () => {
      const spy = await renderCompact();
      await press(pageButton(10));
      await expect
        .poll(
          async () =>
            (await page.getByText("10", { exact: true }).elements()).length,
        )
        .toBe(2);
      expect(spy).toHaveBeenCalledOnce();
    });

    it("SHOULD reset the input to the current page on blur", async () => {
      const spy = await renderCompact(3, vi.fn(), true);
      const input = textbox();
      await input.click();
      const inputElement = (await input.element()) as HTMLInputElement;
      inputElement.setSelectionRange(
        inputElement.value.length,
        inputElement.value.length,
      );
      await userEvent.keyboard("4");
      await expect.element(input).toHaveValue("34");
      inputElement.blur();
      await expect.element(input).toHaveValue("3");
      expect(spy).not.toHaveBeenCalled();
    });

    it("SHOULD go to the page from input when enter is pressed", async () => {
      const spy = await renderCompact(3, vi.fn(), true);
      const input = textbox();
      await input.click();
      const inputElement = (await input.element()) as HTMLInputElement;
      inputElement.setSelectionRange(
        inputElement.value.length,
        inputElement.value.length,
      );
      await userEvent.keyboard("{Backspace}4{Enter}");
      await expect.element(input).toHaveValue("4");
      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe("WHEN siblingCount", () => {
    it("THEN should render 11 buttons when the count is 11", async () => {
      await renderWithSalt(
        <Pagination count={11}>
          <Paginator siblingCount={3} />
        </Pagination>,
      );
      expect(
        await page.getByRole("button", { name: /^Page.*/ }).elements(),
      ).toHaveLength(11);
    });

    it("THEN should render 10 buttons when the count is 12", async () => {
      await renderWithSalt(
        <Pagination count={12}>
          <Paginator siblingCount={3} />
        </Pagination>,
      );
      expect(
        await page.getByRole("button", { name: /^Page.*/ }).elements(),
      ).toHaveLength(10);
    });
  });

  describe("WHEN boundaryCount", () => {
    it("THEN should render 10 buttons when the count is 20", async () => {
      await renderWithSalt(
        <Pagination count={20}>
          <Paginator boundaryCount={2} />
        </Pagination>,
      );
      expect(
        await page.getByRole("button", { name: /^Page.*/ }).elements(),
      ).toHaveLength(10);
    });

    it("THEN should render 9 buttons when the count is 20 and initial page is 10", async () => {
      await renderWithSalt(
        <Pagination count={20} defaultPage={10}>
          <Paginator boundaryCount={2} />
        </Pagination>,
      );
      expect(
        await page.getByRole("button", { name: /^Page.*/ }).elements(),
      ).toHaveLength(9);
    });
  });

  describe("WHEN using the GoToInput", () => {
    async function renderGoTo(inputFirst = true) {
      await renderWithSalt(
        <Pagination count={10} defaultPage={3}>
          {inputFirst && <GoToInput />}
          <Paginator data-testid="paginator" />
          {!inputFirst && <GoToInput />}
        </Pagination>,
      );
    }

    it("SHOULD render on the left if GoToInput is before Paginator", async () => {
      await renderGoTo();
      const input = await textbox().element();
      const paginator = await page.getByTestId("paginator").element();
      expect(
        input.compareDocumentPosition(paginator) &
          Node.DOCUMENT_POSITION_PRECEDING,
      ).toBe(0);
    });

    it("SHOULD render on the right if GoToInput is after Paginator", async () => {
      await renderGoTo(false);
      const input = await textbox().element();
      const paginator = await page.getByTestId("paginator").element();
      expect(
        input.compareDocumentPosition(paginator) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBe(0);
    });

    it("SHOULD accept any value", async () => {
      await renderGoTo();
      const input = textbox();
      await input.fill("abc");
      await expect.element(input).toHaveValue("abc");
      await input.fill("-2");
      await expect.element(input).toHaveValue("-2");
      await input.fill("200");
      await expect.element(input).toHaveValue("200");
    });

    it("SHOULD not change page when the value is invalid", async () => {
      await renderGoTo();
      await expectCurrent(3);
      await textbox().fill("abc");
      await userEvent.keyboard("{Enter}");
      await expectCurrent(3);
    });

    it("SHOULD change page when the value is valid", async () => {
      await renderGoTo();
      await textbox().fill("5");
      await userEvent.keyboard("{Enter}");
      await expectCurrent(5);
    });

    it("SHOULD clear on blur", async () => {
      await renderGoTo();
      const input = textbox();
      await input.fill("5");
      (await input.element()).blur();
      await expect.element(input).toHaveValue("");
    });
  });
});
